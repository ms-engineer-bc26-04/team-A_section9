import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import {
  getOrCreateCurrentUser,
  updateUserProfile,
  upsertUserPreference,
} from '../services/userService'
import type {
  UserPreferenceBodyInput,
  UserProfileBodyInput,
} from '../validators/userValidator'

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
        name: user.name,
        postalCode: user.postalCode,
        address: user.address,
        membershipType: user.planType,
        subscriptionStatus: user.subscription?.status ?? null,
        currentPeriodEnd: user.subscription?.currentPeriodEnd ?? null,
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

export const updateMe = async (
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
    const body = req.body as UserProfileBodyInput

    const updatedUser = await updateUserProfile(user.id, body)

    res.status(200).json({
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        postalCode: updatedUser.postalCode,
        address: updatedUser.address,
        membershipType: updatedUser.planType,
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
    const body = req.body as UserPreferenceBodyInput

    const preference = await upsertUserPreference(user.id, body)

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
