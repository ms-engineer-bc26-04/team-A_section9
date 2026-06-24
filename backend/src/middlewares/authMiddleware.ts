import type { NextFunction, Request, Response } from 'express'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { prisma } from '../lib/prisma'

export type AuthenticatedRequest = Request & {
  authUser?: SupabaseUser
}

export const authenticateSupabaseUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
    }
    await prisma.user.upsert({
      where: {
        supabaseUserId: user.id,
      },
      update: {
        email: user.email ?? '',
      },
      create: {
        supabaseUserId: user.id,
        email: user.email ?? '',
        planType: 'FREE',
      },
    })

    req.authUser = user
    next()
  } catch (error) {
    next(error)
  }
}
