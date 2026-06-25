//比較画面
// src/app/compare/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/common/Loading'
import CompareTable, {
  CompareSchool,
  MatchHighlights,
} from '@/components/compare/CompareTable'
import CompareSchoolHeader from '@/components/compare/CompareSchoolHeader'

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
      <button
        onClick={() => router.back()}
        className="text-gray-500 text-sm mb-4 font-extrabold"
      >
        ＜戻る
      </button>

      <h1 className="font-bold text-gray-800 text-xl mb-4">
        {schools.length}つの園で比較
      </h1>

      <CompareSchoolHeader schools={schools} />

      <CompareTable
        schools={schools}
        matchHighlights={matchHighlights}
        isPremium={isPremium}
      />
    </div>
  )
}
