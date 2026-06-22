import type { RequestHandler } from 'express'
import { getSchoolById, getSchools } from '../services/schoolService'

const toSerializableSchool = (school: Record<string, unknown>) => {
  return {
    ...school,
    id: school.id?.toString(),
  }
}

export const getSchoolsController: RequestHandler = async (req, res) => {
  try {
    const schools = await getSchools({
      area: typeof req.query.area === 'string' ? req.query.area : undefined,
      extendedCareUsage:
        typeof req.query.extendedCareUsage === 'string'
          ? req.query.extendedCareUsage
          : undefined,
      itemBurdenLevel:
        typeof req.query.itemBurdenLevel === 'string'
          ? req.query.itemBurdenLevel
          : undefined,
      weekdayEventsLevel:
        typeof req.query.weekdayEventsLevel === 'string'
          ? req.query.weekdayEventsLevel
          : undefined,
      mealType:
        typeof req.query.mealType === 'string' ? req.query.mealType : undefined,
    })

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
    const idParam = req.params.id

    if (typeof idParam !== 'string' || !/^\d+$/.test(idParam)) {
      res.status(400).json({
        error: {
          code: 'INVALID_SCHOOL_ID',
          message: '園IDの形式が正しくありません',
        },
      })
      return
    }

    const id = BigInt(idParam)

    const school = await getSchoolById(id)

    if (!school) {
      res.status(404).json({
        error: {
          code: 'SCHOOL_NOT_FOUND',
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
