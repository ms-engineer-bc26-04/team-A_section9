import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware'

const mockGetOrCreateCurrentUser = vi.fn()
const mockGetUserFavorites = vi.fn()
const mockAddUserFavorite = vi.fn()
const mockDeleteUserFavorite = vi.fn()

vi.mock('../../services/userService', () => ({
  getOrCreateCurrentUser: mockGetOrCreateCurrentUser,
}))

vi.mock('../../services/favoriteService', async () => {
  const actual = await vi.importActual<
    typeof import('../../services/favoriteService')
  >('../../services/favoriteService')

  return {
    ...actual,
    getUserFavorites: mockGetUserFavorites,
    addUserFavorite: mockAddUserFavorite,
    deleteUserFavorite: mockDeleteUserFavorite,
  }
})

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

const createRequest = (
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest =>
  ({
    authUser: createAuthUser(),
    body: {},
    params: {},
    ...overrides,
  }) as AuthenticatedRequest

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

const createNext = () =>
  vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>

describe('favoriteController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFavorites', () => {
    it('authUserがない場合は401を返す', async () => {
      const { getFavorites } =
        await import('../../controllers/favoriteController')

      const req = createRequest({
        authUser: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await getFavorites(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(mockGetUserFavorites).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('無料ユーザーのお気に入り一覧を返す', async () => {
      const { getFavorites } =
        await import('../../controllers/favoriteController')

      const result = {
        data: [
          {
            id: '1',
            schoolId: '10',
            school: {
              id: '10',
              name: 'さくら保育園',
            },
          },
        ],
        meta: {
          favoriteCount: 1,
          favoriteLimit: 3,
        },
      }

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetUserFavorites.mockResolvedValue(result)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getFavorites(req, res, next)

      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(mockGetUserFavorites).toHaveBeenCalledWith('user-1', false)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(result)
      expect(next).not.toHaveBeenCalled()
    })

    it('subscription.statusがACTIVEの場合はプレミアムユーザーとして扱う', async () => {
      const { getFavorites } =
        await import('../../controllers/favoriteController')

      const result = {
        data: [],
        meta: {
          favoriteCount: 0,
          favoriteLimit: null,
        },
      }

      mockGetOrCreateCurrentUser.mockResolvedValue(
        createUser({
          subscription: {
            status: 'ACTIVE',
          },
        })
      )
      mockGetUserFavorites.mockResolvedValue(result)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getFavorites(req, res, next)

      expect(mockGetUserFavorites).toHaveBeenCalledWith('user-1', true)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(result)
      expect(next).not.toHaveBeenCalled()
    })

    it('planTypeがPAIDの場合はプレミアムユーザーとして扱う', async () => {
      const { getFavorites } =
        await import('../../controllers/favoriteController')

      const result = {
        data: [],
        meta: {
          favoriteCount: 0,
          favoriteLimit: null,
        },
      }

      mockGetOrCreateCurrentUser.mockResolvedValue(
        createUser({
          planType: 'PAID',
        })
      )
      mockGetUserFavorites.mockResolvedValue(result)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getFavorites(req, res, next)

      expect(mockGetUserFavorites).toHaveBeenCalledWith('user-1', true)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(result)
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { getFavorites } =
        await import('../../controllers/favoriteController')

      const error = new Error('SERVICE_ERROR')
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetUserFavorites.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getFavorites(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('addFavorite', () => {
    it('authUserがない場合は401を返す', async () => {
      const { addFavorite } =
        await import('../../controllers/favoriteController')

      const req = createRequest({
        authUser: undefined,
        body: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await addFavorite(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockAddUserFavorite).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('お気に入りを追加できた場合は201を返す', async () => {
      const { addFavorite } =
        await import('../../controllers/favoriteController')

      const favorite = {
        id: 'favorite-1',
        userId: 'user-1',
        schoolId: '10',
      }

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockAddUserFavorite.mockResolvedValue(favorite)

      const req = createRequest({
        body: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await addFavorite(req, res, next)

      expect(mockAddUserFavorite).toHaveBeenCalledWith('user-1', false, 10n)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        data: favorite,
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('FavoriteServiceErrorの場合はserviceのstatusCode/code/messageを返す', async () => {
      const { addFavorite } =
        await import('../../controllers/favoriteController')
      const { FavoriteServiceError } =
        await import('../../services/favoriteService')

      const error = new FavoriteServiceError(
        409,
        'ALREADY_FAVORITED',
        'すでにお気に入りに登録されています'
      )

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockAddUserFavorite.mockRejectedValue(error)

      const req = createRequest({
        body: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await addFavorite(req, res, next)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'ALREADY_FAVORITED',
          message: 'すでにお気に入りに登録されています',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('想定外エラーの場合はnextに渡す', async () => {
      const { addFavorite } =
        await import('../../controllers/favoriteController')

      const error = new Error('SERVICE_ERROR')

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockAddUserFavorite.mockRejectedValue(error)

      const req = createRequest({
        body: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await addFavorite(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('deleteFavorite', () => {
    it('authUserがない場合は401を返す', async () => {
      const { deleteFavorite } =
        await import('../../controllers/favoriteController')

      const req = createRequest({
        authUser: undefined,
        params: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await deleteFavorite(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockDeleteUserFavorite).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('お気に入りを削除できた場合は200を返す', async () => {
      const { deleteFavorite } =
        await import('../../controllers/favoriteController')

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockDeleteUserFavorite.mockResolvedValue(undefined)

      const req = createRequest({
        params: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await deleteFavorite(req, res, next)

      expect(mockDeleteUserFavorite).toHaveBeenCalledWith('user-1', 10n)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          message: 'お気に入りを解除しました',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('FavoriteServiceErrorの場合はserviceのstatusCode/code/messageを返す', async () => {
      const { deleteFavorite } =
        await import('../../controllers/favoriteController')
      const { FavoriteServiceError } =
        await import('../../services/favoriteService')

      const error = new FavoriteServiceError(
        404,
        'FAVORITE_NOT_FOUND',
        'お気に入りが見つかりません'
      )

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockDeleteUserFavorite.mockRejectedValue(error)

      const req = createRequest({
        params: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await deleteFavorite(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: 'お気に入りが見つかりません',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('想定外エラーの場合はnextに渡す', async () => {
      const { deleteFavorite } =
        await import('../../controllers/favoriteController')

      const error = new Error('SERVICE_ERROR')

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockDeleteUserFavorite.mockRejectedValue(error)

      const req = createRequest({
        params: {
          schoolId: '10',
        },
      })
      const res = createResponse()
      const next = createNext()

      await deleteFavorite(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
