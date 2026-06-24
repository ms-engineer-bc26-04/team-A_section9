// 検索結果画面専用の園一覧コンポーネント
// src/components/school/SearchSchoolList.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SchoolCard from './SchoolCard'
import Toast from '@/components/common/Toast'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSchools } from '@/lib/api/schools'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { SchoolSummary, SearchFilters } from '@/types/school'

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

  const { isFavorited, addFavorite, removeFavorite } = useFavorites(isLoggedIn)

  //
  const fetchSchools = useCallback(async () => {
    if (isAuthLoading) return

    try {
      setIsLoading(true)

      const filters: SearchFilters = {}
      if (searchParams.keyword) filters.keyword = String(searchParams.keyword)
      if (searchParams.area) filters.area = String(searchParams.area)
      if (searchParams.hasLunch === 'true') filters.mealType = 'SCHOOL_LUNCH'
      if (searchParams.diaperDisposal === 'true')
        filters.diaperSupport = '園で廃棄'
      if (searchParams.noBedding === 'true') filters.futonSupport = '園で管理'
      if (searchParams.noWeekdayEvents === 'true')
        filters.weekdayEventsLevel = 'LOW'
      if (searchParams.noPTA === 'true') filters.parentAssociationLevel = 'LOW'
      if (searchParams.hasClub === 'true') filters.lessons = true
      if (searchParams.allergySupport === 'true') filters.allergySupport = true

      const result = await getSchools(filters)
      setSchools(result.data)
    } catch (e) {
      console.error(e)
      setError('園一覧の取得に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }, [
    isAuthLoading,
    searchParams.keyword,
    searchParams.area,
    searchParams.hasLunch,
    searchParams.diaperDisposal,
    searchParams.noBedding,
    searchParams.noWeekdayEvents,
    searchParams.noPTA,
    searchParams.hasClub,
    searchParams.allergySupport,
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchools()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchSchools])

  const handleToggleFavorite = async (schoolId: number) => {
    if (!isLoggedIn) return

    const currentlyFavorited = isFavorited(schoolId)

    // 一般ユーザーの上限チェック
    if (
      !currentlyFavorited &&
      appUser?.isPremium === false &&
      (appUser?.favoriteCount ?? 0) >= 5
    ) {
      setIsLimitModalOpen(true)
      return
    }

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
              見見つかりませんでした
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
              school={{
                ...school,
                isFavorited: isFavorited(school.id),
              }}
              isLoggedIn={isLoggedIn}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </>
  )
}
