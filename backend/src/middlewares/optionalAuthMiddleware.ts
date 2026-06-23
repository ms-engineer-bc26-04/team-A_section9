import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './authMiddleware'
import { supabase } from '../lib/supabase'

export const optionalAuthenticateSupabaseUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      next()
      return
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
      return
    }

    const accessToken = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
      return
    }

    req.authUser = user
    next()
  } catch (error) {
    next(error)
  }
}
