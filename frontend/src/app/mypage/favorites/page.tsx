//お気に入り一覧画面
// src/app/mypage/favorites/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'
import FavoriteButton from '@/components/school/FavoriteButton'
import { motion } from 'framer-motion'

export default function FavoritesPage() {
  const { isLoggedIn, isLoading: isAuthLoading, isPremium } = useAuth()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const { favorites, favoriteCount, favoriteLimit, removeFavorite, isLoading } =
    useFavorites(isLoggedIn)

  const maxCompare = isPremium ? 3 : 2

  useEffect(() => {
    if (isAuthLoading) return
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, isAuthLoading, router])

  const handleRemoveFavorite = async (schoolId: number) => {
    try {
      await removeFavorite(schoolId)
      setSelectedIds((prev) => prev.filter((id) => id !== schoolId))
      setToast({ message: 'お気に入りを解除しました', type: 'success' })
    } catch (e) {
      console.error(e)
      setToast({ message: 'お気に入りの解除に失敗しました', type: 'error' })
    }
  }

  const handleToggleSelect = (schoolId: number) => {
    if (selectedIds.includes(schoolId)) {
      setSelectedIds((prev) => prev.filter((id) => id !== schoolId))
    } else {
      if (selectedIds.length >= maxCompare) {
        setToast({
          message: `比較できるのは${maxCompare}園までです`,
          type: 'warning',
        })
        return
      }
      setSelectedIds((prev) => [...prev, schoolId])
    }
  }

  const handleCompare = () => {
    router.push(`/compare?ids=${selectedIds.join(',')}`)
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <SchoolCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-gray-800 text-xl">お気に入りの園</h1>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          className="px-5 py-2 rounded-full font-extrabold text-base bg-[#A0CD83] text-white hover:bg-[#82b865] active:bg-[#82b865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          比較する
        </button>
      </div>

      {/* 件数・比較対象の説明 */}
      <div className="flex flex-col gap-1">
        <p className="text-gray-700 text-sm">
          {favoriteLimit !== null
            ? `${favoriteCount} / ${favoriteLimit}件登録中`
            : `${favoriteCount}件登録中`}
        </p>
        <p className="text-gray-700 text-sm">比較対象：{maxCompare}園まで</p>
      </div>

      {/* 空状態 */}
      {favorites.length === 0 ? (
        <EmptyState
          message="お気に入りに登録した園はまだありません"
          actionLabel="園を探す"
          onAction={() => router.push('/')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="relative border border-gray-200 rounded-xl bg-white shadow-sm"
            >
              {/* 画像・テキストをまとめてLinkに */}
              <Link
                href={`/schools/${favorite.school.id}`}
                className="flex gap-3 p-3 transition-transform active:scale-95"
              >
                {/* 画像 */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {favorite.school.imageUrl ? (
                    <Image
                      src={favorite.school.imageUrl}
                      alt={favorite.school.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* テキスト情報 */}
                <div className="flex-1 min-w-0 flex flex-col gap-1 pr-8">
                  <p className="font-bold text-gray-800 text-sm leading-snug">
                    {favorite.school.name}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {favorite.school.address}
                  </p>
                  {favorite.school.phoneNumber && (
                    <p className="text-gray-500 text-xs">
                      電話番号：{favorite.school.phoneNumber}
                    </p>
                  )}

                  {/* タグ */}
                  {favorite.school.tags && favorite.school.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {favorite.school.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full font-normal"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>

              {/* チェックボックス（右上・丸型） */}
              <div
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => handleToggleSelect(favorite.school.id)}
              >
                <motion.div
                  animate={
                    selectedIds.includes(favorite.school.id)
                      ? { scale: [1, 1.4, 0.9, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedIds.includes(favorite.school.id)
                      ? 'bg-[#A0CD83] border-[#A0CD83]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {selectedIds.includes(favorite.school.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth={3}
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </motion.div>
              </div>

              {/* 解除ボタン（右下） */}
              <div className="absolute bottom-3 right-3">
                <FavoriteButton
                  schoolId={favorite.school.id}
                  isFavorited={true}
                  isLoggedIn={isLoggedIn}
                  onToggle={handleRemoveFavorite}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
