import { Request, Response } from 'express'

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: 'checkout session created',
    })
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
      },
    })
  }
}
