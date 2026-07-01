// frontend/src/__tests__/lib/hooks/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
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

  describe('onAuthStateChange コールバックの挙動', () => {
    it('ログイン後にセッションが変わった場合、supabaseUser と appUser が更新される', async () => {
      // 初回は未ログイン状態
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      // onAuthStateChange のコールバックを手動で呼び出せるように保持する
      let authChangeCallback: (
        event: string,
        session: { user: { id: string }; access_token: string } | null
      ) => Promise<void>

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authChangeCallback = callback as typeof authChangeCallback
          return { data: { subscription: { unsubscribe: vi.fn() } } } as never
        }
      )

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'user-5',
            email: 'new@example.com',
            name: 'ログイン後ユーザー',
            subscriptionStatus: 'ACTIVE',
          },
        }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // 初回は未ログイン
      expect(result.current.isLoggedIn).toBe(false)

      // onAuthStateChange コールバックを呼び出してログイン状態をシミュレート
      await act(async () => {
        await authChangeCallback!('SIGNED_IN', {
          user: { id: 'user-5' },
          access_token: 'new-token',
        })
      })

      await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
      expect(result.current.isPremium).toBe(true)
    })

    it('ログアウト後に appUser が null にリセットされる', async () => {
      // 初回はログイン状態
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-6' },
            access_token: 'dummy-token',
          },
        },
      })

      let authChangeCallback: (event: string, session: null) => Promise<void>

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authChangeCallback = callback as typeof authChangeCallback
          return { data: { subscription: { unsubscribe: vi.fn() } } } as never
        }
      )

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'user-6',
            email: 'logout@example.com',
            name: 'ログアウトユーザー',
            subscriptionStatus: null,
          },
        }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoggedIn).toBe(true))

      // ログアウトをシミュレート（session: null）
      await act(async () => {
        await authChangeCallback!('SIGNED_OUT', null)
      })

      await waitFor(() => expect(result.current.isLoggedIn).toBe(false))
      expect(result.current.appUser).toBeNull()
      expect(result.current.isPremium).toBe(false)
    })

    it('fetchAppUser でネットワークエラーが発生しても appUser は null のまま続行する', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-7' },
            access_token: 'dummy-token',
          },
        },
      })

      // fetch 自体が例外を投げる(ネットワークエラー)
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network Error')
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // 38行目: catch内のconsole.errorが呼ばれることを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        'ユーザー情報の取得に失敗しました',
        expect.any(Error)
      )
      expect(result.current.appUser).toBeNull()
      expect(result.current.isLoggedIn).toBe(true)

      consoleSpy.mockRestore()
    })
  })
})
