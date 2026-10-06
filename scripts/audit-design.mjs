// Аудит дизайна лендинга: контраст, читаемость, доступность, переполнение.
// Запуск: npm run audit:design [-- --url http://localhost:5174 --shots --strict --quick --viewport mobile --theme dark --port 5199]
//
// Что проверяется (светлая и тёмная тема × 320 / 768 / 1440 px):
//  1. Контраст текста по WCAG 2.x — по реальным пикселям: текст скрывается, снимок фона
//     сэмплируется под каждым элементом, цвет текста накладывается поверх (учитывает
//     canvas-космос, градиенты и полупрозрачные фигуры). Норма: 4.5:1, крупный текст 3:1.
//  2. axe-core (WCAG 2.0/2.1/2.2 A/AA) — кроме color-contrast, его делает пункт 1.
//  3. Читаемость: размер шрифта, межстрочный интервал и длина строки абзацев.
//  4. Размер зон нажатия (WCAG 2.2: 24×24 px) и горизонтальное переполнение.
//
// Выход ≠ 0, если есть ошибки (контраст ниже нормы, serious/critical в axe, переполнение);
// предупреждения роняют запуск только с --strict. Отчёт: audit-design/report.md и report.json.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'audit-design')
const require = createRequire(import.meta.url)

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const THEMES = opt('theme') ? [opt('theme')] : ['light', 'dark']
const ALL_VIEWPORTS = [
  { name: 'mobile', width: 320, height: 700 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]
// --quick = только desktop; --viewport mobile|tablet|desktop — один размер; --theme light|dark — одна тема
const only = flag('quick') ? 'desktop' : opt('viewport')
const VIEWPORTS = only ? ALL_VIEWPORTS.filter((v) => v.name === only) : ALL_VIEWPORTS

const LIMITS = {
  contrastText: 4.5,
  contrastLarge: 3,
  fontWarn: 12,
  lineHeightMin: 1.4,
  lineLengthMax: 90,
  targetMin: 24,
}

// ── Сервер ────────────────────────────────────────────────────────────────────
async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // сервер ещё не поднялся
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Сервер ${url} не ответил за ${timeoutMs / 1000} с`)
}

/** Свободный порт: параллельные запуски (несколько worktree) не должны драться за один. */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.once('error', reject)
    srv.listen(0, () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function ensureServer() {
  const given = opt('url')
  if (given) return { url: given, stop: () => {} }
  const port = Number(opt('port')) || (await freePort())
  const url = `http://localhost:${port}`
  const vite = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  const child = spawn(process.execPath, [vite, '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  })
  await waitForServer(url)
  return { url, stop: () => child.kill() }
}

// ── Браузер ───────────────────────────────────────────────────────────────────
function chromiumPath() {
  const env = process.env.CHROMIUM_PATH
  if (env && existsSync(env)) return env
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (base && existsSync(base)) {
    // ревизия в имени папки (chromium-1194) у разных версий playwright разная
    const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d))
    const exe = dir && join(base, dir, 'chrome-linux', 'chrome')
    if (exe && existsSync(exe)) return exe
  }
  return undefined // playwright сам найдёт свой браузер
}

