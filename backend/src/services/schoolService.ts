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

      // おむつ園処理あり
      // フロントから diaperSupport=true が送られてきた場合は、
      // "true" という文字列の部分一致検索ではなく、
      // seed定義に合わせて diaperSupport が「園で廃棄」の園を取得する
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

      // 布団負担少なめ
      // フロントから futonSupport=true が送られてきた場合は、
      // "true" という文字列の部分一致検索ではなく、
      // seed定義に合わせて futonSupport が「園で管理」の園を取得する
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

      // 延長保育利用者が多い
      // フロントから extendedCareUsage=true が送られてきた場合は、
      // "true" という文字列の部分一致検索ではなく、
      // seed定義に合わせて extendedCareUsage が「20人以上」の園を取得する
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

      // 園内習い事あり
      // フロントから lessons=true が送られてきた場合は、
      // "true" という文字列の部分一致検索ではなく、
      // lessons が null ではない園を取得する
      query.lessons === 'true'
        ? {
            lessons: {
              not: null,
            },
          }
        : {},

      // アレルギー対応あり
      // フロントから allergySupport=true が送られてきた場合は、
      // "true" という文字列の部分一致検索ではなく、
      // allergySupport が null ではない園を取得する
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

const calculateRecommendedScore = (
  school: SchoolForRecommendation,
  favoriteSchools: SchoolForRecommendation[]
) => {
  return favoriteSchools.reduce((score, favoriteSchool) => {
    let nextScore = score

    if (school.area === favoriteSchool.area) {
      nextScore += 4
    }

    if (school.schoolType === favoriteSchool.schoolType) {
      nextScore += 2
    }

    if (school.mealType === favoriteSchool.mealType) {
      nextScore += 2
    }

    if (school.lifeBurdenLevel === favoriteSchool.lifeBurdenLevel) {
      nextScore += 1
    }

    if (school.timeBurdenLevel === favoriteSchool.timeBurdenLevel) {
      nextScore += 1
    }

    if (school.itemBurdenLevel === favoriteSchool.itemBurdenLevel) {
      nextScore += 1
    }

    if (school.weekdayEventsLevel === favoriteSchool.weekdayEventsLevel) {
      nextScore += 1
    }

    if (
      school.parentAssociationLevel === favoriteSchool.parentAssociationLevel
    ) {
      nextScore += 1
    }

    return nextScore
  }, 0)
}

export const getRecommendedSchools = async (
  query: SchoolSearchQuery,
  userId: string
) => {
  const schools = await getSchools(query)

  const favoriteSchools = await prisma.school.findMany({
    where: {
      favorites: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  })

  if (favoriteSchools.length === 0) {
    return schools
  }

  return [...schools].sort((a, b) => {
    const scoreA = calculateRecommendedScore(a, favoriteSchools)
    const scoreB = calculateRecommendedScore(b, favoriteSchools)

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
  if (schoolIds.length === 0) {
    return new Set<string>()
  }

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
