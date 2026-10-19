// Transient status message pinned above everything else, for actions that can fail after the
// interface has already updated.

import { useEffect } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div
      role="status"
      className="border-line bg-surface-raised fixed bottom-6 left-1/2 z-[80] max-w-[90vw] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-card-hover"
    >
      {message}
    </div>
  )
}
