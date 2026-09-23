import { useState, useEffect } from 'react'
import { updateScrollVelocity } from '../audio/soundscape'

/**
 * Interface contract matching PROJECT.md
 */
export interface ScrollState {
  progress: number // normalized [0.0, 1.0]
  velocity: number // normalized scroll speed (points/sec)
  phase: 1 | 2 | 3 | 4 // active transformation phase: 1 (0-25%), 2 (25-60%), 3 (60-85%), 4 (85-100%)
}

export type ScrollListener = (state: ScrollState) => void

export class KineticScrollController {
  private targetProgress = 0
  private currentProgress = 0
  private currentVelocity = 0
  private lerpFactor = 0.08
  private listeners = new Set<ScrollListener>()
  private isRunning = false
  private rafId: number | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    this.updateTargetFromWindow()
    this.currentProgress = this.targetProgress

    window.addEventListener('scroll', this.handleScroll, { passive: true })
    window.addEventListener('resize', this.handleScroll, { passive: true })
    this.startLoop()
  }

  private updateTargetFromWindow() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const doc = document.documentElement
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
    const scrollY = window.scrollY || doc.scrollTop || 0
    this.targetProgress = Math.max(0, Math.min(1, scrollY / maxScroll))
  }

  private handleScroll = () => {
    this.updateTargetFromWindow()
    if (!this.isRunning) {
      this.startLoop()
    }
  }

  private startLoop() {
    if (this.isRunning) return
    this.isRunning = true

    const tick = () => {
      const prev = this.currentProgress
      // Smooth damped spring interpolation
      this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor
      this.currentVelocity = (this.currentProgress - prev) * 60.0

      // Compute active transformation phase
      let phase: 1 | 2 | 3 | 4 = 1
      if (this.currentProgress < 0.25) {
        phase = 1
      } else if (this.currentProgress < 0.6) {
        phase = 2
      } else if (this.currentProgress < 0.85) {
        phase = 3
      } else {
        phase = 4
      }

      const state: ScrollState = {
        progress: this.currentProgress,
        velocity: this.currentVelocity,
        phase,
      }

      // 1. Modulate 432 Hz biquad cutoff frequency in Web Audio API
      updateScrollVelocity(this.currentVelocity)

      // 2. Notify all registered listeners (ContinuousStage, Three.js loop, React components)
      for (const listener of this.listeners) {
        try {
          listener(state)
        } catch (err) {
          console.error('Error in kinetic scroll listener:', err)
        }
      }

      // Check if settled to save CPU when idle
      const isSettled =
        Math.abs(this.targetProgress - this.currentProgress) < 0.0001 &&
        Math.abs(this.currentVelocity) < 0.001

      if (!isSettled) {
        this.rafId = requestAnimationFrame(tick)
      } else {
        this.currentProgress = this.targetProgress
        this.currentVelocity = 0
        this.isRunning = false
        this.rafId = null
      }
    }

    this.rafId = requestAnimationFrame(tick)
  }

  public subscribe(listener: ScrollListener): () => void {
    this.listeners.add(listener)
    // Send immediate initial state
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getState(): ScrollState {
    let phase: 1 | 2 | 3 | 4 = 1
    if (this.currentProgress < 0.25) {
      phase = 1
    } else if (this.currentProgress < 0.6) {
      phase = 2
    } else if (this.currentProgress < 0.85) {
      phase = 3
    } else {
      phase = 4
    }

    return {
      progress: this.currentProgress,
      velocity: this.currentVelocity,
      phase,
    }
  }

  public setProgress(target: number) {
    this.targetProgress = Math.max(0, Math.min(1, target))
    if (!this.isRunning) {
      this.startLoop()
    }
  }

  public forceProgress(progress: number) {
    this.targetProgress = Math.max(0, Math.min(1, progress))
    this.currentProgress = this.targetProgress
    this.currentVelocity = 0
    const state = this.getState()
    for (const listener of this.listeners) {
      listener(state)
    }
  }

  public dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll)
      window.removeEventListener('resize', this.handleScroll)
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.listeners.clear()
    this.isRunning = false
  }
}

// Global singleton instance
export const kineticScroll = new KineticScrollController()

/**
 * React hook for consuming smooth kinetic scroll progress in UI components
 */
export function useKineticScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>(() => kineticScroll.getState())

  useEffect(() => {
    return kineticScroll.subscribe(setState)
  }, [])

  return state
}
