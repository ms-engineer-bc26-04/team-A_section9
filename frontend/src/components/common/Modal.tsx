// src/components/common/Modal.tsx
//ダイアログ・プレミアム誘導などに使うモーダルの土台
'use client'

import { useEffect } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  // スクロール制御
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 z-10">
        {title && (
          <h2 className="text-lg font-bold text-center mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}