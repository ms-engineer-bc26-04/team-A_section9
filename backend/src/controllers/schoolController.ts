import type { RequestHandler } from 'express'
import { getSchoolById, getSchools } from '../services/schoolService'
import {
  schoolIdParamsSchema,
  schoolSearchQuerySchema,
} from '../validators/schoolValidator'

const toSerializableSchool = (school: Record<string, unknown>) => {
  return {
    ...school,
    id: school.id?.toString(),
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

    res.json({
      data: schools.map((school) => toSerializableSchool(school)),
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

    res.json({
      data: toSerializableSchool(school),
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