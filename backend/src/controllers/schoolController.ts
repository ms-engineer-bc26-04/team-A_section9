import type { RequestHandler } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'
import {
  getFavoritedSchoolIds,
  getRecommendedSchools,
  getSchoolById,
  getSchools,
} from '../services/schoolService'
import { getOrCreateCurrentUser } from '../services/userService'
import type { SchoolSearchQueryInput } from '../validators/schoolValidator'

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

const SUPPORT_FIELDS = {
  contactBookType: null,
  absenceContactMethod: null,
  lessons: null,
  allergySupport: null,
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

const isPremiumUser = (
  user: Awaited<ReturnType<typeof getOrCreateCurrentUser>> | null
) => {
  if (!user) {
    return false
  }

  return user.subscription?.status === 'ACTIVE' || user.planType === 'PAID'
}

const toSchoolListItem = (
  school: Record<string, unknown>,
  isFavorited = false
) => {
  return {
    id: school.id?.toString(),
    name: school.name,
    area: school.area,
    address: school.address,

    // NOTE: 園一覧画面で表示する園画像URL
    imageUrl: school.imageUrl,

    schoolType: school.schoolType,
    lifeBurdenLevel: school.lifeBurdenLevel,
    timeBurdenLevel: school.timeBurdenLevel,
    mealType: school.mealType,
    itemBurdenLevel: school.itemBurdenLevel,
    diaperSupport: school.diaperSupport,
    futonSupport: school.futonSupport,
    extendedCareHours: school.extendedCareHours,
    extendedCareUsage: school.extendedCareUsage,
    weekdayEventsLevel: school.weekdayEventsLevel,
    parentAssociationLevel: school.parentAssociationLevel,
    tags: getSchoolTags(school),
    isFavorited,
  }
}

const toSupportInfo = (
  school: Record<string, unknown>,
  canViewSupportInfo: boolean
) => {
  if (!canViewSupportInfo) {
    return {
      isLocked: true,
      ...SUPPORT_FIELDS,
    }
  }

  return {
    isLocked: false,
    contactBookType: school.contactBookType,
    absenceContactMethod: school.absenceContactMethod,
    lessons: school.lessons,
    allergySupport: school.allergySupport,
  }
}

const toSchoolDetail = (
  school: Record<string, unknown>,
  isFavorited = false,
  canViewSupportInfo = false
) => {
  return {
    id: school.id?.toString(),
    name: school.name,
    area: school.area,
    address: school.address,

    // NOTE: 園詳細画面で表示する園画像URL
    imageUrl: school.imageUrl,

    schoolType: school.schoolType,
    lifeBurdenLevel: school.lifeBurdenLevel,
    timeBurdenLevel: school.timeBurdenLevel,
    mealType: school.mealType,
    itemBurdenLevel: school.itemBurdenLevel,

    // NOTE: 園詳細画面では、持ち物負担の表示用テキストも返す
    itemBurdenDetail: school.itemBurdenDetail,

    diaperSupport: school.diaperSupport,
    futonSupport: school.futonSupport,
    extendedCareHours: school.extendedCareHours,
    extendedCareUsage: school.extendedCareUsage,
    weekdayEventsLevel: school.weekdayEventsLevel,

    // NOTE: 園詳細画面では、平日行事の表示用テキストも返す
    weekdayEvents: school.weekdayEvents,

    parentAssociationLevel: school.parentAssociationLevel,

    // NOTE: 園詳細画面では、保護者会頻度の表示用テキストも返す
    parentAssociationFrequency: school.parentAssociationFrequency,

    description: school.description,
    tags: getSchoolTags(school),
    isFavorited,
    supportInfo: toSupportInfo(school, canViewSupportInfo),
  }
}

const getCurrentUserIfAuthenticated = async (req: AuthenticatedRequest) => {
  if (!req.authUser) {
    return null
  }

  return getOrCreateCurrentUser(req.authUser)
}

export const getSchoolsController: RequestHandler = async (req, res) => {
  try {
    const query = (res.locals.validatedQuery ??
      req.query) as SchoolSearchQueryInput

    const user = await getCurrentUserIfAuthenticated(
      req as AuthenticatedRequest
    )

    const schools =
      query.sort === 'recommended' && user
        ? await getRecommendedSchools(query, user.id)
        : await getSchools(query)

    const favoritedSchoolIds = user
      ? await getFavoritedSchoolIds(
          user.id,
          schools.map((school) => school.id)
        )
      : new Set<string>()

    res.json({
      data: schools.map((school) =>
        toSchoolListItem(school, favoritedSchoolIds.has(school.id.toString()))
      ),
      meta: {
        count: schools.length,
      },
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
    const id = BigInt(String(req.params.id))

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

    const user = await getCurrentUserIfAuthenticated(
      req as AuthenticatedRequest
    )

    const favoritedSchoolIds = user
      ? await getFavoritedSchoolIds(user.id, [school.id])
      : new Set<string>()

    res.json({
      data: toSchoolDetail(
        school,
        favoritedSchoolIds.has(school.id.toString()),
        isPremiumUser(user)
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
