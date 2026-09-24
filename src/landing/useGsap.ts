import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from './motion'

export const MOTION_QUERIES = {
  motion: '(prefers-reduced-motion: no-preference)',
  still: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 900px)',
  mobile: '(max-width: 899px)',
}

export type MotionConditions = { [K in keyof typeof MOTION_QUERIES]: boolean }

/**
 * Анимации секции в изолированном gsap-контексте: всё созданное внутри
 * (твины, ScrollTrigger, SplitText) откатывается при размонтировании и
 * пересобирается при смене медиа-условий (десктоп/мобильный, reduced motion).
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (conditions: MotionConditions, root: HTMLElement) => void | (() => void),
  deps: DependencyList = []
) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERIES, (ctx) => setup(ctx.conditions as MotionConditions, root))
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
