// src/components/school/SchoolList.tsx
// ホーム画面の園一覧セクション
'use client'

import { useState, useEffect, useCallback } from 'react'
import SchoolCard from './SchoolCard'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSchools } from '@/lib/api/schools'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { SchoolSummary } from '@/types/school'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import { supabase } from '@/lib/supabase'

export default function SchoolList() {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const [schools, setSchools] = useState<SchoolSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const { isFavorited, addFavorite, removeFavorite } = useFavorites(isLoggedIn)

  const fetchSchools = useCallback(async () => {
    if (isAuthLoading) return

    try {
      setIsLoading(true)

      let accessToken: string | undefined
      if (isLoggedIn) {
        const { data } = await supabase.auth.getSession()
        accessToken = data.session?.access_token
      }

      const result = await getSchools(
        isLoggedIn ? { sort: 'recommended' } : undefined,
        accessToken // ← 追加
      )
      setSchools(result.data)
    } catch (e) {
      console.error(e)
      setError('園一覧の取得に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, isAuthLoading])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchools()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchSchools])

  //
  const handleToggleFavorite = async (schoolId: number) => {
    if (!isLoggedIn) return

    const currentlyFavorited = isFavorited(schoolId)

    try {
      if (currentlyFavorited) {
        await removeFavorite(schoolId)
        setToast({ message: 'お気に入りを解除しました', type: 'success' })
      } else {
        await addFavorite(schoolId)
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

  // Loadingの代わりにSchoolCardSkeletonを使用
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
      <h2 className="font-bold text-gray-800 text-base">
        {isLoggedIn ? 'おすすめの園' : '園の一覧'}
      </h2>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
        {schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={{
              ...school,
              isFavorited: isFavorited(school.id),
            }}
            isLoggedIn={isLoggedIn}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </>
  )
}
