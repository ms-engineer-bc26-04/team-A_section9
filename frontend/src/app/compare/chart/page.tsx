// 比較詳細チャート画面
// src/app/compare/chart/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import BurdenRadarChart, {
  ChartSchool,
} from '@/components/compare/BurdenRadarChart'
import RecommendedSchoolCard from '@/components/compare/RecommendedSchoolCard'
import { CompareChartSkeleton } from '@/components/common/Skeleton'

const burdenToValue = (level: string) => {
  if (level === 'LOW') return 1
  if (level === 'MEDIUM') return 2
  return 3
}

export default function CompareChartPage() {
  const { isLoggedIn, isLoading: isAuthLoading, isPremium } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<ChartSchool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const idsParam = searchParams.get('ids')

  const fetchCompare = useCallback(
    async (ids: string | null) => {
      if (isAuthLoading) return

      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      if (!isPremium) {
        setError('この画面はプレミアム会員限定です')
        setIsLoading(false)
        return
      }

      if (!ids) {
        setError('比較する園が選択されていません')
        setIsLoading(false)
        return
      }

      const idList = ids.split(',').filter(Boolean)
      if (idList.length < 2) {
        setError('比較するには2園以上選択してください')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        if (!accessToken) return

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schools/compare?ids=${ids}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        if (!res.ok) {
          const json = await res.json()
          setError(json.error?.message || '比較データの取得に失敗しました')
          return
        }

        const json = await res.json()
        const apiSchools = json.data.schools
        const matchHighlights = json.data.matchHighlights

        const chartSchools: ChartSchool[] = apiSchools.map(
          (s: {
            id: string
            name: string
            lifeBurdenLevel: string
            timeBurdenLevel: string
            itemBurdenLevel: string
            weekdayEventsLevel: string
            parentAssociationLevel: string
          }) => {
            const highlights = matchHighlights?.[s.id]
            const matchCount = highlights
              ? Object.values(highlights).filter(Boolean).length
              : 0

            return {
              id: s.id,
              name: s.name,
              lifeBurdenLevel: burdenToValue(s.lifeBurdenLevel),
              timeBurdenLevel: burdenToValue(s.timeBurdenLevel),
              itemBurdenLevel: burdenToValue(s.itemBurdenLevel),
              weekdayEventsLevel: burdenToValue(s.weekdayEventsLevel),
              parentAssociationLevel: burdenToValue(s.parentAssociationLevel),
              matchCount,
            }
          }
        )

        setSchools(chartSchools)
      } catch (e) {
        console.error(e)
        setError('比較データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    },
    [isLoggedIn, isAuthLoading, isPremium, router]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompare(idsParam)
    }, 0)
    return () => clearTimeout(timer)
  }, [idsParam, fetchCompare])

  const schoolCount = idsParam ? idsParam.split(',').filter(Boolean).length : 2

  if (isAuthLoading || isLoading)
    return <CompareChartSkeleton schoolCount={schoolCount} />

  if (error) {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col items-center gap-6 mt-10">
        <div className="text-center flex flex-col gap-2">
          <p className="font-bold text-gray-700 text-base">
            エラーが発生しました
          </p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
        <Link
          href="/mypage/favorites"
          className="bg-[#A0CD83] text-white font-bold px-6 py-3 rounded-full hover:bg-[#82b865] transition-colors"
        >
          お気に入り一覧へ戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 max-w-2xl mx-auto pb-10">
      <div className="pt-4 mb-2">
        <button
          onClick={() => router.back()}
          className="text-gray-500 text-sm font-extrabold"
        >
          ＜戻る
        </button>
      </div>

      <h1 className="font-bold text-gray-800 text-xl mb-1">
        負担バランスで比較
      </h1>
      <p className="text-xs text-gray-700 mb-6">
        5つの負担項目をレーダーチャートで比較できます。
      </p>

      <BurdenRadarChart schools={schools} />
      <RecommendedSchoolCard schools={schools} />
    </div>
  )
}
