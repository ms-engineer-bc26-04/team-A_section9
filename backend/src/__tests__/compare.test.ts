import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import app from '../app'

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

import {
  mockAuthenticatedUser,
  mockCurrentUser,
  setupAuthTest,
} from './helpers/authTestHelper'

setupAuthTest()

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
