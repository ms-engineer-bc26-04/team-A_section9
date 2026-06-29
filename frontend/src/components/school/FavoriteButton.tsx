//ハートアイコンのボタン。押すとお気に入り登録・解除する
// src/components/school/FavoriteButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'

type FavoriteButtonProps = {
  schoolId: number
  isFavorited: boolean
  isLoggedIn?: boolean
  onToggle?: (schoolId: number) => void
}

export default function FavoriteButton({
  schoolId,
  isFavorited,
  isLoggedIn = false,
  onToggle,
}: FavoriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      setIsModalOpen(true)
      return
    }

    setAnimKey((prev) => prev + 1)

    // アニメーション(0.4s)完了後にonToggleを呼ぶ
    setTimeout(() => {
      onToggle?.(schoolId)
    }, 400)
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={isFavorited ? 'お気に入り解除' : 'お気に入り登録'}
        className="w-8 h-8 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={animKey}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorited ? '#FFA4A4' : 'none'}
            stroke={isFavorited ? '#FFA4A4' : '#ccc'}
            strokeWidth={2}
            className="w-6 h-6"
            initial={{ scale: 1 }}
            animate={
              animKey > 0
                ? {
                    scale: [1, 1.4, 0.9, 1.15, 1],
                  }
                : { scale: 1 }
            }
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </motion.svg>
        </AnimatePresence>
      </button>

      {/* ログイン誘導モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ログインが必要です"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm text-center">
            お気に入り登録にはログインが必要です。
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                setIsModalOpen(false)
                router.push('/login')
              }}
            >
              ログイン
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setIsModalOpen(false)
                router.push('/register')
              }}
            >
              新規会員登録
            </Button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 text-sm text-center mt-1"
            >
              キャンセル
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
