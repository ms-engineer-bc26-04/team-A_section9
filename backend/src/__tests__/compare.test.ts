import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'
import { prisma } from '../lib/prisma'

// 比較APIの認証処理をテスト内で制御するためにmock化
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// 比較APIのユーザー取得をmock化し、DBのユーザー状態に依存しないようにする
vi.mock('../services/userService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/userService')>()

  return {
    ...actual,
    getOrCreateCurrentUser: vi.fn(),
  }
})

import { supabase } from '../lib/supabase'
import { getOrCreateCurrentUser } from '../services/userService'

const mockedSupabase = vi.mocked(supabase)
const mockedGetOrCreateCurrentUser = vi.mocked(getOrCreateCurrentUser)

const mockUserRecord = {
  id: 'test-user-id',
  supabaseUserId: 'test-supabase-user-id',
  email: 'test@example.com',
  planType: 'FREE',
  createdAt: new Date('2026-06-30T00:00:00.000Z'),
  updatedAt: new Date('2026-06-30T00:00:00.000Z'),
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

const mockCurrentUser = (
  overrides: Partial<Awaited<ReturnType<typeof getOrCreateCurrentUser>>> = {}
) => {
  mockedGetOrCreateCurrentUser.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    planType: 'FREE',
    subscription: null,
    preference: null,
    ...overrides,
  } as never)
}

beforeEach(() => {
  vi.clearAllMocks()

  mockedSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  } as never)

  // 修正箇所：
  // 以前のテストでは prisma.user.upsert をmockしていたが、
  // 現在の authMiddleware では findFirst / update / create を使っているため、
  // 認証ありテストが実DB処理に進まないように3つをmockする。
  vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUserRecord as never)
  vi.spyOn(prisma.user, 'update').mockResolvedValue(mockUserRecord as never)
  vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUserRecord as never)

  mockCurrentUser()
})

afterAll(async () => {
  vi.restoreAllMocks()
  await prisma.$disconnect()
})

describe('Compare API', () => {
  it('GET /api/v1/schools/compare は未認証の場合 401 を返す', async () => {
    const response = await request(app).get('/api/v1/schools/compare?ids=1,2')

    expect(response.status).toBe(401)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('GET /api/v1/schools/compare は一般ユーザーが3園比較しようとした場合 403 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'FREE',
      subscription: null,
    })

    const response = await request(app)
      .get('/api/v1/schools/compare?ids=1,2,3')
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(403)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('GET /api/v1/schools/compare はプレミアムユーザーが3園比較できる', async () => {
    const schoolsResponse = await request(app).get('/api/v1/schools')
    const schoolIds = schoolsResponse.body.data
      .slice(0, 3)
      .map((school: { id: string }) => school.id)

    expect(schoolIds).toHaveLength(3)

    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'PAID',
      subscription: null,
    })

    const response = await request(app)
      .get(`/api/v1/schools/compare?ids=${schoolIds.join(',')}`)
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.schools).toHaveLength(3)
  })

  it('GET /api/v1/schools/compare はプレミアムユーザーが4園比較しようとした場合 403 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'PAID',
      subscription: null,
    })

    const response = await request(app)
      .get('/api/v1/schools/compare?ids=1,2,3,4')
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(403)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('COMPARE_LIMIT_EXCEEDED')
  })
})
