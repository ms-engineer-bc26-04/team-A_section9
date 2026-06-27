import type {
  MembershipType,
  School,
  Subscription,
  UserPreference,
} from '@prisma/client'
import { prisma } from '../lib/prisma'

const FREE_COMPARE_LIMIT = 2
const PREMIUM_COMPARE_LIMIT = 3

type UserForCompare = {
  id: string
  planType: MembershipType
  subscription: Subscription | null
  preference: UserPreference | null
}

type MatchHighlight = {
  mealType: boolean
  itemBurdenLevel: boolean
  diaperSupport: boolean
  futonSupport: boolean
  extendedCare: boolean
  lessons: boolean
  allergySupport: boolean
  weekdayEventsLevel: boolean
  parentAssociationLevel: boolean
}

type MatchHighlights = Record<string, MatchHighlight>

export class CompareServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
  }
}

const isPremiumUser = (user: UserForCompare) => {
  return user.subscription?.status === 'ACTIVE' || user.planType === 'PAID'
}

const getCompareLimit = (user: UserForCompare) => {
  return isPremiumUser(user) ? PREMIUM_COMPARE_LIMIT : FREE_COMPARE_LIMIT
}

const hasPreference = (preference: UserPreference | null) => {
  if (!preference) {
    return false
  }

  return Boolean(
    preference.preferredMealType ||
    preference.preferredItemBurdenLevel ||
    preference.preferredDiaperSupport ||
    preference.preferredFutonSupport ||
    preference.preferredExtendedCare ||
    preference.preferredLessons !== null ||
    preference.preferredAllergySupport !== null ||
    preference.preferredWeekdayEventsLevel ||
    preference.preferredParentAssociationLevel
  )
}

// #60対応：希望条件と園情報の一致結果を、API設計書に合わせて boolean map で返す
const getMatchHighlight = (
  school: School,
  preference: UserPreference
): MatchHighlight => {
  return {
    mealType: Boolean(
      preference.preferredMealType &&
      preference.preferredMealType === school.mealType
    ),
    itemBurdenLevel: Boolean(
      preference.preferredItemBurdenLevel &&
      preference.preferredItemBurdenLevel === school.itemBurdenLevel
    ),
    diaperSupport: Boolean(
      preference.preferredDiaperSupport &&
      preference.preferredDiaperSupport === school.diaperSupport
    ),
    futonSupport: Boolean(
      preference.preferredFutonSupport &&
      preference.preferredFutonSupport === school.futonSupport
    ),
    extendedCare: Boolean(
      preference.preferredExtendedCare &&
      preference.preferredExtendedCare === school.extendedCareUsage
    ),
    lessons: Boolean(
      preference.preferredLessons === true && school.lessons !== null
    ),
    allergySupport: Boolean(
      preference.preferredAllergySupport === true &&
      school.allergySupport !== null
    ),
    weekdayEventsLevel: Boolean(
      preference.preferredWeekdayEventsLevel &&
      preference.preferredWeekdayEventsLevel === school.weekdayEventsLevel
    ),
    parentAssociationLevel: Boolean(
      preference.preferredParentAssociationLevel &&
      preference.preferredParentAssociationLevel ===
        school.parentAssociationLevel
    ),
  }
}

// #60対応：プレミアムユーザーのみ matchHighlights を返す
// 一般ユーザー、または希望条件未設定の場合は null を返す
const buildMatchHighlights = (
  schools: School[],
  user: UserForCompare
): MatchHighlights | null => {
  if (!isPremiumUser(user) || !hasPreference(user.preference)) {
    return null
  }

  const preference = user.preference

  if (!preference) {
    return null
  }

  return schools.reduce<MatchHighlights>((highlights, school) => {
    highlights[school.id.toString()] = getMatchHighlight(school, preference)

    return highlights
  }, {})
}

const toCompareSchool = (school: School) => {
  return {
    id: school.id.toString(),
    name: school.name,
    area: school.area,
    schoolType: school.schoolType,
    lifeBurden: {
      mealType: school.mealType,

      // 比較画面では enum の itemBurdenLevel ではなく、
      // DBのテキストカラム itemBurdenDetail をそのまま返す
      itemBurdenDetail: school.itemBurdenDetail,

      diaperSupport: school.diaperSupport,
      futonSupport: school.futonSupport,
    },
    timeBurden: {
      extendedCareTime: school.extendedCareHours,
      extendedCareUsage: school.extendedCareUsage,

      // 比較画面では enum の weekdayEventsLevel ではなく、
      // DBのテキストカラム weekdayEvents をそのまま返す
      weekdayEvents: school.weekdayEvents,

      // 比較画面では enum の parentAssociationLevel ではなく、
      // DBのテキストカラム parentAssociationFrequency をそのまま返す
      parentAssociationFrequency: school.parentAssociationFrequency,
    },
    supportInfo: {
      contactBookType: school.contactBookType,
      absenceContactMethod: school.absenceContactMethod,
      lessons: school.lessons,
      allergySupport: school.allergySupport,
    },
  }
}

export const getComparedSchools = async (
  user: UserForCompare,
  schoolIds: bigint[]
) => {
  const compareLimit = getCompareLimit(user)

  if (schoolIds.length > compareLimit) {
    // #60対応：一般ユーザーがプレミアム枠の3園比較を使おうとした場合は FORBIDDEN を返す
    if (!isPremiumUser(user) && schoolIds.length <= PREMIUM_COMPARE_LIMIT) {
      throw new CompareServiceError(
        403,
        'FORBIDDEN',
        'この機能を利用する権限がありません'
      )
    }

    const message = isPremiumUser(user)
      ? 'プレミアムユーザーは3園まで比較できます'
      : '一般ユーザーは2園まで比較できます'

    throw new CompareServiceError(403, 'COMPARE_LIMIT_EXCEEDED', message)
  }

  const schools = await prisma.school.findMany({
    where: {
      id: {
        in: schoolIds,
      },
    },
  })

  if (schools.length !== schoolIds.length) {
    throw new CompareServiceError(
      404,
      'NOT_FOUND',
      '指定された園が見つかりません'
    )
  }

  const schoolOrderMap = new Map(
    schoolIds.map((schoolId, index) => [schoolId.toString(), index])
  )

  const sortedSchools = schools.sort((a, b) => {
    return (
      (schoolOrderMap.get(a.id.toString()) ?? 0) -
      (schoolOrderMap.get(b.id.toString()) ?? 0)
    )
  })

  return {
    schools: sortedSchools.map((school) => toCompareSchool(school)),
    matchHighlights: buildMatchHighlights(sortedSchools, user),
  }
}