// ── Код, исполняемый внутри страницы ──────────────────────────────────────────
/** Собирает текстовые элементы в окне просмотра: цвет, размер, прямоугольник. */
function collectTextTargets() {
  const out = []
  const vh = window.innerHeight
  const vw = window.innerWidth
  const pathOf = (el) => {
    const parts = []
    for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase()
      if (n.id) s += `#${n.id}`
      else if (typeof n.className === 'string' && n.className.trim())
        s += `.${n.className.trim().split(/\s+/).slice(0, 2).join('.')}`
      parts.unshift(s)
    }
    return parts.join(' > ')
  }
  const parseColor = (str) => {
    const m = str.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.replace(/\s+/g, ' ').trim()
    if (text.length < 2) continue
    const el = node.parentElement
    if (!el || seen.has(el) || el.closest('script,style,noscript,canvas,svg')) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    // эффективная прозрачность по цепочке предков
    let opacity = 1
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      opacity *= Number(getComputedStyle(n).opacity)
    }
    if (opacity < 0.02) continue
    const range = document.createRange()
    range.selectNodeContents(node)
    const rects = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1)
    if (!rects.length) continue
    const rect = rects[0]
    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) continue
    const fill = cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? cs.webkitTextFillColor : cs.color
    const color = parseColor(fill)
    if (!color || color.a * opacity < 0.02) continue
    // градиентный текст (background-clip:text) проверить по цвету нельзя
    if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') continue
    seen.add(el)
    el.setAttribute('data-audit-id', String(out.length))
    out.push({
      id: out.length,
      path: pathOf(el),
      text: text.slice(0, 60),
      color,
      opacity,
      fontSize: parseFloat(cs.fontSize),
      fontWeight: Number(cs.fontWeight) || 400,
      rects: rects.slice(0, 3).map((r) => ({ x: r.left, y: r.top, w: r.width, h: r.height })),
    })
  }
  return out
}

/** Считает контраст по пикселям снимка без текста. */
async function measureContrast({ shot, targets, vw, vh }) {
  const img = new Image()
  img.src = shot
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const sx = img.width / vw
  const sy = img.height / vh
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const ratio = (a, b) => {
    const [hi, lo] = lum(a) > lum(b) ? [a, b] : [b, a]
    return (lum(hi) + 0.05) / (lum(lo) + 0.05)
  }
  return targets.map((t) => {
    const alpha = t.color.a * t.opacity
    const samples = []
    for (const rc of t.rects) {
      const x0 = Math.max(0, Math.floor(rc.x * sx))
      const y0 = Math.max(0, Math.floor(rc.y * sy))
      const x1 = Math.min(img.width, Math.ceil((rc.x + rc.w) * sx))
      const y1 = Math.min(img.height, Math.ceil((rc.y + rc.h) * sy))
      if (x1 <= x0 || y1 <= y0) continue
      const w = x1 - x0
      const h = y1 - y0
      const data = ctx.getImageData(x0, y0, w, h).data
      const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 150)))
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
        }
      }
    }
    if (!samples.length) return { id: t.id, ratio: null }
    const ratios = samples
      .map((bg) =>
        ratio(
          {
            r: t.color.r * alpha + bg.r * (1 - alpha),
            g: t.color.g * alpha + bg.g * (1 - alpha),
            b: t.color.b * alpha + bg.b * (1 - alpha),
          },
          bg,
        ),
      )
      .sort((a, b) => a - b)
    // 10-й перцентиль: терпимо к единичным пикселям, но ловит реально плохой фон
    const p10 = ratios[Math.floor(ratios.length * 0.1)]
    const bg = samples[Math.floor(samples.length / 2)]
    return { id: t.id, ratio: p10, bg: `rgb(${bg.r},${bg.g},${bg.b})` }
  })
}

