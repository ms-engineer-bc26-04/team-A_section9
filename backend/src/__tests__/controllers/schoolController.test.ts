import type { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware'

const mockGetRedisAvailable = vi.fn()
const mockRedisGet = vi.fn()
const mockRedisSetEx = vi.fn()

const mockGetSchools = vi.fn()
const mockGetRecommendedSchools = vi.fn()
const mockGetSchoolById = vi.fn()
const mockGetFavoritedSchoolIds = vi.fn()
const mockGetOrCreateCurrentUser = vi.fn()

vi.mock('../../lib/redis', () => ({
  getRedisAvailable: mockGetRedisAvailable,
  redis: {
    get: mockRedisGet,
    setEx: mockRedisSetEx,
  },
}))

vi.mock('../../services/schoolService', () => ({
  getSchools: mockGetSchools,
  getRecommendedSchools: mockGetRecommendedSchools,
  getSchoolById: mockGetSchoolById,
  getFavoritedSchoolIds: mockGetFavoritedSchoolIds,
}))

vi.mock('../../services/userService', () => ({
  getOrCreateCurrentUser: mockGetOrCreateCurrentUser,
}))

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'test@example.com',
})

const createUser = (
  overrides: Partial<{
    id: string
    planType: string
    subscription: { status: string } | null
  }> = {}
) => ({
  id: 'user-1',
  email: 'test@example.com',
  planType: 'FREE',
  subscription: null,
  ...overrides,
})

const createSchool = (
  overrides: Partial<Record<string, unknown>> = {}
): Record<string, unknown> => ({
  id: 1n,
  name: 'さくら保育園',
  area: '渋谷区',
  address: '東京都渋谷区神宮前',
  phoneNumber: '03-0000-0000',
  imageUrl: 'https://example.com/school.jpg',
  schoolType: 'NURSERY',
  lifeBurdenLevel: 'LOW',
  timeBurdenLevel: 'LOW',
  mealType: 'SCHOOL_LUNCH',
  itemBurdenLevel: 'LOW',
  itemBurdenDetail: '持ち物は少なめです',
  diaperSupport: '園で廃棄',
  futonSupport: '不要',
  extendedCareHours: '18:30まで',
  extendedCareUsage: true,
  weekdayEventsLevel: 'LOW',
  weekdayEvents: '少なめ',
  parentAssociationLevel: 'LOW',
  parentAssociationFrequency: '年1回',
  description: '共働き家庭にやさしい園です',
  contactBookType: 'アプリ',
  absenceContactMethod: 'アプリ',
  lessons: true,
  allergySupport: true,
  ...overrides,
})

const createRequest = (
  overrides: Partial<AuthenticatedRequest & Request> = {}
): AuthenticatedRequest =>
  ({
    authUser: undefined,
    query: {},
    params: {},
    log: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    ...overrides,
  }) as AuthenticatedRequest

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    locals: {},
  }

  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
    locals: Record<string, unknown>
  }
}

