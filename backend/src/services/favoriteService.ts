import { Prisma, type MembershipType } from '@prisma/client'
import { prisma } from '../lib/prisma'

const FREE_USER_FAVORITE_LIMIT = 5

export class FavoriteServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
  }
}

const getFavoriteLimit = (planType: MembershipType) => {
  return planType === 'PAID' ? null : FREE_USER_FAVORITE_LIMIT
}

const toSerializableSchool = (school: Record<string, unknown>) => {
  return {
    ...school,
    id: school.id?.toString(),
  }
}

const toSerializableFavorite = (favorite: {
  id: bigint
  schoolId: bigint
  createdAt: Date
  school?: Record<string, unknown>
}) => {
  return {
    id: favorite.id.toString(),
    schoolId: favorite.schoolId.toString(),
    createdAt: favorite.createdAt,
    ...(favorite.school
      ? {
          school: toSerializableSchool(favorite.school),
        }
      : {}),
  }
}

export const getUserFavorites = async (
  userId: string,
  planType: MembershipType
) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
    },
    include: {
      school: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    data: favorites.map((favorite) => toSerializableFavorite(favorite)),
    meta: {
      favoriteCount: favorites.length,
      favoriteLimit: getFavoriteLimit(planType),
    },
  }
}

export const addUserFavorite = async (
  userId: string,
  planType: MembershipType,
  schoolId: bigint
) => {
  const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
    },
  })

  if (!school) {
    throw new FavoriteServiceError(
      404,
      'NOT_FOUND',
      '指定された園が見つかりません'
    )
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_schoolId: {
        userId,
        schoolId,
      },
    },
  })

  if (existingFavorite) {
    throw new FavoriteServiceError(
      409,
      'ALREADY_FAVORITED',
      'すでにお気に入り登録されています'
    )
  }

  const favoriteLimit = getFavoriteLimit(planType)

  if (favoriteLimit !== null) {
    const favoriteCount = await prisma.favorite.count({
      where: {
        userId,
      },
    })

    if (favoriteCount >= favoriteLimit) {
      throw new FavoriteServiceError(
        403,
        'FAVORITE_LIMIT_EXCEEDED',
        '一般ユーザーは5件までお気に入り登録できます'
      )
    }
  }

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        schoolId,
      },
      include: {
        school: true,
      },
    })

    return toSerializableFavorite(favorite)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new FavoriteServiceError(
        409,
        'ALREADY_FAVORITED',
        'すでにお気に入り登録されています'
      )
    }

    throw error
  }
}

export const deleteUserFavorite = async (userId: string, schoolId: bigint) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_schoolId: {
        userId,
        schoolId,
      },
    },
  })

  if (!favorite) {
    throw new FavoriteServiceError(
      404,
      'NOT_FOUND',
      '対象のお気に入りが見つかりません'
    )
  }

  await prisma.favorite.delete({
    where: {
      id: favorite.id,
    },
  })
}
