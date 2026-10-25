// Shared bounded bubble dragging: preserve touch scrolling and distinguish a nudge from a tap.

import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

export function useSpringBubble(onTap: () => void) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)
  const moved = useRef(false)
  function release() {
    pointer.current = null
    setDragging(false)
    setOffset({ x: 0, y: 0 })
  }
  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    moved.current = false
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const origin = pointer.current
    if (!origin || origin.id !== event.pointerId) return
    const x = event.clientX - origin.x
    const y = event.clientY - origin.y
    if (Math.hypot(x, y) > 6) moved.current = true
    setOffset({ x: Math.tanh(x / 65) * 20, y: Math.tanh(y / 65) * 20 })
  }
  function onPointerCancel() {
    moved.current = true
    release()
  }
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 && moved.current) {
      moved.current = false
      return
    }
    onTap()
  }
  return {
    offset,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel,
      onLostPointerCapture: release,
      onBlur: release,
      onClick,
    },
  }
}