describe('schoolController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRedisAvailable.mockReturnValue(false)
    mockRedisGet.mockResolvedValue(null)
    mockRedisSetEx.mockResolvedValue('OK')
    mockGetFavoritedSchoolIds.mockResolvedValue(new Set<string>())
  })

  describe('getSchoolsController', () => {
    it('未ログインかつRedis利用可能な場合は園一覧を取得してキャッシュに保存する', async () => {
      const { getSchoolsController } =
        await import('../../controllers/schoolController')

      const schools = [
        createSchool({
          id: 1n,
          diaperSupport: '園で廃棄',
        }),
        createSchool({
          id: 2n,
          name: 'ひまわり保育園',
          schoolType: 'KINDERGARTEN',
          mealType: 'LUNCH_BOX',
          diaperSupport: 'サブスクあり',
        }),
        createSchool({
          id: 3n,
          name: 'こども園テスト',
          schoolType: 'CERTIFIED_CHILDCARE_CENTER',
          mealType: 'BOTH',
          diaperSupport: '持ち帰り',
        }),
      ]

      mockGetRedisAvailable.mockReturnValue(true)
      mockGetSchools.mockResolvedValue(schools)

      const req = createRequest({
        query: {
          area: '渋谷区',
        },
      })
      const res = createResponse()

      await getSchoolsController(req, res, vi.fn())

      expect(mockGetSchools).toHaveBeenCalledWith({
        area: '渋谷区',
      })
      expect(mockRedisSetEx).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: 'さくら保育園',
            tags: expect.arrayContaining([
              '保育園',
              '毎日給食',
              'おむつ園処理',
            ]),
            isFavorited: false,
          }),
          expect.objectContaining({
            id: '2',
            tags: expect.arrayContaining([
              '幼稚園',
              '毎日弁当',
              'おむつサブスク',
            ]),
          }),
          expect.objectContaining({
            id: '3',
            tags: expect.arrayContaining([
              'こども園',
              '給食・弁当',
              'おむつ持ち帰り',
            ]),
          }),
        ]),
        meta: {
          count: 3,
        },
      })
    })

    it('キャッシュ保存に失敗しても園一覧レスポンスを返す', async () => {
      const { getSchoolsController } =
        await import('../../controllers/schoolController')

      const error = new Error('REDIS_SET_ERROR')
      mockGetRedisAvailable.mockReturnValue(true)
      mockRedisSetEx.mockRejectedValue(error)
      mockGetSchools.mockResolvedValue([createSchool()])

      const req = createRequest()
      const res = createResponse()

      await getSchoolsController(req, res, vi.fn())

      expect(req.log.warn).toHaveBeenCalledWith(
        {
          error,
          cacheKey: 'schools:list',
        },
        'Redis cache write failed. Continue without cache.'
      )
      expect(res.json).toHaveBeenCalledWith({
        data: [expect.objectContaining({ id: '1' })],
        meta: {
          count: 1,
        },
      })
    })

    it('ログイン済みかつおすすめ順の場合はおすすめ園一覧とお気に入り情報を返す', async () => {
      const { getSchoolsController } =
        await import('../../controllers/schoolController')

      const user = createUser()
      const schools = [createSchool({ id: 10n })]

      mockGetOrCreateCurrentUser.mockResolvedValue(user)
      mockGetRecommendedSchools.mockResolvedValue(schools)
      mockGetFavoritedSchoolIds.mockResolvedValue(new Set(['10']))

      const req = createRequest({
        authUser: createAuthUser(),
        query: {
          sort: 'recommended',
        },
      })
      const res = createResponse()

      await getSchoolsController(req, res, vi.fn())

      expect(mockGetRecommendedSchools).toHaveBeenCalledWith(
        {
          sort: 'recommended',
        },
        'user-1'
      )
      expect(mockGetFavoritedSchoolIds).toHaveBeenCalledWith('user-1', [10n])
      expect(mockRedisSetEx).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            id: '10',
            isFavorited: true,
          }),
        ],
        meta: {
          count: 1,
        },
      })
    })

    it('園一覧取得中にエラーが発生した場合は500を返す', async () => {
      const { getSchoolsController } =
        await import('../../controllers/schoolController')

      const error = new Error('DB_ERROR')
      mockGetSchools.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()

      await getSchoolsController(req, res, vi.fn())

      expect(req.log.error).toHaveBeenCalledWith(
        { error },
        'Failed to fetch schools'
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '園一覧の取得に失敗しました',
        },
      })
    })
  })

  describe('getSchoolByIdController', () => {
    it('未ログインかつキャッシュヒットした場合はキャッシュの内容を返す', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      const cachedResponse = {
        data: {
          id: '1',
          name: 'キャッシュ済み保育園',
        },
      }

      mockGetRedisAvailable.mockReturnValue(true)
      mockRedisGet.mockResolvedValue(JSON.stringify(cachedResponse))

      const req = createRequest({
        params: {
          id: '1',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(mockRedisGet).toHaveBeenCalledWith('schools:detail:1')
      expect(req.log.info).toHaveBeenCalledWith(
        { cacheKey: 'schools:detail:1' },
        'school detail cache hit'
      )
      expect(res.json).toHaveBeenCalledWith(cachedResponse)
      expect(mockGetSchoolById).not.toHaveBeenCalled()
    })

    it('キャッシュ読み込みに失敗した場合はDBへフォールバックする', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      const error = new Error('REDIS_GET_ERROR')

      mockGetRedisAvailable.mockReturnValue(true)
      mockRedisGet.mockRejectedValue(error)
      mockGetSchoolById.mockResolvedValue(createSchool())

      const req = createRequest({
        params: {
          id: '1',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(req.log.warn).toHaveBeenCalledWith(
        {
          error,
          cacheKey: 'schools:detail:1',
        },
        'Redis cache read failed. Fallback to DB.'
      )
      expect(mockGetSchoolById).toHaveBeenCalledWith(1n)
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
          supportInfo: expect.objectContaining({
            isLocked: true,
            contactBookType: null,
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }),
        }),
      })
    })

    it('園詳細が存在しない場合は404を返す', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      mockGetSchoolById.mockResolvedValue(null)

      const req = createRequest({
        params: {
          id: '999',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NOT_FOUND',
          message: '指定された園が見つかりません',
        },
      })
    })

    it('プレミアムユーザーの場合は補助情報をロック解除して返す', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      const user = createUser({
        planType: 'PAID',
      })

      mockGetOrCreateCurrentUser.mockResolvedValue(user)
      mockGetSchoolById.mockResolvedValue(createSchool({ id: 20n }))
      mockGetFavoritedSchoolIds.mockResolvedValue(new Set(['20']))

      const req = createRequest({
        authUser: createAuthUser(),
        params: {
          id: '20',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(mockGetFavoritedSchoolIds).toHaveBeenCalledWith('user-1', [20n])
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '20',
          isFavorited: true,
          supportInfo: {
            isLocked: false,
            contactBookType: 'アプリ',
            absenceContactMethod: 'アプリ',
            lessons: true,
            allergySupport: true,
          },
        }),
      })
    })

    it('キャッシュ保存に失敗しても園詳細レスポンスを返す', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      const error = new Error('REDIS_SET_ERROR')

      mockGetRedisAvailable.mockReturnValue(true)
      mockRedisGet.mockResolvedValue(null)
      mockRedisSetEx.mockRejectedValue(error)
      mockGetSchoolById.mockResolvedValue(createSchool())

      const req = createRequest({
        params: {
          id: '1',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(req.log.info).toHaveBeenCalledWith(
        { cacheKey: 'schools:detail:1' },
        'school detail cache miss'
      )
      expect(req.log.warn).toHaveBeenCalledWith(
        {
          error,
          cacheKey: 'schools:detail:1',
        },
        'Redis cache write failed. Continue without cache.'
      )
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
        }),
      })
    })

    it('園詳細取得中にエラーが発生した場合は500を返す', async () => {
      const { getSchoolByIdController } =
        await import('../../controllers/schoolController')

      const error = new Error('DB_ERROR')
      mockGetSchoolById.mockRejectedValue(error)

      const req = createRequest({
        params: {
          id: '1',
        },
      })
      const res = createResponse()

      await getSchoolByIdController(req, res, vi.fn())

      expect(req.log.error).toHaveBeenCalledWith(
        { error },
        'Failed to fetch school detail'
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '園詳細の取得に失敗しました',
        },
      })
    })
  })
})
