import type { MembershipType, School, Subscription } from '@prisma/client'
import { prisma } from '../lib/prisma'

const FREE_COMPARE_LIMIT = 2
const PREMIUM_COMPARE_LIMIT = 3

type UserForCompare = {
  id: string
  planType: MembershipType
  subscription: Subscription | null
}

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
  }
}

export const getComparedSchools = async (
  user: UserForCompare,
  schoolIds: bigint[]
) => {
  const compareLimit = getCompareLimit(user)

  if (schoolIds.length > compareLimit) {
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
    matchHighlights: null,
  }
}