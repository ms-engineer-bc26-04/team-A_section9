import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware'

const mockGetOrCreateCurrentUser = vi.fn()
const mockGetComparedSchools = vi.fn()
const mockParseCompareSchoolIds = vi.fn()

vi.mock('../../services/userService', () => ({
  getOrCreateCurrentUser: mockGetOrCreateCurrentUser,
}))

vi.mock('../../services/compareService', async () => {
  const actual = await vi.importActual<
    typeof import('../../services/compareService')
  >('../../services/compareService')

  return {
    ...actual,
    getComparedSchools: mockGetComparedSchools,
  }
})

vi.mock('../../validators/compareValidator', () => ({
  parseCompareSchoolIds: mockParseCompareSchoolIds,
}))

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'test@example.com',
})

const createUser = () => ({
  id: 'user-1',
  email: 'test@example.com',
  planType: 'FREE',
  subscription: null,
})

const createRequest = (
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest =>
  ({
    authUser: createAuthUser(),
    query: {
      ids: '1,2',
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

const createNext = () =>
  vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>

describe('compareController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCompareSchoolsController', () => {
    it('authUserがない場合は401を返す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      const req = createRequest({
        authUser: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockParseCompareSchoolIds).not.toHaveBeenCalled()
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(mockGetComparedSchools).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('idsが不正な場合は422を返す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      mockParseCompareSchoolIds.mockImplementation(() => {
        throw new Error('比較対象は2園または3園を指定してください')
      })

      const req = createRequest({
        query: {
          ids: '1',
        },
      })
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(mockParseCompareSchoolIds).toHaveBeenCalledWith('1')
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: '比較対象は2園または3園を指定してください',
        },
      })
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(mockGetComparedSchools).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('validatedQueryがある場合はvalidatedQueryのidsを使用する', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      const schoolIds = [10n, 20n]
      const result = {
        schools: [
          {
            id: '10',
            name: 'さくら保育園',
          },
          {
            id: '20',
            name: 'ひまわり保育園',
          },
        ],
      }

      mockParseCompareSchoolIds.mockReturnValue(schoolIds)
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetComparedSchools.mockResolvedValue(result)

      const req = createRequest({
        query: {
          ids: '1,2',
        },
      })
      const res = createResponse()
      res.locals.validatedQuery = {
        ids: '10,20',
      }
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(mockParseCompareSchoolIds).toHaveBeenCalledWith('10,20')
      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(mockGetComparedSchools).toHaveBeenCalledWith(
        createUser(),
        schoolIds
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: result,
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('比較対象の園情報を取得できた場合は200を返す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      const schoolIds = [1n, 2n]
      const result = {
        schools: [
          {
            id: '1',
            name: 'さくら保育園',
          },
          {
            id: '2',
            name: 'ひまわり保育園',
          },
        ],
      }

      mockParseCompareSchoolIds.mockReturnValue(schoolIds)
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetComparedSchools.mockResolvedValue(result)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(mockParseCompareSchoolIds).toHaveBeenCalledWith('1,2')
      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(mockGetComparedSchools).toHaveBeenCalledWith(
        createUser(),
        schoolIds
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: result,
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('CompareServiceErrorの場合はserviceのstatusCode/code/messageを返す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')
      const { CompareServiceError } =
        await import('../../services/compareService')

      const schoolIds = [1n, 2n]
      const error = new CompareServiceError(
        403,
        'PREMIUM_REQUIRED',
        '3園比較はプレミアムユーザーのみ利用できます'
      )

      mockParseCompareSchoolIds.mockReturnValue(schoolIds)
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetComparedSchools.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PREMIUM_REQUIRED',
          message: '3園比較はプレミアムユーザーのみ利用できます',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('想定外エラーの場合はnextに渡す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      const schoolIds = [1n, 2n]
      const error = new Error('SERVICE_ERROR')

      mockParseCompareSchoolIds.mockReturnValue(schoolIds)
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockGetComparedSchools.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('Error以外のvalidation errorの場合はデフォルトメッセージで422を返す', async () => {
      const { getCompareSchoolsController } =
        await import('../../controllers/compareController')

      mockParseCompareSchoolIds.mockImplementation(() => {
        throw 'VALIDATION_ERROR'
      })

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getCompareSchoolsController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: '比較対象の園IDが不正です',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
