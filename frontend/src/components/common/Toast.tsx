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
  success: 'bg-[#FFCFCF] text-gray-800',
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
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        px-6 py-3 rounded-full shadow-lg
        font-bold text-sm
        ${typeStyles[type]}
      `}
    >
      {message}
    </div>
  )
}
