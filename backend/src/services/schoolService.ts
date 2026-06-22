import { prisma } from '../lib/prisma'

export type SchoolSearchQuery = {
  area?: string
  extendedCareUsage?: string
  itemBurdenLevel?: string
  weekdayEventsLevel?: string
  mealType?: string
}

export const getSchools = async (query: SchoolSearchQuery) => {
  return prisma.school.findMany({
    where: {
      area: query.area
        ? { contains: query.area, mode: 'insensitive' }
        : undefined,
      extendedCareUsage: query.extendedCareUsage || undefined,
      itemBurdenLevel: query.itemBurdenLevel || undefined,
      weekdayEventsLevel: query.weekdayEventsLevel || undefined,
      mealType: query.mealType || undefined,
    },
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
