// src/types/user.ts
// ユーザーデータの型を定義。

export type MembershipType = 'FREE' | 'PAID'

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED'

export type UserPreference = {
  preferredMealType?: string | null
  preferredItemBurdenLevel?: string | null
  preferredDiaperSupport?: string | null
  preferredFutonSupport?: string | null
  preferredExtendedCare?: string | null
  preferredWeekdayEventsLevel?: string | null
  preferredParentAssociationLevel?: string | null
}

export type User = {
  id: string
  email: string
  membershipType: MembershipType
  subscriptionStatus: SubscriptionStatus | null
  preference: UserPreference | null
}
