import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware'

const mockGetOrCreateCurrentUser = vi.fn()
const mockUpdateUserProfile = vi.fn()
const mockUpsertUserPreference = vi.fn()

vi.mock('../../services/userService', () => ({
  getOrCreateCurrentUser: mockGetOrCreateCurrentUser,
  updateUserProfile: mockUpdateUserProfile,
  upsertUserPreference: mockUpsertUserPreference,
}))

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'test@example.com',
})

const createUser = () => ({
  id: 'user-1',
  supabaseUserId: 'supabase-user-1',
  email: 'test@example.com',
  name: 'テストユーザー',
  postalCode: '1234567',
  address: '東京都渋谷区',
  planType: 'FREE',
  subscription: null,
  preference: null,
})

const createPreference = () => ({
  preferredMealType: 'SCHOOL_LUNCH',
  preferredItemBurdenLevel: 'LOW',
  preferredDiaperSupport: true,
  preferredFutonSupport: true,
  preferredExtendedCare: true,
  preferredLessons: true,
  preferredAllergySupport: true,
  preferredWeekdayEventsLevel: 'LOW',
  preferredParentAssociationLevel: 'LOW',
})

const createRequest = (
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest =>
  ({
    authUser: createAuthUser(),
    body: {},
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

describe('userController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMe', () => {
    it('authUserがない場合は401を返す', async () => {
      const { getMe } = await import('../../controllers/userController')

      const req = createRequest({
        authUser: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await getMe(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('ユーザー情報を取得できた場合はpreferenceなしでdataを返す', async () => {
      const { getMe } = await import('../../controllers/userController')

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getMe(req, res, next)

      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'テストユーザー',
          postalCode: '1234567',
          address: '東京都渋谷区',
          membershipType: 'FREE',
          subscriptionStatus: null,
          currentPeriodEnd: null,
          preference: null,
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('ユーザー情報を取得できた場合はpreferenceとsubscriptionを含めてdataを返す', async () => {
      const { getMe } = await import('../../controllers/userController')

      const currentPeriodEnd = new Date('2026-12-31T00:00:00.000Z')

      mockGetOrCreateCurrentUser.mockResolvedValue({
        ...createUser(),
        planType: 'PAID',
        subscription: {
          status: 'ACTIVE',
          currentPeriodEnd,
        },
        preference: createPreference(),
      })

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getMe(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'テストユーザー',
          postalCode: '1234567',
          address: '東京都渋谷区',
          membershipType: 'PAID',
          subscriptionStatus: 'ACTIVE',
          currentPeriodEnd,
          preference: createPreference(),
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { getMe } = await import('../../controllers/userController')

      const error = new Error('SERVICE_ERROR')
      mockGetOrCreateCurrentUser.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getMe(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('updateMe', () => {
    it('authUserがない場合は401を返す', async () => {
      const { updateMe } = await import('../../controllers/userController')

      const req = createRequest({
        authUser: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await updateMe(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(mockUpdateUserProfile).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('プロフィールを更新できた場合はdataを返す', async () => {
      const { updateMe } = await import('../../controllers/userController')

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockUpdateUserProfile.mockResolvedValue({
        ...createUser(),
        name: '更新後ユーザー',
        postalCode: '7654321',
        address: '東京都新宿区',
      })

      const req = createRequest({
        body: {
          name: '更新後ユーザー',
          postalCode: '765-4321',
          address: '東京都新宿区',
        },
      })
      const res = createResponse()
      const next = createNext()

      await updateMe(req, res, next)

      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-1', {
        name: '更新後ユーザー',
        postalCode: '765-4321',
        address: '東京都新宿区',
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: '更新後ユーザー',
          postalCode: '7654321',
          address: '東京都新宿区',
          membershipType: 'FREE',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { updateMe } = await import('../../controllers/userController')

      const error = new Error('SERVICE_ERROR')
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockUpdateUserProfile.mockRejectedValue(error)

      const req = createRequest({
        body: {
          name: '更新後ユーザー',
        },
      })
      const res = createResponse()
      const next = createNext()

      await updateMe(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('updateMyPreference', () => {
    it('authUserがない場合は401を返す', async () => {
      const { updateMyPreference } =
        await import('../../controllers/userController')

      const req = createRequest({
        authUser: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await updateMyPreference(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockGetOrCreateCurrentUser).not.toHaveBeenCalled()
      expect(mockUpsertUserPreference).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('希望条件を更新できた場合はpreferenceを返す', async () => {
      const { updateMyPreference } =
        await import('../../controllers/userController')

      const preference = createPreference()

      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockUpsertUserPreference.mockResolvedValue(preference)

      const req = createRequest({
        body: preference,
      })
      const res = createResponse()
      const next = createNext()

      await updateMyPreference(req, res, next)

      expect(mockGetOrCreateCurrentUser).toHaveBeenCalledWith(createAuthUser())
      expect(mockUpsertUserPreference).toHaveBeenCalledWith(
        'user-1',
        preference
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          preference,
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { updateMyPreference } =
        await import('../../controllers/userController')

      const error = new Error('SERVICE_ERROR')
      mockGetOrCreateCurrentUser.mockResolvedValue(createUser())
      mockUpsertUserPreference.mockRejectedValue(error)

      const req = createRequest({
        body: createPreference(),
      })
      const res = createResponse()
      const next = createNext()

      await updateMyPreference(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
