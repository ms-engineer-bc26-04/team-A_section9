import type { RequestHandler } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import { getOrCreateCurrentUser } from '../services/userService'
import {
  getFavoritedSchoolIds,
  getSchoolById,
  getSchools,
} from '../services/schoolService'
import {
  schoolIdParamsSchema,
  schoolSearchQuerySchema,
} from '../validators/schoolValidator'

const toSerializableSchool = (
  school: Record<string, unknown>,
  isFavorited = false
) => {
  return {
    ...school,
    id: school.id?.toString(),
    isFavorited,
  }
}

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

const getCurrentUserIdIfAuthenticated = async (req: AuthenticatedRequest) => {
  if (!req.authUser) {
    return null
  }

  const user = await getOrCreateCurrentUser(req.authUser)

  return user.id
}

export const getSchoolsController: RequestHandler = async (req, res) => {
  try {
    const parsedQuery = schoolSearchQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(parsedQuery.error),
        },
      })
      return
    }

    const schools = await getSchools(parsedQuery.data)
    const userId = await getCurrentUserIdIfAuthenticated(
      req as AuthenticatedRequest
    )

    const favoritedSchoolIds = userId
      ? await getFavoritedSchoolIds(
          userId,
          schools.map((school) => school.id)
        )
      : new Set<string>()

    res.json({
      data: schools.map((school) =>
        toSerializableSchool(
          school,
          favoritedSchoolIds.has(school.id.toString())
        )
      ),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '園一覧の取得に失敗しました',
      },
    })
  }
}

export const getSchoolByIdController: RequestHandler = async (req, res) => {
  try {
    const parsedParams = schoolIdParamsSchema.safeParse(req.params)

    if (!parsedParams.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: getValidationErrorMessage(parsedParams.error),
        },
      })
      return
    }

    const id = BigInt(parsedParams.data.id)

    const school = await getSchoolById(id)

    if (!school) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: '指定された園が見つかりません',
        },
      })
      return
    }

    const userId = await getCurrentUserIdIfAuthenticated(
      req as AuthenticatedRequest
    )

    const favoritedSchoolIds = userId
      ? await getFavoritedSchoolIds(userId, [school.id])
      : new Set<string>()

    res.json({
      data: toSerializableSchool(
        school,
        favoritedSchoolIds.has(school.id.toString())
      ),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '園詳細の取得に失敗しました',
      },
    })
  }
}
