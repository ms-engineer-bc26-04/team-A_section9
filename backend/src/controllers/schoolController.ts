import type { RequestHandler } from 'express'
import { getSchoolById, getSchools } from '../services/schoolService'
import {
  schoolIdParamsSchema,
  schoolSearchQuerySchema,
} from '../validators/schoolValidator'

const SCHOOL_TYPE_TAGS: Record<string, string> = {
  NURSERY: '保育園',
  KINDERGARTEN: '幼稚園',
  CERTIFIED_CHILDCARE_CENTER: 'こども園',
}

const MEAL_TYPE_TAGS: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食',
  LUNCH_BOX: '毎日弁当',
  BOTH: '給食・弁当',
}

const getSchoolTags = (school: Record<string, unknown>) => {
  const tags: string[] = []

  if (
    typeof school.schoolType === 'string' &&
    SCHOOL_TYPE_TAGS[school.schoolType]
  ) {
    tags.push(SCHOOL_TYPE_TAGS[school.schoolType])
  }

  if (typeof school.mealType === 'string' && MEAL_TYPE_TAGS[school.mealType]) {
    tags.push(MEAL_TYPE_TAGS[school.mealType])
  }

  if (typeof school.diaperSupport === 'string') {
    if (school.diaperSupport.includes('園で廃棄')) {
      tags.push('おむつ園処理')
    } else if (school.diaperSupport.includes('サブスク')) {
      tags.push('おむつサブスク')
    } else if (school.diaperSupport.includes('持ち帰り')) {
      tags.push('おむつ持ち帰り')
    }
  }

  return tags
}

const toSerializableSchool = (school: Record<string, unknown>) => {
  return {
    ...school,
    id: school.id?.toString(),
    tags: getSchoolTags(school),
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
