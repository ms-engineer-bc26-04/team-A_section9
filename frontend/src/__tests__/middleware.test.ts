// 認証・認可によるアクセス制御のテスト
// src/__tests__/middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { middleware } from '../middleware'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

const mockCreateServerClient = createServerClient as ReturnType<typeof vi.fn>

const mockUser = { id: 'user-1', email: 'test@example.com' }

const setUser = (user: typeof mockUser | null) => {
  mockCreateServerClient.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  } as never)
}

const makeRequest = (path: string) =>
  new NextRequest(new URL(path, 'http://localhost:3000'))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://supabase.example.com')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'dummy-anon-key')
})

describe('middleware', () => {
  describe('未ログイン時', () => {
    beforeEach(() => setUser(null))

    it('認証必須画面（/mypage）にアクセスすると/loginへリダイレクトする', async () => {
      const res = await middleware(makeRequest('/mypage'))

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('認証必須画面のネストしたパス（/mypage/favorites）でもリダイレクトする', async () => {
      const res = await middleware(makeRequest('/mypage/favorites'))

      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('/loginにはそのままアクセスできる（リダイレクトしない）', async () => {
      const res = await middleware(makeRequest('/login'))

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('/registerにはそのままアクセスできる', async () => {
      const res = await middleware(makeRequest('/register'))

      expect(res.status).toBe(200)
    })
  })

  describe('ログイン済み時', () => {
    beforeEach(() => setUser(mockUser))

    it('認証必須画面（/compare）にそのままアクセスできる', async () => {
      const res = await middleware(makeRequest('/compare'))

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('/loginにアクセスすると/へリダイレクトする', async () => {
      const res = await middleware(makeRequest('/login'))

      expect(res.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('/registerにアクセスすると/へリダイレクトする', async () => {
      const res = await middleware(makeRequest('/register'))

      expect(res.headers.get('location')).toBe('http://localhost:3000/')
    })
  })

  it('保護対象でも認証対象でもないパスはそのまま通す', async () => {
    setUser(null)

    const res = await middleware(makeRequest('/'))

    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
