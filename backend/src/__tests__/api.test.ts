import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'
import { prisma } from '../lib/prisma'

// 追加：Redisキャッシュ処理をテスト内で制御するためにmock化
vi.mock('../lib/redis', () => ({
  redis: {
    get: vi.fn(),
    setEx: vi.fn(),
  },
  getRedisAvailable: vi.fn(),
}))

// 追加：認証ユーザー向けキャッシュ対象外テスト対応
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// 追加：認証ユーザー向けキャッシュ対象外テストでDB依存を避けるため、getOrCreateCurrentUserのみmock化
vi.mock('../services/userService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/userService')>()

  return {
    ...actual,
    getOrCreateCurrentUser: vi.fn(),
  }
})

// 追加：認証ユーザー向けキャッシュ対象外テストでお気に入り取得のDB依存を避けるため、getFavoritedSchoolIdsのみmock化
vi.mock('../services/schoolService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/schoolService')>()

  return {
    ...actual,
    getFavoritedSchoolIds: vi.fn(),
  }
})

// 追加：mock化したRedisをテスト内で操作するためにimport
import { getRedisAvailable, redis } from '../lib/redis'

// 追加：認証ユーザー向けキャッシュ対象外テスト対応
import { supabase } from '../lib/supabase'

// 追加：認証ユーザー向けキャッシュ対象外テストでDB依存を避けるためにimport
import { getOrCreateCurrentUser } from '../services/userService'

// 追加：認証ユーザー向けキャッシュ対象外テストでお気に入り取得のDB依存を避けるためにimport
import { getFavoritedSchoolIds } from '../services/schoolService'

// 追加：vi.mockした関数を型付きで扱いやすくする
const mockedGetRedisAvailable = vi.mocked(getRedisAvailable)
const mockedRedis = vi.mocked(redis)

// 追加：認証ユーザー向けキャッシュ対象外テスト対応
const mockedSupabase = vi.mocked(supabase)

// 追加：認証ユーザー向けキャッシュ対象外テストでDB依存を避けるためにmock化した関数を扱う
const mockedGetOrCreateCurrentUser = vi.mocked(getOrCreateCurrentUser)

// 追加：認証ユーザー向けキャッシュ対象外テストでお気に入り取得のDB依存を避けるためにmock化した関数を扱う
const mockedGetFavoritedSchoolIds = vi.mocked(getFavoritedSchoolIds)

const mockRedisAvailable = () => {
  mockedGetRedisAvailable.mockReturnValue(true)
}

const mockRedisUnavailable = () => {
  mockedGetRedisAvailable.mockReturnValue(false)
}

const mockAuthenticatedUser = () => {
  mockedSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'test-supabase-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2026-06-30T00:00:00.000Z',
      },
    },
    error: null,
  } as never)
}

const mockCurrentUser = () => {
  mockedGetOrCreateCurrentUser.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    planType: 'FREE',
  } as never)

  mockedGetFavoritedSchoolIds.mockResolvedValue(new Set<string>())
}

const getFirstSchool = async () => {
  const schoolsResponse = await request(app).get('/api/v1/schools')
  const firstSchool = schoolsResponse.body.data[0]

  expect(firstSchool).toBeDefined()

  return firstSchool
}

const expectSchoolListResponse = (response: {
  status: number
  body: {
    data: unknown
    meta?: {
      count?: unknown
    }
  }
}) => {
  expect(response.status).toBe(200)
  expect(Array.isArray(response.body.data)).toBe(true)
  expect(response.body.meta).toBeDefined()
  expect(typeof response.body.meta?.count).toBe('number')
}

const expectSchoolDetailResponse = (
  response: {
    status: number
    body: {
      data?: {
        id?: unknown
        name?: unknown
        supportInfo?: unknown
      }
    }
  },
  expectedId?: string
) => {
  expect(response.status).toBe(200)
  expect(response.body.data).toBeDefined()

  if (expectedId) {
    expect(response.body.data?.id).toBe(expectedId)
  }

  expect(response.body.data?.supportInfo).toBeDefined()
}

