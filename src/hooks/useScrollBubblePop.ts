// Coordinates bubble, caption, and path-segment scroll effects while preserving focus and layout.

import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useScrollBubblePop(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previousY = window.scrollY
    let frame = 0

    function setState(bubble: HTMLElement, state: 'popped' | 'regrowing') {
      bubble.dataset.popState = state
      const stop = bubble.closest<HTMLElement>('.sprint-bubble-stop')
      if (stop) stop.dataset.popState = state
    }
    function update() {
      frame = 0
      const currentY = window.scrollY
      const distance = currentY - previousY
      if (Math.abs(distance) < 2 || reducedMotion.matches) return
      previousY = currentY
      const threshold = Math.max(140, Math.min(window.innerHeight * 0.3, 260))
      const bubbles = Array.from(element!.querySelectorAll<HTMLElement>('[data-scroll-bubble]'))
      const byId = new Map(
        bubbles
          .filter((bubble) => bubble.dataset.scrollId)
          .map((bubble) => [bubble.dataset.scrollId, bubble]),
      )
      bubbles.forEach((bubble) => {
        const bounds = bubble.getBoundingClientRect()
        const visible = bounds.bottom > 64 && bounds.top < window.innerHeight
        if (distance < 0 && visible && bubble.dataset.popState === 'popped') {
          setState(bubble, 'regrowing')
        } else if (distance > 0 && bounds.top + bounds.height / 2 < threshold) {
          if (
            bubble.querySelector('.is-dragging, :focus-visible') ||
            bubble.closest('.sprint-bubble-stop')?.querySelector(':focus-visible')
          )
            return
          if (bubble.dataset.popState !== 'popped') setState(bubble, 'popped')
        }
      })
      element?.querySelectorAll<SVGElement>('[data-link-to]').forEach((link) => {
        const bubble = byId.get(link.dataset.linkTo)
        if (!bubble) return
        const bounds = bubble.getBoundingClientRect()
        const center = bounds.top + bounds.height / 2
        const progress = Math.max(
          0,
          Math.min(1, (window.innerHeight * 1.05 - center) / (window.innerHeight * 0.7)),
        )
        link.style.setProperty('--link-progress', progress.toFixed(3))
        link.dataset.popState = bubble.dataset.popState ?? 'ready'
      })
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    function onFocus(event: FocusEvent) {
      if (!(event.target instanceof HTMLElement)) return
      const bubble =
        event.target.closest<HTMLElement>('[data-scroll-bubble]') ??
        event.target
          .closest('.sprint-bubble-stop')
          ?.querySelector<HTMLElement>('[data-scroll-bubble]')
      if (bubble?.dataset.popState === 'popped') {
        setState(bubble, 'regrowing')
        element?.querySelectorAll<SVGElement>('[data-link-to]').forEach((link) => {
          if (link.dataset.linkTo === bubble.dataset.scrollId) link.dataset.popState = 'regrowing'
        })
      }
    }
    function onMotionChange() {
      previousY = window.scrollY
      element
        ?.querySelectorAll<HTMLElement | SVGElement>('[data-pop-state], [data-link-to]')
        .forEach((item) => {
          delete item.dataset.popState
          item.style.removeProperty('--link-progress')
        })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    element.addEventListener('focusin', onFocus)
    reducedMotion.addEventListener('change', onMotionChange)
    return () => {
      window.removeEventListener('scroll', onScroll)
      element.removeEventListener('focusin', onFocus)
      reducedMotion.removeEventListener('change', onMotionChange)
      if (frame) window.cancelAnimationFrame(frame)
      onMotionChange()
    }
  }, [root])
}
