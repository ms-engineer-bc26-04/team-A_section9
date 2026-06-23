import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import { getOrCreateCurrentUser } from '../services/userService'
import {
  addUserFavorite,
  deleteUserFavorite,
  FavoriteServiceError,
  getUserFavorites,
} from '../services/favoriteService'
import {
  favoriteBodySchema,
  favoriteParamsSchema,
} from '../validators/favoriteValidator'

const getValidationErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray(error.issues) &&
    error.issues[0]?.message
  ) {
    return error.issues[0].message
  }

  return '入力内容に誤りがあります'
}

const getCurrentUserOrUnauthorized = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.authUser) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'ログインが必要です',
      },
    })
    return null
  }

  return getOrCreateCurrentUser(req.authUser)
}

export const getFavorites = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getCurrentUserOrUnauthorized(req, res)

    if (!user) {
      return
    }

    const result = await getUserFavorites(user.id, user.planType)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const addFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = favoriteBodySchema.safeParse(req.body)

    if (!parsedBody.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(parsedBody.error),
        },
      })
      return
    }

    const user = await getCurrentUserOrUnauthorized(req, res)

    if (!user) {
      return
    }

    const favorite = await addUserFavorite(
      user.id,
      user.planType,
      BigInt(parsedBody.data.schoolId)
    )

    res.status(201).json({
      data: favorite,
    })
  } catch (error) {
    if (error instanceof FavoriteServiceError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      })
      return
    }

    next(error)
  }
}

export const deleteFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = favoriteParamsSchema.safeParse(req.params)

    if (!parsedParams.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(parsedParams.error),
        },
      })
      return
    }

    const user = await getCurrentUserOrUnauthorized(req, res)

    if (!user) {
      return
    }

    await deleteUserFavorite(user.id, BigInt(parsedParams.data.schoolId))

    res.status(200).json({
      data: {
        message: 'お気に入りを解除しました',
      },
    })
  } catch (error) {
    if (error instanceof FavoriteServiceError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      })
      return
    }

    next(error)
  }
}