/** Читаемость и доступность: размеры, абзацы, зоны нажатия, переполнение. */
function readabilityScan(limits) {
  const issues = []
  const pathOf = (el) => {
    let s = el.tagName.toLowerCase()
    if (el.id) s += `#${el.id}`
    else if (typeof el.className === 'string' && el.className.trim())
      s += `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
    return s
  }
  const vh = window.innerHeight
  const inView = (el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh
  }
  const visible = (el) => {
    const cs = getComputedStyle(el)
    return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05
  }
  const seenText = new Set()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement
    if (!el || seenText.has(el) || el.closest('script,style,noscript,svg,canvas')) continue
    if (node.nodeValue.trim().length < 3 || !visible(el) || !inView(el)) continue
    seenText.add(el)
    const cs = getComputedStyle(el)
    const size = parseFloat(cs.fontSize)
    const sample = node.nodeValue.trim().slice(0, 50)
    if (size < limits.fontWarn) {
      issues.push({ level: 'warn', kind: 'font-size', path: pathOf(el), text: sample, detail: `${size.toFixed(1)}px < ${limits.fontWarn}px` })
    }
    const full = el.textContent.trim()
    if (el.matches('p, li, blockquote') && full.length > 140) {
      const lh = parseFloat(cs.lineHeight) || size * 1.2
      const lines = Math.max(1, Math.round(el.getBoundingClientRect().height / lh))
      if (lines >= 2) {
        if (lh / size < limits.lineHeightMin) {
          issues.push({ level: 'warn', kind: 'line-height', path: pathOf(el), text: sample, detail: `интервал ${(lh / size).toFixed(2)} < ${limits.lineHeightMin}` })
        }
        const perLine = full.length / lines
        if (perLine > limits.lineLengthMax) {
          issues.push({ level: 'warn', kind: 'line-length', path: pathOf(el), text: sample, detail: `≈${Math.round(perLine)} знаков в строке > ${limits.lineLengthMax}` })
        }
      }
    }
  }
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role=button]')) {
    if (!visible(el) || !inView(el)) continue
    const r = el.getBoundingClientRect()
    if (r.width < limits.targetMin || r.height < limits.targetMin) {
      // ссылка внутри абзаца вправе быть мелкой (исключение WCAG 2.5.8)
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue
      issues.push({ level: 'warn', kind: 'tap-target', path: pathOf(el), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40), detail: `${Math.round(r.width)}×${Math.round(r.height)} px < ${limits.targetMin}` })
    }
  }
  return issues
}

// ── Прогон ────────────────────────────────────────────────────────────────────
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const results = []
const add = (ctx, issue) => results.push({ ...ctx, ...issue })

async function auditPage(browser, baseUrl, theme, vp) {
  const ctx = { theme, viewport: `${vp.name} ${vp.width}px` }
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  })
  await context.addInitScript((t) => {
    try {
      localStorage.setItem('lx-theme', t)
    } catch {
      // без localStorage тема останется по умолчанию
    }
  }, theme)
  const page = await context.newPage()
  page.on('pageerror', (e) => add(ctx, { level: 'warn', kind: 'page-error', path: '', text: String(e.message).slice(0, 80), detail: 'ошибка в консоли страницы' }))
  await page.goto(baseUrl, { waitUntil: 'load' })
  // заставка уходит сама, когда космос готов
  await page.waitForSelector('.lx-preloader', { state: 'detached', timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(1200)

  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = Math.round(vp.height * 0.8)
  const worst = new Map()
  let axeDone = false
  let shotN = 0

  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(900)

    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
      add(ctx, { level: 'fail', kind: 'overflow-x', path: 'html', text: '', detail: `scrollWidth > ${vp.width}px при прокрутке ${y}px` })
    }
    if (flag('shots')) {
      mkdirSync(join(OUT, 'shots'), { recursive: true })
      await page.screenshot({ path: join(OUT, 'shots', `${theme}-${vp.name}-${String(shotN++).padStart(2, '0')}.png`) })
    }

    for (const issue of await page.evaluate(readabilityScan, LIMITS)) add({ ...ctx, scroll: y }, issue)

    const targets = await page.evaluate(collectTextTargets)
    // снимок фона: весь текст прозрачный
    const hide = await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}' })
    const shot = `data:image/png;base64,${(await page.screenshot()).toString('base64')}`
    await page.evaluate((el) => el.remove(), hide)
    const measured = await page.evaluate(measureContrast, { shot, targets, vw: vp.width, vh: vp.height })
    for (const m of measured) {
      if (m.ratio === null) continue
      const t = targets[m.id]
      const large = t.fontSize >= 24 || (t.fontSize >= 18.66 && t.fontWeight >= 700)
      const need = large ? LIMITS.contrastLarge : LIMITS.contrastText
      const key = `${t.path}|${t.text}`
      const prev = worst.get(key)
      if (!prev || m.ratio < prev.ratio) worst.set(key, { ...t, ratio: m.ratio, need, bg: m.bg, scroll: y })
    }

    if (!axeDone) {
      axeDone = true
      await page.evaluate(axeSource)
      const axe = await page.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          rules: { 'color-contrast': { enabled: false } },
        }),
      )
      for (const v of axe.violations) {
        const serious = v.impact === 'serious' || v.impact === 'critical'
        add(ctx, { level: serious ? 'fail' : 'warn', kind: `axe:${v.id}`, path: v.nodes[0]?.target?.join(' ') ?? '', text: v.help, detail: `${v.impact}, элементов: ${v.nodes.length} — ${v.helpUrl}` })
      }
    }
  }

  for (const w of worst.values()) {
    if (w.ratio < w.need) {
      // текст, намеренно приглушённый opacity (scroll-reveal, hover-состояния), — не ошибка, но стоит знать
      const dimmed = w.opacity < 0.95
      add({ ...ctx, scroll: w.scroll }, { level: dimmed ? 'warn' : 'fail', kind: dimmed ? 'contrast-dimmed' : 'contrast', path: w.path, text: w.text, detail: `${w.ratio.toFixed(2)}:1 < ${w.need}:1 (шрифт ${w.fontSize.toFixed(0)}px, фон ≈ ${w.bg}${dimmed ? `, opacity ${w.opacity.toFixed(2)}` : ''}, прокрутка ${w.scroll}px)` })
    }
  }
  await context.close()
  return worst.size
}

function report() {
  const fails = results.filter((r) => r.level === 'fail')
  const warns = results.filter((r) => r.level === 'warn')
  const group = (list) => {
    const map = new Map()
    for (const r of list) {
      const k = `${r.kind}|${r.path}|${r.text}`
      const e = map.get(k) ?? { ...r, where: new Set() }
      e.where.add(`${r.theme}/${r.viewport.split(' ')[0]}`)
      map.set(k, e)
    }
    return [...map.values()]
  }
  const fmt = (title, list) => {
    if (!list.length) return `## ${title}\n\nнет\n`
    const rows = group(list).map((e) => `- **${e.kind}** \`${e.path}\` «${e.text}» — ${e.detail}  \n  _${[...e.where].join(', ')}_`)
    return `## ${title} (${rows.length})\n\n${rows.join('\n')}\n`
  }
  const md = `# Аудит дизайна\n\n${new Date().toISOString()}\n\n${fmt('Ошибки', fails)}\n${fmt('Предупреждения', warns)}`
  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'report.md'), md)
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(results, null, 2))
  return { fails: group(fails), warns: group(warns) }
}

