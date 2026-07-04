import { Prisma } from '@prisma/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTransaction = vi.fn()
const mockUserFindFirst = vi.fn()
const mockUserUpdate = vi.fn()
const mockUserPreferenceUpsert = vi.fn()

const mockTxUserFindUnique = vi.fn()
const mockTxUserUpdate = vi.fn()
const mockTxUserCreate = vi.fn()

vi.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: mockTransaction,
    user: {
      findFirst: mockUserFindFirst,
      update: mockUserUpdate,
    },
    userPreference: {
      upsert: mockUserPreferenceUpsert,
    },
  },
}))

const createAuthUser = (overrides: Partial<SupabaseUser> = {}): SupabaseUser =>
  ({
    id: 'supabase-user-1',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as SupabaseUser

const createUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  supabaseUserId: 'supabase-user-1',
  email: 'test@example.com',
  planType: 'FREE',
  subscription: null,
  preference: null,
  ...overrides,
})

const mockTransactionWithTx = () => {
  mockTransaction.mockImplementation(async (callback) => {
    return await callback({
      user: {
        findUnique: mockTxUserFindUnique,
        update: mockTxUserUpdate,
        create: mockTxUserCreate,
      },
    })
  })
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTransactionWithTx()
  })

  describe('getOrCreateCurrentUser', () => {
    it('Supabaseユーザーのメールアドレスがない場合はエラーを投げる', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const authUser = createAuthUser({
        email: undefined,
      })

      await expect(getOrCreateCurrentUser(authUser)).rejects.toThrow(
        'Supabaseユーザーのメールアドレスが取得できません'
      )

      expect(mockTransaction).not.toHaveBeenCalled()
    })

    it('supabaseUserIdで既存ユーザーが見つかった場合はそのユーザーを返す', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const existingUser = createUser()

      mockTxUserFindUnique.mockResolvedValueOnce(existingUser)

      const result = await getOrCreateCurrentUser(createAuthUser())

      expect(mockTxUserFindUnique).toHaveBeenCalledWith({
        where: {
          supabaseUserId: 'supabase-user-1',
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      expect(mockTxUserUpdate).not.toHaveBeenCalled()
      expect(mockTxUserCreate).not.toHaveBeenCalled()
      expect(result).toBe(existingUser)
    })

    it('emailで既存ユーザーが見つかり、supabaseUserIdが未設定の場合はsupabaseUserIdを更新する', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const existingUserByEmail = createUser({
        id: 'user-1',
        supabaseUserId: null,
        email: 'test@example.com',
      })

      const updatedUser = createUser({
        id: 'user-1',
        supabaseUserId: 'supabase-user-1',
        email: 'test@example.com',
      })

      mockTxUserFindUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUserByEmail)
      mockTxUserUpdate.mockResolvedValue(updatedUser)

      const result = await getOrCreateCurrentUser(createAuthUser())

      expect(mockTxUserFindUnique).toHaveBeenNthCalledWith(2, {
        where: {
          email: 'test@example.com',
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      expect(mockTxUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          supabaseUserId: 'supabase-user-1',
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      expect(mockTxUserCreate).not.toHaveBeenCalled()
      expect(result).toBe(updatedUser)
    })

    it('emailで既存ユーザーが見つかり、supabaseUserIdが別IDの場合はエラーを投げる', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      mockTxUserFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(
        createUser({
          supabaseUserId: 'different-supabase-user-id',
        })
      )

      await expect(getOrCreateCurrentUser(createAuthUser())).rejects.toThrow(
        '既存ユーザーのSupabaseユーザーIDが一致しません'
      )

      expect(mockTxUserUpdate).not.toHaveBeenCalled()
      expect(mockTxUserCreate).not.toHaveBeenCalled()
    })

    it('既存ユーザーが存在しない場合は新規作成する', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const createdUser = createUser()

      mockTxUserFindUnique.mockResolvedValue(null)
      mockTxUserCreate.mockResolvedValue(createdUser)

      const result = await getOrCreateCurrentUser(createAuthUser())

      expect(mockTxUserCreate).toHaveBeenCalledWith({
        data: {
          supabaseUserId: 'supabase-user-1',
          email: 'test@example.com',
          planType: 'FREE',
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      expect(result).toBe(createdUser)
    })

    it('P2002発生時に既存ユーザーを取得できた場合はそのユーザーを返す', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test-client-version',
        }
      )

      const existingUser = createUser()

      mockTransaction.mockRejectedValue(prismaError)
      mockUserFindFirst.mockResolvedValue(existingUser)

      const result = await getOrCreateCurrentUser(createAuthUser())

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
        include: {
          subscription: true,
          preference: true,
        },
      })

      expect(result).toBe(existingUser)
    })

    it('P2002発生時に既存ユーザーを取得できない場合は元のエラーを投げる', async () => {
      const { getOrCreateCurrentUser } =
        await import('../../services/userService')

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test-client-version',
        }
      )

      mockTransaction.mockRejectedValue(prismaError)
      mockUserFindFirst.mockResolvedValue(null)

      await expect(getOrCreateCurrentUser(createAuthUser())).rejects.toThrow(
        'Unique constraint failed'
      )
    })
  })

  describe('upsertUserPreference', () => {
    it('希望条件をupsertする', async () => {
      const { upsertUserPreference } =
        await import('../../services/userService')

      const preference = {
        userId: 'user-1',
        preferredMealType: 'SCHOOL_LUNCH',
      }

      mockUserPreferenceUpsert.mockResolvedValue(preference)

      const result = await upsertUserPreference('user-1', {
        preferredMealType: 'SCHOOL_LUNCH',
        preferredItemBurdenLevel: 'LOW',
        preferredDiaperSupport: '園で廃棄',
        preferredFutonSupport: '園で管理',
        preferredExtendedCare: '20人以上',
        preferredLessons: true,
        preferredAllergySupport: true,
        preferredWeekdayEventsLevel: 'LOW',
        preferredParentAssociationLevel: 'LOW',
      })

      expect(mockUserPreferenceUpsert).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
        update: {
          preferredMealType: 'SCHOOL_LUNCH',
          preferredItemBurdenLevel: 'LOW',
          preferredDiaperSupport: '園で廃棄',
          preferredFutonSupport: '園で管理',
          preferredExtendedCare: '20人以上',
          preferredLessons: true,
          preferredAllergySupport: true,
          preferredWeekdayEventsLevel: 'LOW',
          preferredParentAssociationLevel: 'LOW',
        },
        create: {
          userId: 'user-1',
          preferredMealType: 'SCHOOL_LUNCH',
          preferredItemBurdenLevel: 'LOW',
          preferredDiaperSupport: '園で廃棄',
          preferredFutonSupport: '園で管理',
          preferredExtendedCare: '20人以上',
          preferredLessons: true,
          preferredAllergySupport: true,
          preferredWeekdayEventsLevel: 'LOW',
          preferredParentAssociationLevel: 'LOW',
        },
      })

      expect(result).toBe(preference)
    })

    it('未指定の希望条件はnullとしてupsertする', async () => {
      const { upsertUserPreference } =
        await import('../../services/userService')

      mockUserPreferenceUpsert.mockResolvedValue({
        userId: 'user-1',
      })

      await upsertUserPreference('user-1', {})

      expect(mockUserPreferenceUpsert).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
        update: {
          preferredMealType: null,
          preferredItemBurdenLevel: null,
          preferredDiaperSupport: null,
          preferredFutonSupport: null,
          preferredExtendedCare: null,
          preferredLessons: null,
          preferredAllergySupport: null,
          preferredWeekdayEventsLevel: null,
          preferredParentAssociationLevel: null,
        },
        create: {
          userId: 'user-1',
          preferredMealType: null,
          preferredItemBurdenLevel: null,
          preferredDiaperSupport: null,
          preferredFutonSupport: null,
          preferredExtendedCare: null,
          preferredLessons: null,
          preferredAllergySupport: null,
          preferredWeekdayEventsLevel: null,
          preferredParentAssociationLevel: null,
        },
      })
    })
  })

  describe('updateUserProfile', () => {
    it('プロフィールを更新し、郵便番号のハイフンを除去する', async () => {
      const { updateUserProfile } = await import('../../services/userService')

      const updatedUser = createUser({
        name: 'テストユーザー',
        postalCode: '1234567',
        address: '東京都渋谷区',
      })

      mockUserUpdate.mockResolvedValue(updatedUser)

      const result = await updateUserProfile('user-1', {
        name: 'テストユーザー',
        postalCode: '123-4567',
        address: '東京都渋谷区',
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          name: 'テストユーザー',
          postalCode: '1234567',
          address: '東京都渋谷区',
        },
      })

      expect(result).toBe(updatedUser)
    })

    it('未指定のプロフィール項目はnullとして更新する', async () => {
      const { updateUserProfile } = await import('../../services/userService')

      mockUserUpdate.mockResolvedValue(createUser())

      await updateUserProfile('user-1', {})

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          name: null,
          postalCode: null,
          address: null,
        },
      })
    })
  })
})
