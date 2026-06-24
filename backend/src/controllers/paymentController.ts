import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/authMiddleware'
import { createCheckoutSessionService } from '../services/paymentService'

export const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response
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

    const result = await createCheckoutSessionService(req.authUser.id)

    return res.status(200).json({
      data: result,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_PREMIUM') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'すでにプレミアムユーザーです',
        },
      })
    }

    return res.status(500).json({
      error: {
        code: 'PAYMENT_ERROR',
        message: '決済処理に失敗しました',
      },
    })
  }
}
