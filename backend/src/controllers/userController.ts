import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import {
  getOrCreateCurrentUser,
  updateUserProfile,
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
        name: user.name,
        postalCode: user.postalCode,
        address: user.address,
        membershipType: user.planType,
        subscriptionStatus: user.subscription?.status ?? null,
        // 追加: プレミアム機能の利用期限を返す
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

    const { name, postalCode, address } = req.body

    const normalizedPostalCode =
      typeof postalCode === 'string' ? postalCode.replace('-', '') : postalCode

    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'お名前を入力してください',
        },
      })
      return
    }

    if (name.trim().length > 100) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'お名前は100文字以内で入力してください',
        },
      })
      return
    }

    if (
      typeof normalizedPostalCode !== 'string' ||
      !/^\d{7}$/.test(normalizedPostalCode)
    ) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '郵便番号は7桁の数字で入力してください',
        },
      })
      return
    }

    if (typeof address !== 'string' || address.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '住所を入力してください',
        },
      })
      return
    }

    if (address.trim().length > 255) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '住所は255文字以内で入力してください',
        },
      })
      return
    }

    const user = await getOrCreateCurrentUser(authUser)

    const updatedUser = await updateUserProfile(user.id, {
      name: name.trim(),
      postalCode: normalizedPostalCode,
      address: address.trim(),
    })

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
