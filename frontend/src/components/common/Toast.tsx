// src/components/common/Toast.tsx
//「お気に入りに追加しました」などの一時的な通知を画面上部に表示
'use client'

import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'warning'
  onClose: () => void
  duration?: number
}

const typeStyles = {
  success: 'bg-[#FF8FAB] text-gray-800',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
}

export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`
        fixed top-4 left-3 right-3 z-50
        mx-auto w-fit max-w-full
        px-4 py-2.5 rounded-2xl shadow-lg
        font-bold text-sm text-center whitespace-pre-line
        ${typeStyles[type]}
      `}
    >
      {message}
    </div>
  )
}
