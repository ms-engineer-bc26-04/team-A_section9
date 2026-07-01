import { afterAll, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { supabase } from '../../lib/supabase'
import { getOrCreateCurrentUser } from '../../services/userService'

const mockedSupabase = vi.mocked(supabase)
const mockedGetOrCreateCurrentUser = vi.mocked(getOrCreateCurrentUser)

export const mockUserRecord = {
  id: 'test-user-id',
  supabaseUserId: 'test-supabase-user-id',
  email: 'test@example.com',
  planType: 'FREE',
  createdAt: new Date('2026-06-30T00:00:00.000Z'),
  updatedAt: new Date('2026-06-30T00:00:00.000Z'),
}

export const mockAuthenticatedUser = () => {
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

export const mockUnauthenticatedUser = () => {
  mockedSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  } as never)
}

export const mockCurrentUser = (
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

export const mockAuthPrismaUser = () => {
  vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUserRecord as never)
  vi.spyOn(prisma.user, 'update').mockResolvedValue(mockUserRecord as never)
  vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUserRecord as never)
}

export const setupAuthTest = () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticatedUser()
    mockAuthPrismaUser()
    mockCurrentUser()
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    await prisma.$disconnect()
  })
}
