import { Prisma } from '@prisma/client'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFavoriteFindMany = vi.fn()
const mockFavoriteFindUnique = vi.fn()
const mockFavoriteCount = vi.fn()
const mockFavoriteCreate = vi.fn()
const mockFavoriteDelete = vi.fn()
const mockSchoolFindUnique = vi.fn()

vi.mock('../../lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: mockFavoriteFindMany,
      findUnique: mockFavoriteFindUnique,
      count: mockFavoriteCount,
      create: mockFavoriteCreate,
      delete: mockFavoriteDelete,
    },
    school: {
      findUnique: mockSchoolFindUnique,
    },
  },
}))

const createSchool = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  name: 'さくら保育園',
  schoolType: 'NURSERY',
  mealType: 'SCHOOL_LUNCH',
  diaperSupport: '園で廃棄',
  ...overrides,
})

const createFavorite = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  userId: 'user-1',
  schoolId: 1n,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  school: createSchool(),
  ...overrides,
})

describe('favoriteService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserFavorites', () => {
    it('一般ユーザーのお気に入り一覧を取得し、favoriteLimitに3を返す', async () => {
      const { getUserFavorites } =
        await import('../../services/favoriteService')

      const favorite = createFavorite({
        id: 10n,
        schoolId: 20n,
        school: createSchool({
          id: 20n,
          schoolType: 'NURSERY',
          mealType: 'SCHOOL_LUNCH',
          diaperSupport: '園で廃棄',
        }),
      })

      mockFavoriteFindMany.mockResolvedValue([favorite])

      const result = await getUserFavorites('user-1', false)

      expect(mockFavoriteFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
        include: {
          school: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      expect(result).toEqual({
        data: [
          {
            id: '10',
            schoolId: '20',
            createdAt: favorite.createdAt,
            school: {
              ...favorite.school,
              id: '20',
              tags: ['保育園', '毎日給食', 'おむつ園処理'],
            },
          },
        ],
        meta: {
          favoriteCount: 1,
          favoriteLimit: 3,
        },
      })
    })

    it('プレミアムユーザーのお気に入り一覧ではfavoriteLimitにnullを返す', async () => {
      const { getUserFavorites } =
        await import('../../services/favoriteService')

      mockFavoriteFindMany.mockResolvedValue([
        createFavorite({ id: 1n, schoolId: 1n }),
        createFavorite({ id: 2n, schoolId: 2n }),
      ])

      const result = await getUserFavorites('user-1', true)

      expect(result.meta).toEqual({
        favoriteCount: 2,
        favoriteLimit: null,
      })
    })

    it('園タグを生成できない値の場合はtagsに含めない', async () => {
      const { getUserFavorites } =
        await import('../../services/favoriteService')

      mockFavoriteFindMany.mockResolvedValue([
        createFavorite({
          school: createSchool({
            schoolType: 'UNKNOWN',
            mealType: 'UNKNOWN',
            diaperSupport: null,
          }),
        }),
      ])

      const result = await getUserFavorites('user-1', false)

      expect(result.data[0].school?.tags).toEqual([])
    })
  })

  describe('addUserFavorite', () => {
    it('お気に入り登録に成功し、登録結果をシリアライズして返す', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      const school = createSchool({ id: 1n })
      const favorite = createFavorite({
        id: 100n,
        schoolId: 1n,
        school,
      })

      mockSchoolFindUnique.mockResolvedValue(school)
      mockFavoriteFindUnique.mockResolvedValue(null)
      mockFavoriteCount.mockResolvedValue(2)
      mockFavoriteCreate.mockResolvedValue(favorite)

      const result = await addUserFavorite('user-1', false, 1n)

      expect(mockSchoolFindUnique).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
      })

      expect(mockFavoriteFindUnique).toHaveBeenCalledWith({
        where: {
          userId_schoolId: {
            userId: 'user-1',
            schoolId: 1n,
          },
        },
      })

      expect(mockFavoriteCount).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
      })

      expect(mockFavoriteCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          schoolId: 1n,
        },
        include: {
          school: true,
        },
      })

      expect(result).toEqual({
        id: '100',
        schoolId: '1',
        createdAt: favorite.createdAt,
        school: {
          ...school,
          id: '1',
          tags: ['保育園', '毎日給食', 'おむつ園処理'],
        },
      })
    })

    it('対象の園が存在しない場合はNOT_FOUNDを投げる', async () => {
      const { addUserFavorite, FavoriteServiceError } =
        await import('../../services/favoriteService')

      mockSchoolFindUnique.mockResolvedValue(null)

      await expect(
        addUserFavorite('user-1', false, 999n)
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: '指定された園が見つかりません',
      })

      await expect(
        addUserFavorite('user-1', false, 999n)
      ).rejects.toBeInstanceOf(FavoriteServiceError)

      expect(mockFavoriteFindUnique).not.toHaveBeenCalled()
      expect(mockFavoriteCreate).not.toHaveBeenCalled()
    })

    it('すでにお気に入り登録済みの場合はALREADY_FAVORITEDを投げる', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      mockSchoolFindUnique.mockResolvedValue(createSchool())
      mockFavoriteFindUnique.mockResolvedValue(createFavorite())

      await expect(addUserFavorite('user-1', false, 1n)).rejects.toMatchObject({
        statusCode: 409,
        code: 'ALREADY_FAVORITED',
        message: 'すでにお気に入り登録されています',
      })

      expect(mockFavoriteCount).not.toHaveBeenCalled()
      expect(mockFavoriteCreate).not.toHaveBeenCalled()
    })

    it('一般ユーザーのお気に入り数が上限に達している場合はFAVORITE_LIMIT_EXCEEDEDを投げる', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      mockSchoolFindUnique.mockResolvedValue(createSchool())
      mockFavoriteFindUnique.mockResolvedValue(null)
      mockFavoriteCount.mockResolvedValue(3)

      await expect(addUserFavorite('user-1', false, 1n)).rejects.toMatchObject({
        statusCode: 403,
        code: 'FAVORITE_LIMIT_EXCEEDED',
        message:
          '一般ユーザーは3件までお気に入り登録できます。プレミアムユーザーは4件以上登録できます',
      })

      expect(mockFavoriteCreate).not.toHaveBeenCalled()
    })

    it('プレミアムユーザーの場合はお気に入り数の上限チェックをスキップする', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      const favorite = createFavorite({
        id: 1n,
        schoolId: 1n,
      })

      mockSchoolFindUnique.mockResolvedValue(createSchool())
      mockFavoriteFindUnique.mockResolvedValue(null)
      mockFavoriteCreate.mockResolvedValue(favorite)

      const result = await addUserFavorite('user-1', true, 1n)

      expect(mockFavoriteCount).not.toHaveBeenCalled()
      expect(mockFavoriteCreate).toHaveBeenCalled()
      expect(result.id).toBe('1')
      expect(result.schoolId).toBe('1')
    })

    it('Prismaの一意制約エラーが発生した場合はALREADY_FAVORITEDを投げる', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test-client-version',
        }
      )

      mockSchoolFindUnique.mockResolvedValue(createSchool())
      mockFavoriteFindUnique.mockResolvedValue(null)
      mockFavoriteCount.mockResolvedValue(0)
      mockFavoriteCreate.mockRejectedValue(prismaError)

      await expect(addUserFavorite('user-1', false, 1n)).rejects.toMatchObject({
        statusCode: 409,
        code: 'ALREADY_FAVORITED',
        message: 'すでにお気に入り登録されています',
      })
    })

    it('Prismaの一意制約以外のエラーはそのまま投げる', async () => {
      const { addUserFavorite } = await import('../../services/favoriteService')

      const error = new Error('DB_ERROR')

      mockSchoolFindUnique.mockResolvedValue(createSchool())
      mockFavoriteFindUnique.mockResolvedValue(null)
      mockFavoriteCount.mockResolvedValue(0)
      mockFavoriteCreate.mockRejectedValue(error)

      await expect(addUserFavorite('user-1', false, 1n)).rejects.toThrow(
        'DB_ERROR'
      )
    })
  })

  describe('deleteUserFavorite', () => {
    it('お気に入り削除に成功する', async () => {
      const { deleteUserFavorite } =
        await import('../../services/favoriteService')

      mockFavoriteFindUnique.mockResolvedValue(
        createFavorite({
          id: 10n,
          schoolId: 1n,
        })
      )

      await deleteUserFavorite('user-1', 1n)

      expect(mockFavoriteFindUnique).toHaveBeenCalledWith({
        where: {
          userId_schoolId: {
            userId: 'user-1',
            schoolId: 1n,
          },
        },
      })

      expect(mockFavoriteDelete).toHaveBeenCalledWith({
        where: {
          id: 10n,
        },
      })
    })

    it('削除対象のお気に入りが存在しない場合はNOT_FOUNDを投げる', async () => {
      const { deleteUserFavorite } =
        await import('../../services/favoriteService')

      mockFavoriteFindUnique.mockResolvedValue(null)

      await expect(deleteUserFavorite('user-1', 1n)).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: '対象のお気に入りが見つかりません',
      })

      expect(mockFavoriteDelete).not.toHaveBeenCalled()
    })
  })
})
