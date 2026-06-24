// src/types/user.ts
//ユーザーデータの型を定義。

export type PlanType = 'free' | 'premium'

export type UserPreferences = {
  mealType?: string
  itemBurdenLevel?: string
  diaperSupport?: string
  futonSupport?: string
  extendedCare?: boolean
  weekdayEventsLevel?: string
  parentAssociationLevel?: string
  lessons?: boolean | null // ← ここに追加
  allergySupport?: boolean | null // ← ここに追加
}

export type User = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  postalCode: string | null
  address: string | null
  planType: PlanType
  isPremium: boolean
  favoriteCount: number
  favoriteLimit: number | null
  preferences: UserPreferences
  subscription?: {
    status: 'active' | 'canceled' | 'past_due'
    currentPeriodEnd: string
  }
}
