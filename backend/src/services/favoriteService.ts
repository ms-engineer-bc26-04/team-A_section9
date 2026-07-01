import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

const FREE_USER_FAVORITE_LIMIT = 5

// #196対応：お気に入り一覧でも園一覧と同じタグを表示するため、園情報からタグを生成する
const SCHOOL_TYPE_TAGS: Record<string, string> = {
  NURSERY: '保育園',
  KINDERGARTEN: '幼稚園',
  CERTIFIED_CHILDCARE_CENTER: 'こども園',
}

// #196対応：お気に入り一覧でも園一覧と同じタグを表示するため、給食種別タグを生成する
const MEAL_TYPE_TAGS: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食',
  LUNCH_BOX: '毎日弁当',
  BOTH: '給食・弁当',
}

// #196対応：お気に入り一覧でも園一覧と同じタグを表示するため、school情報からタグ配列を生成する
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

export class FavoriteServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
  }
}

// #135対応：planTypeではなく、controller側で判定したisPremiumをもとに上限を決める
const getFavoriteLimit = (isPremium: boolean) => {
  return isPremium ? null : FREE_USER_FAVORITE_LIMIT
}

const toSerializableSchool = (school: Record<string, unknown>) => {
  return {
    ...school,
    id: school.id?.toString(),
    // #196対応：お気に入り一覧画面でタグを表示できるよう、APIレスポンスにtagsを追加
    tags: getSchoolTags(school),
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

export const getUserFavorites = async (userId: string, isPremium: boolean) => {
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
      // #135対応：プレミアムユーザーはfavoriteLimitをnullとして返す
      favoriteLimit: getFavoriteLimit(isPremium),
    },
  }
}

export const addUserFavorite = async (
  userId: string,
  isPremium: boolean,
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

  // #135対応：プレミアムユーザーは上限チェックをスキップする
  const favoriteLimit = getFavoriteLimit(isPremium)

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
        '一般ユーザーは5件までお気に入り登録できます。プレミアムユーザーなら5件以上登録できます'
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