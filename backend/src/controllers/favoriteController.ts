import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import {
  addUserFavorite,
  deleteUserFavorite,
  FavoriteServiceError,
  getUserFavorites,
} from '../services/favoriteService'
import { getOrCreateCurrentUser } from '../services/userService'

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
    const user = await getCurrentUserOrUnauthorized(req, res)

    if (!user) {
      return
    }

    const favorite = await addUserFavorite(
      user.id,
      user.planType,
      BigInt(req.body.schoolId)
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
    const user = await getCurrentUserOrUnauthorized(req, res)

    if (!user) {
      return
    }

    await deleteUserFavorite(user.id, BigInt(String(req.params.schoolId)))
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