const server = await ensureServer()
const launch = () =>
  chromium.launch({
    executablePath: chromiumPath(),
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
try {
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      process.stdout.write(`· ${theme} ${vp.name} ${vp.width}px … `)
      // свежий браузер на каждый прогон; swiftshader изредка роняет вкладку из-за WebGL — один повтор
      let n
      for (let attempt = 1; n === undefined; attempt++) {
        const before = results.length
        const browser = await launch()
        try {
          n = await auditPage(browser, server.url, theme, vp)
        } catch (e) {
          results.length = before
          if (attempt >= 2) throw e
          process.stdout.write('сбой вкладки, повтор … ')
        } finally {
          await browser.close().catch(() => {})
        }
      }
      console.log(`проверено текстов: ${n}`)
    }
  }
} finally {
  server.stop()
}

const { fails, warns } = report()
const order = (e) => (e.kind === 'contrast' ? 0 : e.kind.startsWith('axe') ? 1 : 2)
fails.sort((a, b) => order(a) - order(b))
console.log(`\nОшибок: ${fails.length}, предупреждений: ${warns.length}`)
for (const e of fails.slice(0, 25)) console.log(`  ✗ ${e.kind} ${e.path} «${e.text}» — ${e.detail} [${[...e.where].join(', ')}]`)
if (fails.length > 25) console.log(`  … и ещё ${fails.length - 25}`)
console.log(`Отчёт: ${join('audit-design', 'report.md')}`)
process.exit(fails.length || (flag('strict') && warns.length) ? 1 : 0)
