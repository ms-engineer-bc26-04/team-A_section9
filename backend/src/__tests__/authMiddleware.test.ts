import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware'

const mockSupabaseGetUser = vi.fn()
const mockUserFindFirst = vi.fn()
const mockUserUpdate = vi.fn()
const mockUserCreate = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockSupabaseGetUser,
    },
  },
}))

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: mockUserFindFirst,
      update: mockUserUpdate,
      create: mockUserCreate,
    },
  },
}))

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
})

const createRequest = (authorization?: string): AuthenticatedRequest =>
  ({
    headers: authorization
      ? {
          authorization,
        }
      : {},
  }) as AuthenticatedRequest

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

const createNext = () =>
  vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authenticateSupabaseUser', () => {
    it('Authorizationヘッダーがない場合は401を返す', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockSupabaseGetUser).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('AuthorizationヘッダーがBearer形式でない場合は401を返す', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      const req = createRequest('Token invalid-token')
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockSupabaseGetUser).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('Supabaseユーザー取得に失敗した場合は401を返す', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: null,
        },
        error: {
          message: 'invalid token',
        },
      })

      const req = createRequest('Bearer invalid-token')
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(mockSupabaseGetUser).toHaveBeenCalledWith('invalid-token')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('既存ユーザーがある場合はSupabaseユーザーIDとメールを更新してnextを呼ぶ', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      const authUser = createAuthUser()

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: authUser,
        },
        error: null,
      })

      mockUserFindFirst.mockResolvedValue({
        id: 'user-1',
        supabaseUserId: 'old-supabase-user-id',
        email: 'old@example.com',
      })

      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
      })

      const req = createRequest('Bearer valid-token')
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              supabaseUserId: 'supabase-user-1',
            },
            {
              email: 'test@example.com',
            },
          ],
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          supabaseUserId: 'supabase-user-1',
          email: 'test@example.com',
        },
      })

      expect(mockUserCreate).not.toHaveBeenCalled()
      expect(req.authUser).toBe(authUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('既存ユーザーがない場合はアプリ側Userを作成してnextを呼ぶ', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      const authUser = createAuthUser()

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: authUser,
        },
        error: null,
      })

      mockUserFindFirst.mockResolvedValue(null)
      mockUserCreate.mockResolvedValue({
        id: 'user-1',
      })

      const req = createRequest('Bearer valid-token')
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          supabaseUserId: 'supabase-user-1',
          email: 'test@example.com',
          planType: 'FREE',
        },
      })

      expect(mockUserUpdate).not.toHaveBeenCalled()
      expect(req.authUser).toBe(authUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { authenticateSupabaseUser } =
        await import('../middlewares/authMiddleware')

      const error = new Error('DB_ERROR')

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: createAuthUser(),
        },
        error: null,
      })
      mockUserFindFirst.mockRejectedValue(error)

      const req = createRequest('Bearer valid-token')
      const res = createResponse()
      const next = createNext()

      await authenticateSupabaseUser(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('optionalAuthenticateSupabaseUser', () => {
    it('Authorizationヘッダーがない場合は認証せずnextを呼ぶ', async () => {
      const { optionalAuthenticateSupabaseUser } =
        await import('../middlewares/optionalAuthMiddleware')

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await optionalAuthenticateSupabaseUser(req, res, next)

      expect(mockSupabaseGetUser).not.toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith()
    })

    it('AuthorizationヘッダーがBearer形式でない場合は401を返す', async () => {
      const { optionalAuthenticateSupabaseUser } =
        await import('../middlewares/optionalAuthMiddleware')

      const req = createRequest('Token invalid-token')
      const res = createResponse()
      const next = createNext()

      await optionalAuthenticateSupabaseUser(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
      expect(mockSupabaseGetUser).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('Supabaseユーザー取得に失敗した場合は401を返す', async () => {
      const { optionalAuthenticateSupabaseUser } =
        await import('../middlewares/optionalAuthMiddleware')

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: null,
        },
        error: {
          message: 'invalid token',
        },
      })

      const req = createRequest('Bearer invalid-token')
      const res = createResponse()
      const next = createNext()

      await optionalAuthenticateSupabaseUser(req, res, next)

      expect(mockSupabaseGetUser).toHaveBeenCalledWith('invalid-token')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証情報が無効です',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('Supabaseユーザーを取得できた場合はreq.authUserに設定してnextを呼ぶ', async () => {
      const { optionalAuthenticateSupabaseUser } =
        await import('../middlewares/optionalAuthMiddleware')

      const authUser = createAuthUser()

      mockSupabaseGetUser.mockResolvedValue({
        data: {
          user: authUser,
        },
        error: null,
      })

      const req = createRequest('Bearer valid-token')
      const res = createResponse()
      const next = createNext()

      await optionalAuthenticateSupabaseUser(req, res, next)

      expect(req.authUser).toBe(authUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { optionalAuthenticateSupabaseUser } =
        await import('../middlewares/optionalAuthMiddleware')

      const error = new Error('SUPABASE_ERROR')

      mockSupabaseGetUser.mockRejectedValue(error)

      const req = createRequest('Bearer valid-token')
      const res = createResponse()
      const next = createNext()

      await optionalAuthenticateSupabaseUser(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
