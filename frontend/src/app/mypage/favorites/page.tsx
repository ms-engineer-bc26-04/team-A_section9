//お気に入り一覧画面
// src/app/mypage/favorites/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'

export default function FavoritesPage() {
  const { isLoggedIn, isLoading: isAuthLoading, appUser } = useAuth()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const { favorites, removeFavorite, isLoading } = useFavorites(isLoggedIn)

  const isPremium = appUser?.isPremium ?? false
  const maxCompare = isPremium ? 3 : 2
  const maxFavorites = isPremium ? null : 5

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
          {maxFavorites
            ? `${favorites.length} / ${maxFavorites}件登録中`
            : `${favorites.length}件登録中`}
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
              className="relative border border-gray-400 rounded-2xl bg-white shadow-sm"
            >
              <div className="flex gap-3 p-3">
                {/* 画像 */}
                <Link
                  href={`/schools/${favorite.school.id}`}
                  className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100"
                >
                  {favorite.school.imageUrl ? (
                    <Image
                      src={favorite.school.imageUrl}
                      alt={favorite.school.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No Image
                    </div>
                  )}
                </Link>

                {/* テキスト情報 */}
                <div className="flex-1 min-w-0 flex flex-col gap-1 pr-8">
                  <Link href={`/schools/${favorite.school.id}`}>
                    <p className="font-bold text-gray-800 text-base leading-snug hover:text-primary">
                      {favorite.school.name}
                    </p>
                  </Link>
                  <p className="text-gray-700 text-xs">
                    {favorite.school.address}
                  </p>
                  {favorite.school.phoneNumber && (
                    <p className="text-gray-700 text-xs">
                      電話番号:{favorite.school.phoneNumber}
                    </p>
                  )}
                  {/* タグ */}
                  {favorite.school.tags && favorite.school.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {favorite.school.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* チェックボックス（右上・丸型） */}
              <div
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => handleToggleSelect(favorite.school.id)}
              >
                <div
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
                </div>
              </div>

              {/* 解除ボタン（右下・ハート） */}
              <button
                onClick={() => handleRemoveFavorite(favorite.school.id)}
                className="absolute bottom-3 right-3 transition-colors"
                aria-label="お気に入りを解除"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#FFCFCF"
                  className="w-6 h-6"
                >
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
