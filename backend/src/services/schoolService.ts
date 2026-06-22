import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import type { SchoolSearchQueryInput } from '../validators/schoolValidator'

export type SchoolSearchQuery = SchoolSearchQueryInput

export const getSchools = async (query: SchoolSearchQuery) => {
  const keyword = query.keyword || query.q

  const where: Prisma.SchoolWhereInput = {
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
      query.area
        ? { area: { contains: query.area, mode: 'insensitive' } }
        : {},
      query.mealType ? { mealType: query.mealType } : {},
      query.diaperSupport
        ? {
            diaperSupport: {
              contains: query.diaperSupport,
              mode: 'insensitive',
            },
          }
        : {},
      query.futonSupport
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
      query.extendedCareUsage
        ? {
            extendedCareUsage: {
              contains: query.extendedCareUsage,
              mode: 'insensitive',
            },
          }
        : {},
      query.itemBurdenLevel
        ? { itemBurdenLevel: query.itemBurdenLevel }
        : {},
      query.weekdayEventsLevel
        ? { weekdayEventsLevel: query.weekdayEventsLevel }
        : {},
      query.parentAssociationLevel
        ? { parentAssociationLevel: query.parentAssociationLevel }
        : {},
      query.lessons
        ? { lessons: { contains: query.lessons, mode: 'insensitive' } }
        : {},
      query.allergySupport
        ? {
            allergySupport: {
              contains: query.allergySupport,
              mode: 'insensitive',
            },
          }
        : {},
    ],
  }

  return prisma.school.findMany({
    where,
    orderBy: {
      id: 'asc',
    },
  })
}

export const getSchoolById = async (id: bigint) => {
  return prisma.school.findUnique({
    where: {
      id,
    },
  })
}
