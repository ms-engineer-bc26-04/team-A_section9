import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import { getOrCreateCurrentUser } from '../services/userService'

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
    }

    const user = await getOrCreateCurrentUser(req.authUser)

    return res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        membershipType: user.planType,
        subscriptionStatus: user.subscription?.status ?? null,
      },
    })
  } catch (error) {
    next(error)
  }
}
