//比較画面
// src/app/compare/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/common/Loading'

type CompareSchool = {
  id: string
  name: string
  area: string
  schoolType: string
  lifeBurden: {
    mealType: string
    itemBurdenDetail: string
    diaperSupport: string | null
    futonSupport: string | null
  }
  timeBurden: {
    extendedCareTime: string | null
    extendedCareUsage: string
    weekdayEvents: string
    parentAssociationFrequency: string
  }
}

type MatchHighlights = {
  [schoolId: string]: {
    mealType: boolean
    itemBurdenDetail: boolean
    diaperSupport: boolean
    futonSupport: boolean
    extendedCare: boolean
    weekdayEvents: boolean
    parentAssociationFrequency: boolean
  }
} | null

//DBからの情報を日本語に変換している
const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  MIXED: '給食・弁当併用',
}
const diaperLabel: Record<string, string> = {
  DISPOSED_BY_SCHOOL: '園で廃棄',
  TAKE_HOME: '持ち帰り',
  SUBSCRIPTION: 'サブスク対応',
}
const futonLabel: Record<string, string> = {
  RENTAL: 'レンタルあり',
  TAKE_HOME_WEEKLY: '毎週持ち帰り',
  MANAGED_BY_SCHOOL: '園で管理',
}

export default function ComparePage() {
  const { isLoggedIn, isLoading: isAuthLoading, appUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<CompareSchool[]>([])
  const [matchHighlights, setMatchHighlights] = useState<MatchHighlights>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const idsParam = searchParams.get('ids')
  const isPremium = appUser?.isPremium ?? false

  const fetchCompare = useCallback(
    async (ids: string | null) => {
      if (isAuthLoading) return

      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      if (!ids) {
        setError('比較する園が選択されていません')
        setIsLoading(false)
        return
      }

      const idList = ids.split(',').filter(Boolean)

      if (idList.some((id) => !/^\d+$/.test(id.trim()))) {
        setError('比較する園の指定が正しくありません')
        setIsLoading(false)
        return
      }

      if (new Set(idList).size !== idList.length) {
        setError('比較する園が重複しています')
        setIsLoading(false)
        return
      }

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
          const code = json.error?.code

          if (code === 'UNAUTHORIZED') {
            router.push('/login')
            return
          } else if (code === 'COMPARE_LIMIT_EXCEEDED') {
            setError(
              '比較できる園数の上限を超えています。お気に入り一覧から選び直してください。'
            )
          } else if (code === 'NOT_FOUND') {
            setError('指定された園が見つかりませんでした。')
          } else if (code === 'VALIDATION_ERROR') {
            setError('比較する園の指定が正しくありません。')
          } else {
            setError(json.error?.message || '比較データの取得に失敗しました')
          }
          return
        }

        const json = await res.json()
        setSchools(json.data.schools)
        setMatchHighlights(json.data.matchHighlights)
      } catch (e: unknown) {
        console.error(e)
        setError(
          e instanceof Error ? e.message : '比較データの取得に失敗しました'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoggedIn, isAuthLoading, router]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompare(idsParam)
    }, 0)

    return () => clearTimeout(timer)
  }, [idsParam, fetchCompare])

  if (isAuthLoading || isLoading) {
    return <Loading />
  }

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
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="text-gray-500 text-sm mb-4 font-extrabold"
      >
        ＜戻る
      </button>

      {/* タイトル */}
      <h1 className="font-bold text-gray-800 text-xl mb-4">
        {schools.length}つの園で比較
      </h1>

      {/* 園の画像・名前 */}
      <div className="flex gap-2 mb-6">
        <div className="w-20 flex-shrink-0" />
        {schools.map((school) => (
          <div
            key={school.id}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <Link href={`/schools/${school.id}`} className="w-full">
              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100">
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Image
                </div>
              </div>
            </Link>
            <Link href={`/schools/${school.id}`}>
              <p className="text-sm font-medium text-center text-gray-800 hover:text-primary">
                {school.name}
              </p>
            </Link>
          </div>
        ))}
      </div>

      {/* 生活負担セクション */}
      <SectionHeader icon="/images/icons/icon5.png" label="生活負担" />
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
        <CompareRow
          label="給食・弁当"
          schools={schools}
          getValue={(s) =>
            mealTypeLabel[s.lifeBurden.mealType] ?? s.lifeBurden.mealType
          }
          highlightKey="mealType"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="持ち物"
          schools={schools}
          getValue={(s) => s.lifeBurden.itemBurdenDetail}
          highlightKey="itemBurdenDetail"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="おむつ対応"
          schools={schools}
          getValue={(s) =>
            s.lifeBurden.diaperSupport
              ? (diaperLabel[s.lifeBurden.diaperSupport] ??
                s.lifeBurden.diaperSupport)
              : 'なし'
          }
          highlightKey="diaperSupport"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="布団対応"
          schools={schools}
          getValue={(s) =>
            s.lifeBurden.futonSupport
              ? (futonLabel[s.lifeBurden.futonSupport] ??
                s.lifeBurden.futonSupport)
              : 'なし'
          }
          highlightKey="futonSupport"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
          isLast
        />
      </div>

      {/* 時間負担セクション */}
      <SectionHeader icon="/images/icons/icon6.png" label="時間負担" />
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
        <CompareRow
          label={`延長保育\nの時間`}
          schools={schools}
          getValue={(s) => s.timeBurden.extendedCareTime ?? 'なし'}
          highlightKey="extendedCare"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label={`延長保育\n利用者`}
          schools={schools}
          getValue={(s) => s.timeBurden.extendedCareUsage ?? 'なし'}
          highlightKey={null}
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="平日行事"
          schools={schools}
          getValue={(s) => s.timeBurden.weekdayEvents}
          highlightKey="weekdayEvents"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="保護者会"
          schools={schools}
          getValue={(s) => s.timeBurden.parentAssociationFrequency}
          highlightKey="parentAssociationFrequency"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
          isLast
        />
      </div>
    </div>
  )
}

// セクション見出し
function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image
          src={icon}
          alt={label}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      <p className="font-medium text-gray-800 text-base">{label}</p>
    </div>
  )
}

// 比較行
type CompareRowProps = {
  label: string
  schools: CompareSchool[]
  getValue: (school: CompareSchool) => string
  highlightKey: string | null
  matchHighlights: MatchHighlights
  isPremium: boolean
  isLast?: boolean
}

function CompareRow({
  label,
  schools,
  getValue,
  highlightKey,
  matchHighlights,
  isPremium,
  isLast = false,
}: CompareRowProps) {
  return (
    <div className={`flex ${!isLast ? 'border-b border-gray-200' : ''}`}>
      {/* 項目名 */}
      <div className="w-20 flex-shrink-0 px-2 py-3 flex items-center">
        <p className="text-xs text-gray-700 whitespace-pre-line leading-tight">
          {label}
        </p>
      </div>

      {/* 各園の値 */}
      {schools.map((school) => {
        const isMatch =
          isPremium &&
          highlightKey &&
          matchHighlights?.[String(school.id)]?.[
            highlightKey as keyof (typeof matchHighlights)[string]
          ]

        return (
          <div
            key={school.id}
            className={`flex-1 px-2 py-3 flex items-center justify-center border-l border-gray-200 ${
              isMatch ? 'bg-primary-light' : ''
            }`}
          >
            <p
              className={`text-xs text-center ${isMatch ? 'font-bold text-primary' : 'text-gray-800'}`}
            >
              {getValue(school)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
