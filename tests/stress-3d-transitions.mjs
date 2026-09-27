/**
 * Empirical Stress Test Suite: 3D Transition & State Machine
 * Challenger 2 (Empirical Challenger)
 *
 * Verifies in real headless Google Chrome via CDP:
 * 1. Rapid hash toggling between '#' and '#book' (both programmatic and UI clicks)
 * 2. Browser history: forward, back, reload on '#book', reload on '#'
 * 3. Scroll restoration: scroll to 2500px, transition to '#book', click '← На сайт Alina Tarot Energy', verify scroll restored to 2500px
 * 4. Keyboard events: press Escape key while in '#book', verify returns to portal; test ServiceModal escape handling
 * 5. 3D canvas lifecycle, WebGL context stability & memory leak verification over 25 repeated transitions
 *
 * Run command:
 *   node tests/stress-3d-transitions.mjs
 */

import assert from 'node:assert/strict'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.resolve(ROOT_DIR, 'dist')

const HTTP_PORT = 4398
const CDP_PORT = 9448

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
}

let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures = []
const consoleErrors = []

function logHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}   ${title}   ${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}\n`)
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.magenta}▶ ${title}${colors.reset}`)
}

async function recordTest(suite, title, fn) {
  totalTests++
  try {
    await fn()
    passedTests++
    console.log(`  ${colors.green}✓${colors.reset} ${colors.gray}[${suite}]${colors.reset} ${title}`)
  } catch (err) {
    failedTests++
    failures.push({ suite, title, error: err })
    console.log(`  ${colors.red}✗${colors.reset} ${colors.gray}[${suite}]${colors.reset} ${title}`)
    console.log(`    ${colors.red}${err.stack || err.message}${colors.reset}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC HTTP SERVER
// ─────────────────────────────────────────────────────────────────────────────

function createStaticServer() {
  const mimeMap = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
  }

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0]
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html'

    const filePath = path.join(DIST_DIR, reqPath)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(reqPath)
      // Only serve index.html for extension-less routes or html requests
      if (!ext || ext === '.html') {
        const indexPath = path.join(DIST_DIR, 'index.html')
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        fs.createReadStream(indexPath).pipe(res)
        return
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = mimeMap[ext] || 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    })
    fs.createReadStream(filePath).pipe(res)
  })

  return server
}

// ─────────────────────────────────────────────────────────────────────────────
// CDP CLIENT WRAPPER OVER NATIVE WEBSOCKET
// ─────────────────────────────────────────────────────────────────────────────

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.ws = null
    this.msgId = 1
    this.pending = new Map()
    this.eventListeners = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = (e) => reject(new Error(`WebSocket connection error: ${e}`))
    })

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) {
          reject(new Error(`CDP Error (${msg.error.code}): ${msg.error.message}`))
        } else {
          resolve(msg.result)
        }
      } else if (msg.method) {
        const listeners = this.eventListeners.get(msg.method) || []
        for (const fn of listeners) {
          try {
            fn(msg.params)
          } catch (e) {
            console.error('Error in CDP event listener:', e)
          }
        }
      }
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(handler)
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    })
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text
      throw new Error(`Evaluation failed for "${expression}": ${desc}`)
    }
    return res.result?.value
  }

  async close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEST HARNESS
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  logHeader('3D TRANSITION & STATE MACHINE EMPIRICAL STRESS SUITE')

  // Verify dist directory exists
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error(`${colors.red}Error: dist/index.html not found. Run 'npm run build' first.${colors.reset}`)
    process.exit(1)
  }

  // Start HTTP server
  const server = createStaticServer()
  await new Promise((resolve) => server.listen(HTTP_PORT, resolve))
  console.log(`  [Server] Static build server listening on http://127.0.0.1:${HTTP_PORT}`)

  // Launch Google Chrome headless with native WebGL enabled (NO --disable-gpu)
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  const chromeArgs = [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,900',
    `http://127.0.0.1:${HTTP_PORT}/`
  ]

  const chromeProc = spawn(chromePath, chromeArgs, { stdio: 'ignore' })

  // Clean shutdown handlers
  let cleanedUp = false
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    try {
      chromeProc.kill('SIGTERM')
    } catch {}
    try {
      server.close()
    } catch {}
  }
  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(1)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(1)
  })

  // Poll for Chrome CDP readiness
  let pageTab = null
  for (let attempt = 0; attempt < 25; attempt++) {
    await new Promise((r) => setTimeout(r, 200))
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`)
      const tabs = await res.json()
      pageTab = tabs.find((t) => t.type === 'page' && t.url.includes(String(HTTP_PORT))) || tabs.find((t) => t.type === 'page')
      if (pageTab?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!pageTab?.webSocketDebuggerUrl) {
    console.error(`${colors.red}Failed to connect to Chrome CDP within timeout.${colors.reset}`)
    cleanup()
    process.exit(1)
  }

  console.log(`  [Chrome] Connected to Chrome tab: "${pageTab.title}"`)
  const cdp = new CDPClient(pageTab.webSocketDebuggerUrl)
  await cdp.connect()

  // Enable CDP domains
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Console.enable')

  // Capture console errors and exceptions
  cdp.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      const text = params.args.map((a) => a.value || a.description || '').join(' ')
      consoleErrors.push(text)
    }
  })
  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails.text + ' ' + (params.exceptionDetails.exception?.description || ''))
  })

  // Wait for initial page hydration
  await new Promise((r) => setTimeout(r, 600))

  // ─────────────────────────────────────────────────────────────────────────
  // SUITE 1: RAPID HASH TOGGLING STRESS TEST
  // ─────────────────────────────────────────────────────────────────────────
  logSection('SUITE 1: Rapid Hash Toggling Stress Test')

  await recordTest('SUITE 1', '1.1: Rapid programmatic hash switching (#book <-> empty, 40 iterations)', async () => {
    for (let i = 0; i < 40; i++) {
      await cdp.evaluate(`window.location.hash = '${i % 2 === 0 ? 'book' : ''}'`)
      await new Promise((r) => setTimeout(r, 15))
    }
    await cdp.evaluate("window.location.hash = ''")
    await new Promise((r) => setTimeout(r, 150))

    const hash = await cdp.evaluate('window.location.hash')
    const hasPortal = await cdp.evaluate("document.querySelector('.lx') !== null")
    const isPortalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )
    const hasBookCanvas = await cdp.evaluate("document.querySelector('.stage canvas') !== null")

    assert.equal(hash, '', 'Hash should be empty')
    assert.ok(hasPortal, 'Portal layout should exist in DOM')
    assert.ok(isPortalVisible, 'Portal layout should be visible')
    assert.equal(hasBookCanvas, false, '3D Canvas should be unmounted when on portal')
  })

  await recordTest('SUITE 1', '1.2: Rapid programmatic hash switching (#book <-> #, 40 iterations)', async () => {
    for (let i = 0; i < 40; i++) {
      await cdp.evaluate(`window.location.hash = '${i % 2 === 0 ? '#book' : '#'}'`)
      await new Promise((r) => setTimeout(r, 15))
    }
    await cdp.evaluate("window.location.hash = '#'")
    await new Promise((r) => setTimeout(r, 150))

    const isPortalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )
    const hasBookCanvas = await cdp.evaluate("document.querySelector('.stage canvas') !== null")

    assert.ok(isPortalVisible, 'Portal should be visible after rapid # hash toggling')
    assert.equal(hasBookCanvas, false, 'Canvas should be clean')
  })

  await recordTest('SUITE 1', '1.3: Rapid UI button clicks: Open Book -> Return Button (15 alternating cycles)', async () => {
    await cdp.evaluate(`
      window.history.pushState(null, '', window.location.pathname);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    `)
    await new Promise((r) => setTimeout(r, 100))

    for (let i = 0; i < 15; i++) {
      // Click open book button (in header or banner)
      const openSuccess = await cdp.evaluate(`(() => {
        const btn = document.querySelector('.lx-hero__cta .lx-link');
        if (btn) { btn.click(); return true; }
        return false;
      })()`)
      assert.ok(openSuccess, 'Should find open book link in the prologue (.lx-hero__cta .lx-link)')
      await new Promise((r) => setTimeout(r, 80))

      // Verify book view active
      const inBook = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
      assert.ok(inBook, `Iteration ${i}: Book overlay should be mounted`)

      // Click return button «← На сайт Alina Tarot Energy»
      const backSuccess = await cdp.evaluate(`(() => {
        const backBtn = document.querySelector('.book-navbar-overlay__back-btn');
        if (backBtn) { backBtn.click(); return true; }
        return false;
      })()`)
      assert.ok(backSuccess, 'Should find return button in BookNavbarOverlay')
      await new Promise((r) => setTimeout(r, 80))

      // Verify portal view active
      const inPortal = await cdp.evaluate(
        "!!document.querySelector('.lx-hero')"
      )
      assert.ok(inPortal, `Iteration ${i}: Portal should be visible after return`)
    }
  })

  await recordTest('SUITE 1', '1.4: Verify zero unhandled exceptions after rapid toggling stress', () => {
    assert.equal(consoleErrors.length, 0, `Encountered console errors: ${consoleErrors.join('; ')}`)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SUITE 2: BROWSER HISTORY TRAVERSAL & RELOAD SCENARIOS
  // ─────────────────────────────────────────────────────────────────────────
  logSection('SUITE 2: Browser History Traversal & Reload Scenarios')

  await recordTest('SUITE 2', '2.1: Navigation history chain: Portal -> #book -> history.back() -> history.forward()', async () => {
    await cdp.evaluate("window.history.pushState(null, '', window.location.pathname)")
    await cdp.evaluate("window.dispatchEvent(new HashChangeEvent('hashchange'))")
    await new Promise((r) => setTimeout(r, 100))

    // 1. Open book via setting hash
    await cdp.evaluate("window.location.hash = 'book'")
    await new Promise((r) => setTimeout(r, 200))
    const inBook1 = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
    assert.ok(inBook1, 'Should enter book mode on hash=book')

    // 2. Browser back
    await cdp.evaluate('window.history.back()')
    await new Promise((r) => setTimeout(r, 200))
    const hashAfterBack = await cdp.evaluate('window.location.hash')
    const inPortalAfterBack = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )
    assert.ok(hashAfterBack === '' || hashAfterBack === '#', `Hash should be cleared, got: ${hashAfterBack}`)
    assert.ok(inPortalAfterBack, 'Portal layout should be active after history.back()')

    // 3. Browser forward
    await cdp.evaluate('window.history.forward()')
    await new Promise((r) => setTimeout(r, 200))
    const hashAfterFwd = await cdp.evaluate('window.location.hash')
    const inBookAfterFwd = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
    assert.equal(hashAfterFwd, '#book', 'Hash should be #book after forward')
    assert.ok(inBookAfterFwd, 'Book overlay should be active after history.forward()')

    // Clean return
    await cdp.evaluate("document.querySelector('.book-navbar-overlay__back-btn').click()")
    await new Promise((r) => setTimeout(r, 100))
  })

  await recordTest('SUITE 2', '2.2: Cold page reload directly on "#book" URL', async () => {
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/#book` })
    await new Promise((r) => setTimeout(r, 600))

    const hash = await cdp.evaluate('window.location.hash')
    const hasOverlay = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
    const titleText = await cdp.evaluate("document.querySelector('.book-navbar-overlay__title')?.innerText")
    const hasCanvas = await cdp.evaluate("document.querySelector('.stage canvas') !== null")

    assert.equal(hash, '#book', 'Hash must be #book')
    assert.ok(hasOverlay, 'BookNavbarOverlay should render directly on cold reload of #book')
    assert.equal(titleText, '✦ АРХЕТИПЫ И ТЕНИ ✦', 'Title text matches')
    assert.ok(hasCanvas, '3D Canvas should be mounted on cold load of #book')
  })

  await recordTest('SUITE 2', '2.3: Cold page reload directly on base portal URL ("/")', async () => {
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` })
    await new Promise((r) => setTimeout(r, 600))

    const hash = await cdp.evaluate('window.location.hash')
    const isPortalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )
    const hasCanvas = await cdp.evaluate("document.querySelector('.stage canvas') !== null")

    assert.ok(hash === '' || hash === '#', 'Hash should be empty on portal')
    assert.ok(isPortalVisible, 'Portal layout should render directly on cold load of /')
    assert.equal(hasCanvas, false, 'Canvas should NOT be mounted on portal')
  })

  await recordTest('SUITE 2', '2.4: Multi-step history stack: 5 transitions with sequential back-and-forth traversal', async () => {
    for (let step = 0; step < 3; step++) {
      await cdp.evaluate("window.location.hash = 'book'")
      await new Promise((r) => setTimeout(r, 120))
      await cdp.evaluate("window.location.hash = ''")
      await new Promise((r) => setTimeout(r, 120))
    }

    for (let b = 0; b < 4; b++) {
      await cdp.evaluate('window.history.back()')
      await new Promise((r) => setTimeout(r, 150))
      const h = await cdp.evaluate('window.location.hash')
      const inBook = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
      const expectedInBook = h === '#book'
      assert.equal(inBook, expectedInBook, `History back mismatch at step ${b}: hash=${h}, inBook=${inBook}`)
    }

    for (let f = 0; f < 4; f++) {
      await cdp.evaluate('window.history.forward()')
      await new Promise((r) => setTimeout(r, 150))
      const h = await cdp.evaluate('window.location.hash')
      const inBook = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
      const expectedInBook = h === '#book'
      assert.equal(inBook, expectedInBook, `History forward mismatch at step ${f}: hash=${h}, inBook=${inBook}`)
    }
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SUITE 3: SCROLL RESTORATION ACCURACY
  // ─────────────────────────────────────────────────────────────────────────
  // Книга — отдельный лениво загружаемый чанк: ждём появления элементов, а не фиксированные 200 мс
  const waitFor = async (expr, timeout = 8000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await cdp.evaluate(`!!(${expr})`)) return true
      await new Promise((r) => setTimeout(r, 50))
    }
    return false
  }

  logSection('SUITE 3: Scroll Restoration Accuracy')

  await recordTest('SUITE 3', '3.1: Scroll to 2500px -> transition to #book -> click return -> verify scroll restored to 2500px', async () => {
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` })
    await new Promise((r) => setTimeout(r, 500))

    // Set scroll position to 2500px
    await cdp.evaluate('window.scrollTo(0, 2500);')
    await new Promise((r) => setTimeout(r, 100))

    const initialScrollY = await cdp.evaluate('window.scrollY')
    assert.ok(
      Math.abs(initialScrollY - 2500) <= 5,
      `Initial scroll position should be ~2500, got ${initialScrollY}`
    )

    // Click header button to transition to #book
    const openClicked = await cdp.evaluate(`(() => {
      const btn = document.querySelector('.lx-hero__cta .lx-link');
      if (btn) { btn.click(); return true; }
      return false;
    })()`)
    assert.ok(openClicked, 'Found open book link (.lx-hero__cta .lx-link)')
    await waitFor("document.querySelector('.book-navbar-overlay__back-btn')")

    // Verify in book mode
    const hashInBook = await cdp.evaluate('window.location.hash')
    assert.equal(hashInBook, '#book')

    // Click «← На сайт Alina Tarot Energy»
    const backBtnClicked = await cdp.evaluate(`(() => {
      const btn = document.querySelector('.book-navbar-overlay__back-btn');
      if (btn) { btn.click(); return true; }
      return false;
    })()`)
    assert.ok(backBtnClicked, 'Found return button «← На сайт Alina Tarot Energy»')

    // Лендинг монтируется заново и восстанавливает позицию
    await waitFor("document.querySelector('.lx-hero')")
    await new Promise((r) => setTimeout(r, 300))

    const finalHash = await cdp.evaluate('window.location.hash')
    const finalScrollY = await cdp.evaluate('window.scrollY')
    const isPortalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )

    assert.equal(finalHash, '', 'Hash should be cleared on return to portal')
    assert.ok(isPortalVisible, 'Portal should be visible')
    assert.ok(
      Math.abs(finalScrollY - 2500) <= 5,
      `Scroll position was NOT restored to 2500px! Expected ~2500, got ${finalScrollY}`
    )
  })

  await recordTest('SUITE 3', '3.2: Scroll to 4200px (Pricing section) -> #book -> return -> verify scroll restored to 4200px', async () => {
    await cdp.evaluate('window.scrollTo(0, 4200)')
    await new Promise((r) => setTimeout(r, 100))

    const scrollY4200 = await cdp.evaluate('window.scrollY')
    assert.ok(Math.abs(scrollY4200 - 4200) <= 5, `Expected ~4200, got ${scrollY4200}`)

    // Open book
    await cdp.evaluate("document.querySelector('.lx-hero__cta .lx-link').click()")
    await waitFor("document.querySelector('.book-navbar-overlay__back-btn')")

    // Return to portal
    await cdp.evaluate("document.querySelector('.book-navbar-overlay__back-btn').click()")
    await waitFor("document.querySelector('.lx-hero')")
    await new Promise((r) => setTimeout(r, 300))

    const restoredY = await cdp.evaluate('window.scrollY')
    assert.ok(
      Math.abs(restoredY - 4200) <= 5,
      `Scroll position at 4200px was NOT restored! Expected ~4200, got ${restoredY}`
    )
  })

  await recordTest('SUITE 3', '3.3: Scroll position preserved in sessionStorage (alina_portal_scroll_y)', async () => {
    const savedInSession = await cdp.evaluate(
      "Number(sessionStorage.getItem('alina_portal_scroll_y') || '0')"
    )
    assert.ok(
      Math.abs(savedInSession - 4200) <= 5,
      `sessionStorage should preserve 4200, found: ${savedInSession}`
    )
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SUITE 4: KEYBOARD EVENTS (ESCAPE KEY & MODAL COEXISTENCE)
  // ─────────────────────────────────────────────────────────────────────────
  logSection('SUITE 4: Keyboard Events (Escape Key)')

  await recordTest('SUITE 4', '4.1: Pressing Escape while in #book returns to portal cleanly', async () => {
    // Enter book mode
    await cdp.evaluate("window.location.hash = 'book'")
    await new Promise((r) => setTimeout(r, 200))

    const inBook = await cdp.evaluate("document.querySelector('.book-navbar-overlay') !== null")
    assert.ok(inBook, 'Must be in book mode')

    // Dispatch Escape key via CDP Input.dispatchKeyEvent
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27
    })
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27
    })

    await new Promise((r) => setTimeout(r, 200))

    const hash = await cdp.evaluate('window.location.hash')
    const inPortal = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )
    const hasCanvas = await cdp.evaluate("document.querySelector('.stage canvas') !== null")

    assert.equal(hash, '', 'Hash should be cleared after Escape')
    assert.ok(inPortal, 'Portal should be visible after pressing Escape')
    assert.equal(hasCanvas, false, 'Canvas should be unmounted after pressing Escape')
  })

  await recordTest('SUITE 4', '4.2: Pressing Escape while on Portal without modals does not crash or navigate', async () => {
    const beforeHash = await cdp.evaluate('window.location.hash')
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27
    })
    await new Promise((r) => setTimeout(r, 100))
    const afterHash = await cdp.evaluate('window.location.hash')
    const isPortalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )

    assert.equal(beforeHash, afterHash)
    assert.ok(isPortalVisible)
  })

  await recordTest('SUITE 4', '4.3: Pressing Escape inside an open path drawer closes it and keeps the landing active', async () => {
    // Open ServiceModal by clicking on the first service card
    const opened = await cdp.evaluate(`(() => {
      const card = document.querySelector('.lx-card');
      if (card) { card.click(); return true; }
      return false;
    })()`)
    assert.ok(opened, 'Should click a path card to open the drawer')
    await new Promise((r) => setTimeout(r, 400))

    const modalVisible = await cdp.evaluate("getComputedStyle(document.querySelector('.lx-drawer')).visibility === 'visible'")
    assert.ok(modalVisible, 'Path drawer should be visible')

    // Press Escape
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27
    })
    // панель уезжает за 0,7 с
    await new Promise((r) => setTimeout(r, 1100))

    const modalAfter = await cdp.evaluate("getComputedStyle(document.querySelector('.lx-drawer')).visibility === 'visible'")
    const portalVisible = await cdp.evaluate(
      "!!document.querySelector('.lx-hero')"
    )

    assert.equal(modalAfter, false, 'Path drawer should be closed by Escape')
    assert.ok(portalVisible, 'Portal should remain active')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SUITE 5: 3D CANVAS LIFECYCLE & MEMORY LEAK STRESS TEST
  // ─────────────────────────────────────────────────────────────────────────
  logSection('SUITE 5: 3D Canvas Lifecycle & Memory Leak Stress Test')

  let initialHeap = 0
  await recordTest('SUITE 5', '5.1: Baseline JS Heap and WebGL context measurement', async () => {
    initialHeap = await cdp.evaluate('window.performance.memory ? window.performance.memory.usedJSHeapSize : 0')
    console.log(`    ${colors.gray}Initial JS Heap: ${(initialHeap / (1024 * 1024)).toFixed(2)} MB${colors.reset}`)
    assert.ok(initialHeap > 0, 'Should read JS Heap size')
  })

  await recordTest('SUITE 5', '5.2: 25 rapid mount/unmount cycles of Three.js BookScene stage', async () => {
    for (let cycle = 0; cycle < 25; cycle++) {
      // 1. Mount BookStage
      await cdp.evaluate("window.location.hash = 'book'")
      // Wait for canvas to be mounted in DOM
      let mounted = false
      for (let w = 0; w < 15; w++) {
        await new Promise((r) => setTimeout(r, 30))
        mounted = await cdp.evaluate("document.querySelector('.stage canvas') !== null")
        if (mounted) break
      }
      assert.ok(mounted, `Cycle ${cycle}: Canvas should be mounted`)

      // 2. Unmount BookStage via backToPortal
      await cdp.evaluate("document.querySelector('.book-navbar-overlay__back-btn').click()")
      await new Promise((r) => setTimeout(r, 50))

      // Verify window.__bookScene is cleaned up
      const hasSceneRef = await cdp.evaluate('typeof window.__bookScene !== "undefined"')
      assert.equal(hasSceneRef, false, `Cycle ${cycle}: window.__bookScene should be deleted after unmount`)
    }
  })

  await recordTest('SUITE 5', '5.3: WebGL Context limit check (no "Too many active WebGL contexts" crash)', async () => {
    // Mount one more time to verify WebGL context can still be acquired
    await cdp.evaluate("window.location.hash = 'book'")
    await new Promise((r) => setTimeout(r, 200))

    const isContextValid = await cdp.evaluate(`(() => {
      const canvas = document.querySelector('.stage canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl !== null && !gl.isContextLost();
    })()`)

    assert.ok(isContextValid, 'WebGL context is valid and not lost after 25 transitions!')

    // Clean unmount
    await cdp.evaluate("document.querySelector('.book-navbar-overlay__back-btn').click()")
    await new Promise((r) => setTimeout(r, 100))
  })

  await recordTest('SUITE 5', '5.4: JS Heap memory delta bounded (no runaway leak)', async () => {
    await cdp.evaluate(`
      if (window.gc) window.gc();
    `)
    await new Promise((r) => setTimeout(r, 300))

    const finalHeap = await cdp.evaluate('window.performance.memory ? window.performance.memory.usedJSHeapSize : 0')
    const deltaMB = (finalHeap - initialHeap) / (1024 * 1024)
    console.log(`    ${colors.gray}Final JS Heap: ${(finalHeap / (1024 * 1024)).toFixed(2)} MB (Delta: ${deltaMB > 0 ? '+' : ''}${deltaMB.toFixed(2)} MB)${colors.reset}`)

    assert.ok(
      deltaMB < 35,
      `Potential memory leak detected! JS Heap grew by ${deltaMB.toFixed(2)} MB over 25 cycles`
    )
  })

  await recordTest('SUITE 5', '5.5: Zero critical console errors or unhandled rejections across entire test execution', () => {
    assert.equal(
      consoleErrors.length,
      0,
      `Encountered console errors during stress suite: ${consoleErrors.join(' | ')}`
    )
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT & EXIT
  // ─────────────────────────────────────────────────────────────────────────
  logHeader('TEST EXECUTION SUMMARY')
  console.log(`  Total Automated Assertions:    ${passedTests} / ${totalTests} passed`)

  // Close CDP & processes
  await cdp.close()
  cleanup()

  if (failedTests > 0) {
    console.log(`\n${colors.bold}${colors.red}❌ FAILED TESTS (${failedTests}):${colors.reset}`)
    for (const f of failures) {
      console.log(`  - [${f.suite}] ${f.title}: ${f.error.message}`)
    }
    process.exit(1)
  } else {
    console.log(`\n${colors.bold}${colors.green}✓ ALL 3D TRANSITION & STATE MACHINE STRESS TESTS PASSED SUCCESSFULLY!${colors.reset}\n`)
    process.exit(0)
  }
}

main().catch((err) => {
  console.error(`${colors.red}Fatal error during test execution:${colors.reset}`, err)
  process.exit(1)
})
