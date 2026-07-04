import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'

// お気に入りAPIの認証処理をテスト内で制御するためにmock化
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// お気に入りAPIのユーザー取得をmock化し、DBのユーザー状態に依存しないようにする
vi.mock('../services/userService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/userService')>()

  return {
    ...actual,
    getOrCreateCurrentUser: vi.fn(),
  }
})

// お気に入りAPIのserviceをmock化し、favorite件数などのDB状態に依存しないようにする
vi.mock('../services/favoriteService', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/favoriteService')>()

  return {
    ...actual,
    addUserFavorite: vi.fn(),
    deleteUserFavorite: vi.fn(),
  }
})

import {
  addUserFavorite,
  deleteUserFavorite,
  FavoriteServiceError,
} from '../services/favoriteService'
import {
  mockAuthenticatedUser,
  mockCurrentUser,
  setupAuthTest,
} from './helpers/authTestHelper'

const mockedAddUserFavorite = vi.mocked(addUserFavorite)
const mockedDeleteUserFavorite = vi.mocked(deleteUserFavorite)

setupAuthTest()

beforeEach(() => {
  mockedAddUserFavorite.mockResolvedValue({
    id: '1',
    schoolId: '1',
    createdAt: new Date('2026-06-30T00:00:00.000Z'),
  } as never)

  mockedDeleteUserFavorite.mockResolvedValue(undefined as never)
})

describe('Favorite API', () => {
  it('POST /api/v1/users/me/favorites は未認証の場合 401 を返す', async () => {
    const response = await request(app)
      .post('/api/v1/users/me/favorites')
      .send({ schoolId: '1' })

    expect(response.status).toBe(401)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('POST /api/v1/users/me/favorites は一般ユーザーの上限超過時 403 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'FREE',
      subscription: null,
    })

    mockedAddUserFavorite.mockRejectedValue(
      new FavoriteServiceError(
        403,
        'FAVORITE_LIMIT_EXCEEDED',
        '一般ユーザーは3件までお気に入り登録できます。プレミアムユーザーは4件以上登録できます'
      )
    )

    const response = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', 'Bearer test-token')
      .send({ schoolId: '1' })

    expect(response.status).toBe(403)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('FAVORITE_LIMIT_EXCEEDED')
  })

  it('POST /api/v1/users/me/favorites はプレミアムユーザーの場合 201 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'PAID',
      subscription: {
        id: 'test-subscription-id',
        userId: 'test-user-id',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        status: 'ACTIVE',
        currentPeriodEnd: new Date('2026-07-30T00:00:00.000Z'),
        createdAt: new Date('2026-06-30T00:00:00.000Z'),
        updatedAt: new Date('2026-06-30T00:00:00.000Z'),
      },
    })

    const response = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', 'Bearer test-token')
      .send({ schoolId: '1' })

    expect(response.status).toBe(201)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.schoolId).toBe('1')
    expect(mockedAddUserFavorite).toHaveBeenCalledWith('test-user-id', true, 1n)
  })

  it('POST /api/v1/users/me/favorites は重複登録の場合 409 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'FREE',
      subscription: null,
    })

    mockedAddUserFavorite.mockRejectedValue(
      new FavoriteServiceError(
        409,
        'ALREADY_FAVORITED',
        'すでにお気に入り登録されています'
      )
    )

    const response = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', 'Bearer test-token')
      .send({ schoolId: '1' })

    expect(response.status).toBe(409)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('ALREADY_FAVORITED')
  })

  it('DELETE /api/v1/users/me/favorites/:schoolId は未認証の場合 401 を返す', async () => {
    const response = await request(app).delete('/api/v1/users/me/favorites/1')

    expect(response.status).toBe(401)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('DELETE /api/v1/users/me/favorites/:schoolId はお気に入り解除に成功すると 200 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'FREE',
      subscription: null,
    })

    const response = await request(app)
      .delete('/api/v1/users/me/favorites/1')
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({
      message: 'お気に入りを解除しました',
    })
    expect(mockedDeleteUserFavorite).toHaveBeenCalledWith('test-user-id', 1n)
  })

  it('DELETE /api/v1/users/me/favorites/:schoolId は対象が存在しない場合 404 を返す', async () => {
    mockAuthenticatedUser()
    mockCurrentUser({
      planType: 'FREE',
      subscription: null,
    })

    mockedDeleteUserFavorite.mockRejectedValue(
      new FavoriteServiceError(
        404,
        'NOT_FOUND',
        '対象のお気に入りが見つかりません'
      )
    )

    const response = await request(app)
      .delete('/api/v1/users/me/favorites/999999999')
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(404)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})
