import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './authMiddleware'
import { prisma } from '../lib/prisma'

export type SchoolAdminRequest = AuthenticatedRequest & {
  schoolAdmin?: {
    id: string
    userId: string
    schoolId: bigint
  }
}

export const requireSchoolAdmin = async (
  req: SchoolAdminRequest,
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

    const user = await prisma.user.findUnique({
      where: {
        supabaseUserId: req.authUser.id,
      },
    })

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ユーザー情報が見つかりません',
        },
      })
    }

    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!schoolAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
    }

    req.schoolAdmin = {
      id: schoolAdmin.id,
      userId: schoolAdmin.userId,
      schoolId: schoolAdmin.schoolId,
    }

    next()
  } catch (error) {
    next(error)
  }
}
