// User型・希望条件の型定義

export type PlanType = 'free' | 'premium'

export type Preferences = {
  mealType: string | null
  itemBurdenLevel: string | null
  diaperSupport: string | null
  futonSupport: string | null
  extendedCare: boolean
  weekdayEventsLevel: string | null
  parentAssociationLevel: string | null
}

export type AppUser = {
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
  preferences: Preferences | null
}

export type Subscription = {
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: string
}

export type AppUserWithSubscription = AppUser & {
  subscription?: Subscription
}
