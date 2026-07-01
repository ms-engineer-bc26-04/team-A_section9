// frontend/src/lib/hooks/useFavorites.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { favoritesFetcher } from '@/lib/hooks/useFavorites'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>

describe('favoritesFetcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn()
  })

  it('未ログイン（アクセストークンなし）の場合は空のレスポンスを返す', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const result = await favoritesFetcher()

    expect(result).toEqual({
      favorites: [],
      favoriteCount: 0,
      favoriteLimit: null,
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('一般ユーザーの場合、meta.favoriteLimit を正しく取得する', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 1, school: { id: 1 }, createdAt: '2026-06-30' }],
        meta: { favoriteCount: 1, favoriteLimit: 5 },
      }),
    })

    const result = await favoritesFetcher()

    // 回帰テスト: 過去に json 直下を参照してしまい favoriteLimit が
    // 常に null になっていた不具合（meta 配下を参照するよう修正済み）の再発防止
    expect(result.favoriteLimit).toBe(5)
    expect(result.favoriteCount).toBe(1)
    expect(result.favorites).toHaveLength(1)
  })

  it('プレミアムユーザーの場合、favoriteLimit が null として返る', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { favoriteCount: 12, favoriteLimit: null },
      }),
    })

    const result = await favoritesFetcher()

    expect(result.favoriteLimit).toBeNull()
    expect(result.favoriteCount).toBe(12)
  })

  it('APIエラー時は例外をスローする', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    })

    await expect(favoritesFetcher()).rejects.toThrow(
      'お気に入りの取得に失敗しました'
    )
  })

  it('meta が存在しない不正なレスポンスでも data.length にフォールバックする', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 1 }, { id: 2 }],
      }),
    })

    const result = await favoritesFetcher()

    expect(result.favoriteCount).toBe(2)
    expect(result.favoriteLimit).toBeNull()
  })
})
