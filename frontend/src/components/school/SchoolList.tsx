// src/components/school/SchoolList.tsx
// ホーム画面の園一覧セクション
'use client'

import { useState, useEffect } from 'react'
import SchoolCard from './SchoolCard'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSchools } from '@/lib/api/schools'
import { addFavorite, removeFavorite } from '@/lib/api/favorites'
import { SchoolSummary } from '@/types/school'
import { supabase } from '@/lib/supabase'

export default function SchoolList() {
  const { isLoggedIn, isLoading: isAuthLoading, appUser } = useAuth()
  const [schools, setSchools] = useState<SchoolSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  useEffect(() => {
    // 認証状態が確定してから取得する
    if (isAuthLoading) return

    const fetchSchools = async () => {
      try {
        setIsLoading(true)
        // ログイン済みはおすすめ順・未ログインは通常順
        const result = await getSchools(
          isLoggedIn ? { sort: 'recommended' } : undefined
        )
        setSchools(result.data)
      } catch (e) {
        setError('園一覧の取得に失敗しました。時間をおいて再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchools()
  }, [isLoggedIn, isAuthLoading])

  const handleToggleFavorite = async (schoolId: number) => {
    if (!isLoggedIn) return

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return

    const school = schools.find((s) => s.id === schoolId)
    if (!school) return

    // 一般ユーザーの上限チェック
    if (
      !school.isFavorited &&
      appUser?.isPremium === false &&
      (appUser?.favoriteCount ?? 0) >= 5
    ) {
      setToast({
        message: 'お気に入りは5件まで登録できます。プレミアムで無制限に',
        type: 'warning',
      })
      return
    }

    try {
      if (school.isFavorited) {
        await removeFavorite(schoolId, accessToken)
        setSchools((prev) =>
          prev.map((s) =>
            s.id === schoolId ? { ...s, isFavorited: false } : s
          )
        )
        setToast({ message: 'お気に入りを解除しました', type: 'success' })
      } else {
        await addFavorite(schoolId, accessToken)
        setSchools((prev) =>
          prev.map((s) => (s.id === schoolId ? { ...s, isFavorited: true } : s))
        )
        setToast({ message: 'お気に入りに追加しました', type: 'success' })
      }
    } catch (e: unknown) {
      const code = e instanceof Error ? e.message : ''
      if (code === 'FAVORITE_LIMIT_EXCEEDED') {
        setToast({
          message: 'お気に入りは5件まで登録できます。プレミアムで無制限に',
          type: 'warning',
        })
      } else {
        setToast({
          message: 'お気に入りの更新に失敗しました',
          type: 'error',
        })
      }
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <SchoolCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-sm text-center py-8">{error}</div>
  }

  if (schools.length === 0) {
    return (
      <EmptyState
        message="条件に合う園が見つかりませんでした"
        subMessage="検索条件を変更してもう一度お試しください"
      />
    )
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* 見出し：ログイン状態で切り替え */}
      <h2 className="font-bold text-gray-800 text-base">
        {isLoggedIn ? 'おすすめの園' : '園の一覧'}
      </h2>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
        {schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            isLoggedIn={isLoggedIn}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </>
  )
}
