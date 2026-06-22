// src/types/school.ts
//園データの型を定義。

export type SchoolType =
  | 'nursery'
  | 'certified_childcare_center'
  | 'small_scale_nursery'

export type BurdenLevel = 'low' | 'middle' | 'high'

export type MealType = 'school_lunch' | 'lunch_box_required' | 'mixed'

export type DiaperSupport = 'disposed_by_school' | 'take_home' | 'subscription'

export type FutonSupport = 'rental' | 'take_home_weekly' | 'managed_by_school'

export type SchoolSummary = {
  id: number
  name: string
  area: string
  address: string
  phoneNumber: string | null
  imageUrl: string | null
  schoolType: SchoolType
  lifeBurdenLevel: BurdenLevel
  timeBurdenLevel: BurdenLevel
  tags: string[]
  isFavorited: boolean
}

export type SupportInfoLocked = {
  isLocked: true
  message: string
  items: string[]
}

export type SupportInfoUnlocked = {
  isLocked: false
  contactBookType: string
  absenceContactMethod: string
  lessons: string
  allergySupport: string
}

export type SchoolDetail = SchoolSummary & {
  mealType: MealType
  itemBurdenLevel: BurdenLevel
  diaperSupport: DiaperSupport | null
  futonSupport: FutonSupport | null
  extendedCareTime: string | null
  extendedCareUsage: string
  weekdayEventsLevel: BurdenLevel
  parentAssociationLevel: BurdenLevel
  supportInfo: SupportInfoLocked | SupportInfoUnlocked
  description: string
}

export type SearchFilters = {
  keyword?: string
  area?: string
  mealType?: MealType
  diaperSupport?: DiaperSupport
  futonSupport?: FutonSupport
  extendedCareTime?: string
  weekdayEventsLevel?: BurdenLevel
  parentAssociationLevel?: BurdenLevel
  lessons?: boolean
  allergySupport?: boolean
  sort?: 'recommended' | 'createdAtDesc'
  limit?: number
  offset?: number
}
