//比較詳細チャート画面
// src/app/compare/chart/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/common/Loading'

type ChartSchool = {
  id: string
  name: string
  lifeBurdenLevel: number
  timeBurdenLevel: number
  itemBurdenLevel: number
  weekdayEventsLevel: number
  parentAssociationLevel: number
  matchCount: number
}

const burdenToValue = (level: string) => {
  if (level === 'LOW') return 1
  if (level === 'MEDIUM') return 2
  return 3
}

// TODO: APIにlifeBurdenLevelなどが追加されたら仮データを削除する
const MOCK_BURDEN: Record<
  string,
  {
    lifeBurdenLevel: string
    timeBurdenLevel: string
    itemBurdenLevel: string
    weekdayEventsLevel: string
    parentAssociationLevel: string
  }
> = {
  '67': {
    lifeBurdenLevel: 'LOW',
    timeBurdenLevel: 'LOW',
    itemBurdenLevel: 'LOW',
    weekdayEventsLevel: 'LOW',
    parentAssociationLevel: 'LOW',
  },
  '68': {
    lifeBurdenLevel: 'LOW',
    timeBurdenLevel: 'MEDIUM',
    itemBurdenLevel: 'LOW',
    weekdayEventsLevel: 'MEDIUM',
    parentAssociationLevel: 'LOW',
  },
  '69': {
    lifeBurdenLevel: 'MEDIUM',
    timeBurdenLevel: 'LOW',
    itemBurdenLevel: 'MEDIUM',
    weekdayEventsLevel: 'LOW',
    parentAssociationLevel: 'MEDIUM',
  },
  '70': {
    lifeBurdenLevel: 'LOW',
    timeBurdenLevel: 'MEDIUM',
    itemBurdenLevel: 'LOW',
    weekdayEventsLevel: 'MEDIUM',
    parentAssociationLevel: 'LOW',
  },
  '71': {
    lifeBurdenLevel: 'MEDIUM',
    timeBurdenLevel: 'LOW',
    itemBurdenLevel: 'MEDIUM',
    weekdayEventsLevel: 'LOW',
    parentAssociationLevel: 'MEDIUM',
  },
  '72': {
    lifeBurdenLevel: 'HIGH',
    timeBurdenLevel: 'MEDIUM',
    itemBurdenLevel: 'HIGH',
    weekdayEventsLevel: 'MEDIUM',
    parentAssociationLevel: 'HIGH',
  },
}

const CHART_COLORS = ['#A0CD83', '#F5A623', '#FF8C8C']

const AXES = [
  { key: 'lifeBurdenLevel', label: '生活負担' },
  { key: 'timeBurdenLevel', label: '時間負担' },
  { key: 'itemBurdenLevel', label: '持ち物負担' },
  { key: 'weekdayEventsLevel', label: '平日行事の多さ' },
  { key: 'parentAssociationLevel', label: '保護者会の負担' },
]

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
          (s: { id: string; name: string }) => {
            const mock = MOCK_BURDEN[s.id] ?? {
              lifeBurdenLevel: 'MEDIUM',
              timeBurdenLevel: 'MEDIUM',
              itemBurdenLevel: 'MEDIUM',
              weekdayEventsLevel: 'MEDIUM',
              parentAssociationLevel: 'MEDIUM',
            }
            const highlights = matchHighlights?.[s.id]
            const matchCount = highlights
              ? Object.values(highlights).filter(Boolean).length
              : 0

            return {
              id: s.id,
              name: s.name,
              lifeBurdenLevel: burdenToValue(mock.lifeBurdenLevel),
              timeBurdenLevel: burdenToValue(mock.timeBurdenLevel),
              itemBurdenLevel: burdenToValue(mock.itemBurdenLevel),
              weekdayEventsLevel: burdenToValue(mock.weekdayEventsLevel),
              parentAssociationLevel: burdenToValue(
                mock.parentAssociationLevel
              ),
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

  const recommendedSchool =
    schools.length > 0
      ? schools.reduce((a, b) => (a.matchCount >= b.matchCount ? a : b))
      : null

  const chartData = AXES.map((axis) => {
    const entry: Record<string, string | number> = { subject: axis.label }
    schools.forEach((s) => {
      entry[s.name] = s[axis.key as keyof ChartSchool] as number
    })
    return entry
  })

  if (isAuthLoading || isLoading) return <Loading />

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

      {/* 凡例 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
        {schools.map((school, i) => (
          <div key={school.id} className="flex items-center gap-1">
            <span
              className="inline-block w-6 h-0.5"
              style={{ backgroundColor: CHART_COLORS[i] }}
            />
            <span className="text-xs text-gray-700">{school.name}</span>
          </div>
        ))}
      </div>

      {/* レーダーチャート */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
          >
            {' '}
            {/* 左右marginを拡大 */}
            <PolarGrid />
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => {
                const { x, y, payload } = props as {
                  x: number
                  y: number
                  payload: { value: string }
                }
                const value = payload.value
                const lines = value.split('の')
                // textAnchorをstringではなくSVGの型に合わせる
                const anchor = x > 200 ? 'start' : x < 150 ? 'end' : 'middle'
                if (lines.length === 2) {
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={anchor as 'start' | 'end' | 'middle'}
                      fill="#555"
                      fontSize={11}
                    >
                      <tspan x={x} dy="0">
                        {lines[0]}の
                      </tspan>
                      <tspan x={x} dy="14">
                        {lines[1]}
                      </tspan>
                    </text>
                  )
                }
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor as 'start' | 'end' | 'middle'}
                    fill="#555"
                    fontSize={11}
                  >
                    <tspan>{value}</tspan>
                  </text>
                )
              }}
            />
            {schools.map((school, i) => (
              <Radar
                key={school.id}
                name={school.name}
                dataKey={school.name}
                stroke={CHART_COLORS[i]}
                fill={CHART_COLORS[i]}
                fillOpacity={0.15}
                dot={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 注釈 */}
      <p className="text-[10px] text-gray-400 text-center mb-6">
        ※チャートが大きいほど負担が大きくなります
      </p>

      {/* あなたにおすすめ */}
      {recommendedSchool && recommendedSchool.matchCount > 0 && (
        <div className="bg-[#fff1db] rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/images/icon21.png"
                alt="おすすめ"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <p className="font-bold text-gray-800 text-base">
              あなたにおすすめ
            </p>
          </div>
          <p className="text-sm text-gray-700">
            {recommendedSchool.name}は<br />
            あなたの希望条件に合っていておすすめです
          </p>
        </div>
      )}
    </div>
  )
}
