// 検索結果画面専用の園一覧コンポーネント
// src/components/school/SearchSchoolList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SchoolCard from './SchoolCard'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSchools } from '@/lib/api/schools'
import { addFavorite, removeFavorite, getFavorites } from '@/lib/api/favorites'
import { SchoolSummary, SearchFilters } from '@/types/school'
import { supabase } from '@/lib/supabase'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SearchSchoolList({ searchParams }: Props) {
  const { isLoggedIn, isLoading: isAuthLoading, appUser } = useAuth()
  const [schools, setSchools] = useState<SchoolSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isAuthLoading) return

    const fetchSchools = async () => {
      try {
        setIsLoading(true)

        // クエリパラメータをSearchFiltersに変換
        const filters: SearchFilters = {}
        if (searchParams.keyword) filters.keyword = String(searchParams.keyword)
        if (searchParams.area) filters.area = String(searchParams.area)
        if (searchParams.mealType)
          filters.mealType = searchParams.mealType as SearchFilters['mealType']
        if (searchParams.diaperSupport)
          filters.diaperSupport =
            searchParams.diaperSupport as SearchFilters['diaperSupport']
        if (searchParams.futonSupport)
          filters.futonSupport =
            searchParams.futonSupport as SearchFilters['futonSupport']
        if (searchParams.weekdayEventsLevel)
          filters.weekdayEventsLevel =
            searchParams.weekdayEventsLevel as SearchFilters['weekdayEventsLevel']
        if (searchParams.parentAssociationLevel)
          filters.parentAssociationLevel =
            searchParams.parentAssociationLevel as SearchFilters['parentAssociationLevel']
        if (searchParams.lessons)
          filters.lessons = searchParams.lessons === 'true'
        if (searchParams.allergySupport)
          filters.allergySupport = searchParams.allergySupport === 'true'

        const result = await getSchools(filters)

        // ログイン済みの場合はお気に入り状態を取得して反映
        if (isLoggedIn) {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const accessToken = session?.access_token

          if (accessToken) {
            const favResult = await getFavorites(accessToken)
            const favSchoolIds = new Set(
              favResult.data.map((f: { school: { id: number } }) => f.school.id)
            )
            setSchools(
              result.data.map((school) => ({
                ...school,
                isFavorited: favSchoolIds.has(school.id),
              }))
            )
          } else {
            setSchools(result.data)
          }
        } else {
          setSchools(result.data)
        }
      } catch (e) {
        setError('園一覧の取得に失敗しました。時間をおいて再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchools()
  }, [isLoggedIn, isAuthLoading, JSON.stringify(searchParams)])

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
      setIsLimitModalOpen(true)
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
        setIsLimitModalOpen(true)
      } else {
        setToast({ message: 'お気に入りの更新に失敗しました', type: 'error' })
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

  return (
    <>
      {/* 上限モーダル */}
      <Modal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        title="お気に入りの上限に達しました"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm text-center">
            お気に入りは5件まで登録できます。
            プレミアムに登録すると無制限に登録できます。
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              setIsLimitModalOpen(false)
              router.push('/plans')
            }}
          >
            プランを確認する
          </Button>
          <button
            onClick={() => setIsLimitModalOpen(false)}
            className="text-gray-400 text-sm text-center"
          >
            キャンセル
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 件数表示 */}
      <p className="text-gray-500 text-sm">
        {schools.length}件の園が見つかりました
      </p>

      {schools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative w-36 h-36">
            <Image
              src="/images/icons/icon10.png"
              alt="検索結果なし"
              fill
              sizes="144px"
              className="object-contain"
            />
          </div>
          <div className="text-center flex flex-col gap-2">
            <p className="font-bold text-gray-800 text-base">
              条件に合う園が
              <br />
              見つかりませんでした
            </p>
            <p className="text-gray-400 text-sm">
              検索条件を変更して
              <br />
              もう一度お試しください
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </>
  )
}
