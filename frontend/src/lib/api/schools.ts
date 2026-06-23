//バックエンドの園APIを叩く関数群
// src/lib/api/schools.ts
import { SchoolSummary, SchoolDetail, SearchFilters } from '@/types/school'

// サーバーコンポーネントからはINTERNAL_API_URL、ブラウザからはNEXT_PUBLIC_API_URLを使う
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL
}

export async function getSchools(
  filters?: SearchFilters
): Promise<{ data: SchoolSummary[]; meta?: { total: number } }> {
  const params = new URLSearchParams()

  if (filters?.keyword) params.set('keyword', filters.keyword)
  if (filters?.area) params.set('area', filters.area)
  if (filters?.mealType) params.set('mealType', filters.mealType)
  if (filters?.diaperSupport) params.set('diaperSupport', filters.diaperSupport)
  if (filters?.futonSupport) params.set('futonSupport', filters.futonSupport)
  if (filters?.weekdayEventsLevel)
    params.set('weekdayEventsLevel', filters.weekdayEventsLevel)
  if (filters?.parentAssociationLevel)
    params.set('parentAssociationLevel', filters.parentAssociationLevel)
  if (filters?.lessons !== undefined)
    params.set('lessons', String(filters.lessons))
  if (filters?.allergySupport !== undefined)
    params.set('allergySupport', String(filters.allergySupport))
  if (filters?.sort) params.set('sort', filters.sort)
  if (filters?.limit !== undefined) params.set('limit', String(filters.limit))
  if (filters?.offset !== undefined)
    params.set('offset', String(filters.offset))

  const res = await fetch(
    `${getApiUrl()}/api/v1/schools?${params.toString()}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    throw new Error('園一覧の取得に失敗しました')
  }

  return res.json()
}

export async function getSchool(id: string): Promise<{ data: SchoolDetail }> {
  const res = await fetch(`${getApiUrl()}/api/v1/schools/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('園詳細の取得に失敗しました')
  }

  return res.json()
}