beforeEach(() => {
  vi.clearAllMocks()

  // 追加：既存テストではRedisキャッシュを使わない状態をデフォルトにする
  mockRedisUnavailable()

  // 追加：認証なしのリクエストではSupabaseユーザーを返さない
  mockedSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  } as never)

  // 追加：認証ユーザー向けキャッシュ対象外テストで、実DBへのユーザー作成・取得に依存しないようにする
  mockedGetOrCreateCurrentUser.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    planType: 'FREE',
  } as never)

  // 追加：認証ユーザー向けキャッシュ対象外テストで、お気に入り取得の実DB依存を避ける
  mockedGetFavoritedSchoolIds.mockResolvedValue(new Set<string>())
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Health API', () => {
  it('GET /health は 200 と status ok を返す', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})

describe('School API', () => {
  it('GET /api/v1/schools は園一覧を返す', async () => {
    const response = await request(app).get('/api/v1/schools')

    expectSchoolListResponse(response)
  })

  it('GET /api/v1/schools はキャッシュ未登録時にDB取得後Redisへ保存する', async () => {
    mockRedisAvailable()
    mockedRedis.get.mockResolvedValue(null)
    mockedRedis.setEx.mockResolvedValue('OK')

    const response = await request(app).get('/api/v1/schools')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).toHaveBeenCalledWith('schools:list')
    expect(mockedRedis.setEx).toHaveBeenCalledTimes(1)
    expect(mockedRedis.setEx).toHaveBeenCalledWith(
      'schools:list',
      expect.any(Number),
      JSON.stringify(response.body)
    )
  })

  it('GET /api/v1/schools はキャッシュ登録済みの場合Redisの値を返す', async () => {
    mockRedisAvailable()

    const cachedBody = {
      data: [],
      meta: {
        count: 0,
      },
    }

    mockedRedis.get.mockResolvedValue(JSON.stringify(cachedBody))

    const response = await request(app).get('/api/v1/schools')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(cachedBody)
    expect(mockedRedis.get).toHaveBeenCalledWith('schools:list')
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools はquery paramsが異なる場合、別キャッシュキーとして扱う', async () => {
    mockRedisAvailable()
    mockedRedis.get.mockResolvedValue(null)
    mockedRedis.setEx.mockResolvedValue('OK')

    await request(app).get('/api/v1/schools?area=渋谷区')
    await request(app).get('/api/v1/schools?area=世田谷区')

    // 修正：URLSearchParamsでキャッシュキーを作成しているため、日本語queryはURLエンコードされる
    expect(mockedRedis.get).toHaveBeenNthCalledWith(
      1,
      `schools:list?area=${encodeURIComponent('渋谷区')}`
    )

    // 修正：2回目のquery paramsもURLエンコードされたキャッシュキーで確認する
    expect(mockedRedis.get).toHaveBeenNthCalledWith(
      2,
      `schools:list?area=${encodeURIComponent('世田谷区')}`
    )
  })

  it('GET /api/v1/schools?sort=recommended はキャッシュ対象外にする', async () => {
    mockRedisAvailable()

    const response = await request(app).get('/api/v1/schools?sort=recommended')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).not.toHaveBeenCalled()
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools は認証ユーザー向けレスポンスをキャッシュ対象外にする', async () => {
    mockRedisAvailable()
    mockAuthenticatedUser()
    mockCurrentUser()

    const response = await request(app)
      .get('/api/v1/schools')
      .set('Authorization', 'Bearer test-token')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).not.toHaveBeenCalled()
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools はRedis読み取り失敗時もDB取得へフォールバックする', async () => {
    mockRedisAvailable()
    mockedRedis.get.mockRejectedValue(new Error('Redis read failed'))
    mockedRedis.setEx.mockResolvedValue('OK')

    const response = await request(app).get('/api/v1/schools')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).toHaveBeenCalledWith('schools:list')
  })

  it('GET /api/v1/schools はRedis書き込み失敗時も正常にレスポンスを返す', async () => {
    mockRedisAvailable()
    mockedRedis.get.mockResolvedValue(null)
    mockedRedis.setEx.mockRejectedValue(new Error('Redis write failed'))

    const response = await request(app).get('/api/v1/schools')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).toHaveBeenCalledWith('schools:list')
    expect(mockedRedis.setEx).toHaveBeenCalledTimes(1)
  })

  it('GET /api/v1/schools はRedis利用不可時もDB取得で正常レスポンスを返す', async () => {
    mockRedisUnavailable()

    const response = await request(app).get('/api/v1/schools')

    expectSchoolListResponse(response)
    expect(mockedRedis.get).not.toHaveBeenCalled()
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools/:id は存在する園の詳細を返す', async () => {
    const firstSchool = await getFirstSchool()

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(response.body.data?.name).toBeDefined()
  })

  it('GET /api/v1/schools/:id はキャッシュ未登録時にDB取得後Redisへ保存する', async () => {
    const firstSchool = await getFirstSchool()

    vi.clearAllMocks()
    mockRedisAvailable()
    mockedRedis.get.mockResolvedValue(null)
    mockedRedis.setEx.mockResolvedValue('OK')

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(mockedRedis.get).toHaveBeenCalledWith(
      `schools:detail:${firstSchool.id}`
    )
    expect(mockedRedis.setEx).toHaveBeenCalledTimes(1)
    expect(mockedRedis.setEx).toHaveBeenCalledWith(
      `schools:detail:${firstSchool.id}`,
      expect.any(Number),
      JSON.stringify(response.body)
    )
  })

  it('GET /api/v1/schools/:id はキャッシュ登録済みの場合Redisの値を返す', async () => {
    mockRedisAvailable()

    const cachedBody = {
      data: {
        id: '1',
        name: 'キャッシュ済み園',
        supportInfo: {
          isLocked: true,
          contactBookType: null,
          absenceContactMethod: null,
          lessons: null,
          allergySupport: null,
        },
      },
    }

    mockedRedis.get.mockResolvedValue(JSON.stringify(cachedBody))

    const response = await request(app).get('/api/v1/schools/1')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(cachedBody)
    expect(mockedRedis.get).toHaveBeenCalledWith('schools:detail:1')
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools/:id は認証ユーザー向けレスポンスをキャッシュ対象外にする', async () => {
    const firstSchool = await getFirstSchool()

    vi.clearAllMocks()
    mockRedisAvailable()
    mockAuthenticatedUser()
    mockCurrentUser()

    const response = await request(app)
      .get(`/api/v1/schools/${firstSchool.id}`)
      .set('Authorization', 'Bearer test-token')

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(mockedRedis.get).not.toHaveBeenCalled()
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools/:id はRedis読み取り失敗時もDB取得へフォールバックする', async () => {
    const firstSchool = await getFirstSchool()

    vi.clearAllMocks()
    mockRedisAvailable()
    mockedRedis.get.mockRejectedValue(new Error('Redis read failed'))
    mockedRedis.setEx.mockResolvedValue('OK')

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(mockedRedis.get).toHaveBeenCalledWith(
      `schools:detail:${firstSchool.id}`
    )
  })

  it('GET /api/v1/schools/:id はRedis書き込み失敗時も正常にレスポンスを返す', async () => {
    const firstSchool = await getFirstSchool()

    vi.clearAllMocks()
    mockRedisAvailable()
    mockedRedis.get.mockResolvedValue(null)
    mockedRedis.setEx.mockRejectedValue(new Error('Redis write failed'))

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(mockedRedis.get).toHaveBeenCalledWith(
      `schools:detail:${firstSchool.id}`
    )
    expect(mockedRedis.setEx).toHaveBeenCalledTimes(1)
  })

  it('GET /api/v1/schools/:id はRedis利用不可時もDB取得で正常レスポンスを返す', async () => {
    mockRedisUnavailable()

    const firstSchool = await getFirstSchool()

    vi.clearAllMocks()
    mockRedisUnavailable()

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expectSchoolDetailResponse(response, String(firstSchool.id))
    expect(mockedRedis.get).not.toHaveBeenCalled()
    expect(mockedRedis.setEx).not.toHaveBeenCalled()
  })

  it('GET /api/v1/schools/:id は存在しない園IDの場合 404 を返す', async () => {
    const response = await request(app).get('/api/v1/schools/999999999')

    expect(response.status).toBe(404)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})

describe('User API', () => {
  it('GET /api/v1/users/me は未認証の場合 401 を返す', async () => {
    const response = await request(app).get('/api/v1/users/me')

    expect(response.status).toBe(401)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
