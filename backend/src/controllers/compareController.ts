import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import { getOrCreateCurrentUser } from '../services/userService'
import {
  CompareServiceError,
  getComparedSchools,
} from '../services/compareService'
import {
  compareQuerySchema,
  parseCompareSchoolIds,
} from '../validators/compareValidator'

const getValidationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray(error.issues) &&
    error.issues[0]?.message
  ) {
    return error.issues[0].message
  }

  return '比較対象の園IDが不正です'
}

export const getCompareSchoolsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.authUser) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      return
    }

    const parsedQuery = compareQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(parsedQuery.error),
        },
      })
      return
    }

    let schoolIds: bigint[]

    try {
      schoolIds = parseCompareSchoolIds(parsedQuery.data.ids)
    } catch (error) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(error),
        },
      })
      return
    }

    const user = await getOrCreateCurrentUser(req.authUser)
    const result = await getComparedSchools(user, schoolIds)

    res.status(200).json({
      data: result,
    })
  } catch (error) {
    if (error instanceof CompareServiceError) {
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
