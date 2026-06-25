import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import type { SchoolSearchQueryInput } from '../validators/schoolValidator'

export type SchoolSearchQuery = SchoolSearchQueryInput

const buildSchoolWhere = (
  query: SchoolSearchQuery
): Prisma.SchoolWhereInput => {
  const keyword = query.keyword || query.q

  return {
    AND: [
      keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { address: { contains: keyword, mode: 'insensitive' } },
              { area: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {},
      query.area ? { area: { contains: query.area, mode: 'insensitive' } } : {},
      query.mealType ? { mealType: query.mealType } : {},

      query.diaperSupport === 'true'
        ? {
            diaperSupport: '園で廃棄',
          }
        : query.diaperSupport
          ? {
              diaperSupport: {
                contains: query.diaperSupport,
                mode: 'insensitive',
              },
            }
          : {},

      query.futonSupport === 'true'
        ? {
            futonSupport: '園で管理',
          }
        : query.futonSupport
          ? {
              futonSupport: {
                contains: query.futonSupport,
                mode: 'insensitive',
              },
            }
          : {},

      query.extendedCareHours
        ? {
            extendedCareHours: {
              contains: query.extendedCareHours,
              mode: 'insensitive',
            },
          }
        : {},

      query.extendedCareUsage === 'true'
        ? {
            extendedCareUsage: '20人以上',
          }
        : query.extendedCareUsage
          ? {
              extendedCareUsage: {
                contains: query.extendedCareUsage,
                mode: 'insensitive',
              },
            }
          : {},

      query.itemBurdenLevel ? { itemBurdenLevel: query.itemBurdenLevel } : {},
      query.weekdayEventsLevel
        ? { weekdayEventsLevel: query.weekdayEventsLevel }
        : {},
      query.parentAssociationLevel
        ? { parentAssociationLevel: query.parentAssociationLevel }
        : {},

      query.lessons === 'true'
        ? {
            lessons: {
              not: null,
            },
          }
        : {},

      query.allergySupport === 'true'
        ? {
            allergySupport: {
              not: null,
            },
          }
        : {},
    ],
  }
}

export const getSchools = async (query: SchoolSearchQuery) => {
  return prisma.school.findMany({
    where: buildSchoolWhere(query),
    orderBy: {
      id: 'asc',
    },
  })
}

type SchoolForRecommendation = Awaited<ReturnType<typeof getSchools>>[number]

// #66対応：ユーザー住所・希望条件をおすすめ順ロジックで使うため、
// preference を含めた User 型を定義
type UserForRecommendation = Prisma.UserGetPayload<{
  include: {
    preference: true
  }
}>

// #66対応：希望条件が1つでも設定されているか判定する
const hasPreference = (user: UserForRecommendation) => {
  const preference = user.preference

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

// #66対応：お気に入り済み園ベースではなく、
// ユーザー住所・希望条件との一致度でおすすめスコアを計算する
const calculateRecommendedScore = (
  school: SchoolForRecommendation,
  user: UserForRecommendation
) => {
  let score = 0
  const preference = user.preference

  if (user.address && user.address.includes(school.area)) {
    score += 10
  }

  if (
    preference?.preferredMealType &&
    preference.preferredMealType === school.mealType
  ) {
    score += 3
  }

  if (
    preference?.preferredItemBurdenLevel &&
    preference.preferredItemBurdenLevel === school.itemBurdenLevel
  ) {
    score += 2
  }

  if (
    preference?.preferredDiaperSupport &&
    preference.preferredDiaperSupport === school.diaperSupport
  ) {
    score += 2
  }

  if (
    preference?.preferredFutonSupport &&
    preference.preferredFutonSupport === school.futonSupport
  ) {
    score += 2
  }

  if (
    preference?.preferredExtendedCare &&
    preference.preferredExtendedCare === school.extendedCareUsage
  ) {
    score += 2
  }

  if (
    preference?.preferredWeekdayEventsLevel &&
    preference.preferredWeekdayEventsLevel === school.weekdayEventsLevel
  ) {
    score += 2
  }

  if (
    preference?.preferredParentAssociationLevel &&
    preference.preferredParentAssociationLevel === school.parentAssociationLevel
  ) {
    score += 2
  }

  if (preference?.preferredLessons === true && school.lessons !== null) {
    score += 1
  }

  if (
    preference?.preferredAllergySupport === true &&
    school.allergySupport !== null
  ) {
    score += 1
  }

  return score
}

// #66対応：sort=recommended のとき、
// ログインユーザーの住所・希望条件をもとに園一覧を並び替える
export const getRecommendedSchools = async (
  query: SchoolSearchQuery,
  userId: string
) => {
  const schools = await getSchools(query)

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      preference: true,
    },
  })

  if (!user) {
    return schools
  }

  if (!user.address && !hasPreference(user)) {
    return schools
  }

  return [...schools].sort((a, b) => {
    const scoreA = calculateRecommendedScore(a, user)
    const scoreB = calculateRecommendedScore(b, user)

    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }

    return Number(a.id - b.id)
  })
}

export const getSchoolById = async (id: bigint) => {
  return prisma.school.findUnique({
    where: {
      id,
    },
  })
}

export const getFavoritedSchoolIds = async (
  userId: string,
  schoolIds: bigint[]
) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      schoolId: {
        in: schoolIds,
      },
    },
    select: {
      schoolId: true,
    },
  })

  return new Set(favorites.map((favorite) => favorite.schoolId.toString()))
}
