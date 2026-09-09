import { useEffect, useRef } from 'react'
import { BookScene } from './bookScene'
import { useBookStore } from '../store/useBookStore'
import { calculateArchetypes } from '../numerology/calculate'
import { buildChapters } from '../numerology/chapters'

export function BookStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BookScene | null>(null)
  const appliedCount = useRef(0)
  const queueRunning = useRef(false)

  const stage = useBookStore((s) => s.stage)
  const coverState = useBookStore((s) => s.coverState)
  const chapters = useBookStore((s) => s.chapters)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const activeLayerTab = useBookStore((s) => s.activeLayerTab)
  const scores = useBookStore((s) => s.scores)

  // 1. Создание 3D сцены
  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return
    const scene = new BookScene(canvasRef.current, stageRef.current)
    sceneRef.current = scene

    // Начальная книга (эталон 02.04.1994)
    const initialProfile = calculateArchetypes(new Date(1994, 3, 2))
    const placeholder = buildChapters(initialProfile)
    scene.buildBook(placeholder)
    appliedCount.current = 0

    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // 2. Обновление глав при расчёте даты рождения
  useEffect(() => {
    if (!chapters.length || !sceneRef.current) return
    sceneRef.current.buildBook(chapters)
    appliedCount.current = 0
  }, [chapters])

  // 3. Смена ракурса камеры (презентация / ввод даты)
  useEffect(() => {
    if (!sceneRef.current) return
    if (stage === 'cover') {
      const camTarget: 'cover' | 'cover_input' = coverState === 'input' ? 'cover_input' : 'cover'
      sceneRef.current.setCamState(camTarget)
      sceneRef.current.updateCoverTexture()
    }
  }, [stage, coverState])

  // 4. Смена активной вкладки (Свет / Тень / Жизнь / Пантеон / Вопросы)
  useEffect(() => {
    if (!sceneRef.current || currentSpread <= 0) return
    sceneRef.current.updateRightPageTab(currentSpread - 1, activeLayerTab)
  }, [activeLayerTab, currentSpread])

  // 5. Обновление оценок пользователя (шкала 1-5 звёзд)
  useEffect(() => {
    if (!sceneRef.current || currentSpread <= 0 || !chapters[currentSpread - 1]) return
    const ch = chapters[currentSpread - 1]
    const posId = ch.positionId ?? ch.id
    const latestScore = useBookStore.getState().getLatestScore(posId)
    if (latestScore !== null) {
      sceneRef.current.updateLeftPageScore(currentSpread - 1, latestScore)
    }
  }, [scores, currentSpread, chapters])

  // 6. Очередь физических 3D-перелистываний страниц до целевого currentSpread
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || queueRunning.current) return

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

      turn((ok) => {
        if (ok) {
          appliedCount.current += direction === 'next' ? 1 : -1
          if (direction === 'next' && appliedCount.current === 1 && useBookStore.getState().stage === 'cover') {
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
  }, [currentSpread])

  return (
    <div className="stage" ref={stageRef}>
      <canvas ref={canvasRef} />
    </div>
  )
}
