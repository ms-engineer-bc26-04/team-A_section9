// frontend/src/__tests__/lib/hooks/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Supabase のモック
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
    },
  },
}))

// fetch のモック（GET /api/v1/users/me 用）
const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.resetAllMocks()
  global.fetch = vi.fn()

  // onAuthStateChange はデフォルトで何もしない（コールバックを呼ばない）状態にしておく
  vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as never)
})

describe('useAuth', () => {
  describe('isPremium の判定', () => {
    it('subscriptionStatus が ACTIVE の場合、isPremium が true になる', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-1' },
            access_token: 'dummy-token',
          },
        },
      })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'テスト 太郎',
            subscriptionStatus: 'ACTIVE',
          },
        }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.isPremium).toBe(true)
      expect(result.current.isLoggedIn).toBe(true)
    })

    it('subscriptionStatus が ACTIVE 以外の場合、isPremium が false になる', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-2' },
            access_token: 'dummy-token',
          },
        },
      })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'user-2',
            email: 'free@example.com',
            name: null,
            subscriptionStatus: null,
          },
        }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.isPremium).toBe(false)
    })

    it('subscriptionStatus が CANCELED の場合、isPremium が false になる', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-3' },
            access_token: 'dummy-token',
          },
        },
      })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'user-3',
            email: 'canceled@example.com',
            name: null,
            // ACTIVE 以外であれば何であっても false になることを確認
            subscriptionStatus: 'CANCELED',
          },
        }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.isPremium).toBe(false)
    })
  })

  describe('未ログイン状態', () => {
    it('セッションがない場合、isLoggedIn が false になる', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.isLoggedIn).toBe(false)
      expect(result.current.supabaseUser).toBeNull()
      expect(result.current.appUser).toBeNull()
      expect(result.current.isPremium).toBe(false)
      // 未ログイン時は /api/v1/users/me を呼ばない
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('APIエラー時の挙動', () => {
    it('GET /users/me が失敗しても appUser は null のまま、クラッシュしない', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-4' },
            access_token: 'dummy-token',
          },
        },
      })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.appUser).toBeNull()
      expect(result.current.isPremium).toBe(false)
      // isLoggedIn はセッションがあれば true
      expect(result.current.isLoggedIn).toBe(true)
    })
  })
})
