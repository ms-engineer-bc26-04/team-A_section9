import type { Request, Response } from 'express'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import {
  getOrCreateCurrentUser,
  upsertUserPreference,
} from '../services/userService'

type AuthenticatedRequest = Request & {
  authUser?: SupabaseUser
}

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authUser = req.authUser

    if (!authUser) {
      return res.status(401).json({
        message: '認証が必要です',
      })
    }

    const user = await getOrCreateCurrentUser(authUser)

    return res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        membershipType: user.planType,
        subscriptionStatus: user.subscription?.status ?? null,
        preference: user.preference
          ? {
              preferredMealType: user.preference.preferredMealType,
              preferredItemBurdenLevel:
                user.preference.preferredItemBurdenLevel,
              preferredDiaperSupport: user.preference.preferredDiaperSupport,
              preferredFutonSupport: user.preference.preferredFutonSupport,
              preferredExtendedCare: user.preference.preferredExtendedCare,
              preferredLessons: user.preference.preferredLessons,
              preferredAllergySupport: user.preference.preferredAllergySupport,
              preferredWeekdayEventsLevel:
                user.preference.preferredWeekdayEventsLevel,
              preferredParentAssociationLevel:
                user.preference.preferredParentAssociationLevel,
            }
          : null,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'ユーザー情報の取得に失敗しました',
    })
  }
}

export const updateMyPreference = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const authUser = req.authUser

    if (!authUser) {
      return res.status(401).json({
        message: '認証が必要です',
      })
    }

    const user = await getOrCreateCurrentUser(authUser)
    const preference = await upsertUserPreference(user.id, req.body)

    return res.status(200).json({
      data: {
        preference: {
          preferredMealType: preference.preferredMealType,
          preferredItemBurdenLevel: preference.preferredItemBurdenLevel,
          preferredDiaperSupport: preference.preferredDiaperSupport,
          preferredFutonSupport: preference.preferredFutonSupport,
          preferredExtendedCare: preference.preferredExtendedCare,
          preferredLessons: preference.preferredLessons,
          preferredAllergySupport: preference.preferredAllergySupport,
          preferredWeekdayEventsLevel: preference.preferredWeekdayEventsLevel,
          preferredParentAssociationLevel:
            preference.preferredParentAssociationLevel,
        },
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: '希望条件の更新に失敗しました',
    })
  }
}
