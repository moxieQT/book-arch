import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { BookScene } from './bookScene'
import { useBookStore } from '../store/useBookStore'
import { calculateArchetypes } from '../numerology/calculate'
import { buildChapters } from '../numerology/chapters'
import { soundscape } from '../audio/soundscape'
import { kineticScroll } from './kineticScroll'

export interface ContinuousStageProps {
  viewMode: 'portal' | 'book'
}

/**
 * Continuous WebGL Canvas Stage
 * Mounts persistently at position: fixed; inset: 0; z-index: 0; pointer-events: none.
 * Never unmounts or recreates WebGL context between portal and book navigation.
 */
export function ContinuousStage({ viewMode }: ContinuousStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BookScene | null>(null)
  const appliedCount = useRef(0)
  const queueRunning = useRef(false)
  const isFontReadyRef = useRef(false)

  const stage = useBookStore((s) => s.stage)
  const coverState = useBookStore((s) => s.coverState)
  const chapters = useBookStore((s) => s.chapters)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const activeLayerTab = useBookStore((s) => s.activeLayerTab)
  const tabPage = useBookStore((s) => s.tabPage)
  const scores = useBookStore((s) => s.scores)

  // 1. Persistent WebGL Context Creation (Mounts ONCE)
  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return
    const scene = new BookScene(canvasRef.current, stageRef.current)
    sceneRef.current = scene

    let isMounted = true

    const initBookWithFonts = async () => {
      // Font readiness check with 2.5s safety timeout
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          const fontTimeout = new Promise((resolve) => setTimeout(resolve, 2500))
          await Promise.race([document.fonts.ready, fontTimeout])
        } catch (err) {
          console.warn('Font loading check timed out or failed:', err)
        }
      }

      if (!isMounted || !sceneRef.current) return
      isFontReadyRef.current = true

      const storeState = useBookStore.getState()
      const targetChapters =
        storeState.chapters.length > 0
          ? storeState.chapters
          : buildChapters(calculateArchetypes(storeState.birthDate ?? new Date(1994, 3, 2)))

      sceneRef.current.syncDraftDateFromStore()
      sceneRef.current.buildBook(targetChapters)

      if (storeState.currentSpread > 0) {
        sceneRef.current.jumpToSpread(storeState.currentSpread)
        appliedCount.current = storeState.currentSpread
      } else {
        appliedCount.current = 0
      }
    }

    initBookWithFonts()

    // 2. Kinetic Scroll Subscription: Drive 4-Phase Transformation smoothly
    const unsubscribeScroll = kineticScroll.subscribe((scrollState) => {
      if (sceneRef.current) {
        sceneRef.current
          .getAstrolabe()
          .setScrollProgress(scrollState.progress, scrollState.velocity)
      }
    })

    // 3. Window Pointer Move: Drive Astrolabe microparallax across viewport
    const handlePointerMove = (e: PointerEvent) => {
      if (!sceneRef.current) return
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      )
      sceneRef.current.getAstrolabe().setPointer(ndc)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      isMounted = false
      unsubscribeScroll()
      window.removeEventListener('pointermove', handlePointerMove)
      scene.dispose()
      sceneRef.current = null
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __bookScene?: unknown }).__bookScene
        delete (window as unknown as { __bookStore?: unknown }).__bookStore
      }
    }
  }, [])

  // 4. ViewMode State Sync & Inspection Reference Management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (viewMode === 'book') {
        ;(window as unknown as { __bookScene?: BookScene }).__bookScene = sceneRef.current ?? undefined
        ;(window as unknown as { __bookStore?: typeof useBookStore }).__bookStore = useBookStore
        if (sceneRef.current) {
          const storeState = useBookStore.getState()
          sceneRef.current.setCamState(
            storeState.stage === 'reading' ? 'reading_spread' : 'cover'
          )
        }
      } else {
        delete (window as unknown as { __bookScene?: unknown }).__bookScene
        delete (window as unknown as { __bookStore?: unknown }).__bookStore
        // Restore kinetic scroll progress position
        if (sceneRef.current) {
          const scrollState = kineticScroll.getState()
          sceneRef.current
            .getAstrolabe()
            .setScrollProgress(scrollState.progress, scrollState.velocity)
        }
      }
    }
  }, [viewMode])

  // 5. Update chapters on birthdate calculation
  useEffect(() => {
    if (!chapters.length || !sceneRef.current || !isFontReadyRef.current) return
    sceneRef.current.syncDraftDateFromStore()
    sceneRef.current.buildBook(chapters)
    appliedCount.current = 0
  }, [chapters])

  // 6. Camera state updates
  useEffect(() => {
    if (!sceneRef.current || viewMode !== 'book') return
    if (stage === 'cover') {
      const camTarget: 'cover' | 'cover_input' = coverState === 'input' ? 'cover_input' : 'cover'
      sceneRef.current.setCamState(camTarget)
      sceneRef.current.updateCoverTexture()
    }
  }, [stage, coverState, viewMode])

  // 7. Layer tab updates
  useEffect(() => {
    if (!sceneRef.current || currentSpread <= 0 || viewMode !== 'book') return
    sceneRef.current.updateRightPageTab(currentSpread - 1, activeLayerTab)
  }, [activeLayerTab, tabPage, currentSpread, viewMode])

  // 8. User rating score updates
  useEffect(() => {
    if (!sceneRef.current || currentSpread <= 0 || !chapters[currentSpread - 1] || viewMode !== 'book')
      return
    const ch = chapters[currentSpread - 1]
    const posId = ch.positionId ?? ch.id
    const latestScore = useBookStore.getState().getLatestScore(posId)
    if (latestScore !== null) {
      sceneRef.current.updateLeftPageScore(currentSpread - 1, latestScore)
    }
  }, [scores, currentSpread, chapters, viewMode])

  // 9. Physical page turn queue
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || queueRunning.current || viewMode !== 'book') return

    const step = () => {
      const target = useBookStore.getState().currentSpread
      if (appliedCount.current === target) {
        queueRunning.current = false
        useBookStore.getState().setAnimating(false)
        return
      }
      queueRunning.current = true
      useBookStore.getState().setAnimating(true)
      const direction = target > appliedCount.current ? 'next' : 'prev'
      const turn = direction === 'next' ? scene.turnNext.bind(scene) : scene.turnPrev.bind(scene)

      soundscape.playPageTurn()
      turn((ok) => {
        if (ok) {
          appliedCount.current += direction === 'next' ? 1 : -1
          if (
            direction === 'next' &&
            appliedCount.current === 1 &&
            useBookStore.getState().stage === 'cover'
          ) {
            useBookStore.getState().confirmOpened()
          }
          if (appliedCount.current === 0) {
            useBookStore.getState().confirmClosed()
          }
        } else {
          queueRunning.current = false
          useBookStore.getState().setAnimating(false)
          return
        }
        step()
      })
    }

    step()
  }, [currentSpread, viewMode])

  return (
    <div
      className={`continuous-stage ${viewMode === 'book' ? 'stage' : ''}`}
      ref={stageRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: viewMode === 'book' ? 'auto' : 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} id="continuous-stage-canvas" />
    </div>
  )
}
