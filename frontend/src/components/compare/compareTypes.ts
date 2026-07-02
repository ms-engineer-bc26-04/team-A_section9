// 比較機能で使う型定義
// src/components/compare/compareTypes.ts

export type SupportInfo = {
  contactBookType: string | null
  absenceContactMethod: string | null
  lessons: string | null
  allergySupport: string | null
}

export type CompareSchool = {
  id: string
  name: string
  area: string
  schoolType: string
  imageUrl: string | null
  lifeBurdenLevel: string
  timeBurdenLevel: string
  itemBurdenLevel: string
  weekdayEventsLevel: string
  parentAssociationLevel: string
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
  supportInfo?: SupportInfo | null
}

export type MatchHighlights = {
  [schoolId: string]: {
    mealType: boolean
    itemBurdenLevel: boolean
    diaperSupport: boolean
    futonSupport: boolean
    extendedCare: boolean
    lessons: boolean
    allergySupport: boolean
    weekdayEventsLevel: boolean
    parentAssociationLevel: boolean
  }
} | null
