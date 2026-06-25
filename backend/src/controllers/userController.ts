import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import {
  getOrCreateCurrentUser,
  upsertUserPreference,
} from '../services/userService'

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUser = req.authUser

    if (!authUser) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      return
    }

    const user = await getOrCreateCurrentUser(authUser)

    res.status(200).json({
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
    next(error)
  }
}

export const updateMyPreference = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUser = req.authUser

    if (!authUser) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      return
    }

    const user = await getOrCreateCurrentUser(authUser)
    const preference = await upsertUserPreference(user.id, req.body)

    res.status(200).json({
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
    next(error)
  }
}
