import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SchoolAdminRequest } from '../middlewares/schoolAdminMiddleware'

const mockUserFindUnique = vi.fn()
const mockSchoolAdminFindUnique = vi.fn()

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
    },
    schoolAdmin: {
      findUnique: mockSchoolAdminFindUnique,
    },
  },
}))

const createRequest = (
  authUser?: SchoolAdminRequest['authUser']
): SchoolAdminRequest =>
  ({
    authUser,
  }) as SchoolAdminRequest

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'admin@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
})

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

describe('schoolAdminMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireSchoolAdmin', () => {
    it('req.authUserがない場合は401を返す', async () => {
      const { requireSchoolAdmin } =
        await import('../middlewares/schoolAdminMiddleware')

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await requireSchoolAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockUserFindUnique).not.toHaveBeenCalled()
      expect(mockSchoolAdminFindUnique).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('アプリ側Userが存在しない場合は401を返す', async () => {
      const { requireSchoolAdmin } =
        await import('../middlewares/schoolAdminMiddleware')

      mockUserFindUnique.mockResolvedValue(null)

      const req = createRequest(createAuthUser())
      const res = createResponse()
      const next = createNext()

      await requireSchoolAdmin(req, res, next)

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: {
          supabaseUserId: 'supabase-user-1',
        },
      })

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ユーザー情報が見つかりません',
        },
      })
      expect(mockSchoolAdminFindUnique).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('園管理者として登録されていない場合は403を返す', async () => {
      const { requireSchoolAdmin } =
        await import('../middlewares/schoolAdminMiddleware')

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        supabaseUserId: 'supabase-user-1',
      })

      mockSchoolAdminFindUnique.mockResolvedValue(null)

      const req = createRequest(createAuthUser())
      const res = createResponse()
      const next = createNext()

      await requireSchoolAdmin(req, res, next)

      expect(mockSchoolAdminFindUnique).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
      })

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('園管理者の場合はreq.schoolAdminを設定してnextを呼ぶ', async () => {
      const { requireSchoolAdmin } =
        await import('../middlewares/schoolAdminMiddleware')

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        supabaseUserId: 'supabase-user-1',
      })

      mockSchoolAdminFindUnique.mockResolvedValue({
        id: 'school-admin-1',
        userId: 'user-1',
        schoolId: 1n,
      })

      const req = createRequest(createAuthUser())
      const res = createResponse()
      const next = createNext()

      await requireSchoolAdmin(req, res, next)

      expect(req.schoolAdmin).toEqual({
        id: 'school-admin-1',
        userId: 'user-1',
        schoolId: 1n,
      })

      expect(res.status).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { requireSchoolAdmin } =
        await import('../middlewares/schoolAdminMiddleware')

      const error = new Error('DB_ERROR')

      mockUserFindUnique.mockRejectedValue(error)

      const req = createRequest(createAuthUser())
      const res = createResponse()
      const next = createNext()

      await requireSchoolAdmin(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
