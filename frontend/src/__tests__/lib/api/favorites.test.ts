// お気に入りAPI関数群のテスト
// src/__test__/lib/api/favorites.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const API_URL = 'http://test-api.example.com'
const ACCESS_TOKEN = 'test-access-token'

describe('favorites API', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', API_URL)
    vi.resetModules()
    mockFetch = vi.fn()
    global.fetch = mockFetch as unknown as typeof fetch
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('addFavorite', () => {
    it('POSTでschoolIdを送信し、成功時は何も返さない', async () => {
      const { addFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await expect(addFavorite(1, ACCESS_TOKEN)).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/users/me/favorites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ schoolId: 1 }),
        }
      )
    })

    it('失敗時はレスポンスのerror.codeをエラーメッセージとしてthrowする', async () => {
      const { addFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { code: 'FAVORITE_LIMIT_EXCEEDED' } }),
      })

      await expect(addFavorite(1, ACCESS_TOKEN)).rejects.toThrow(
        'FAVORITE_LIMIT_EXCEEDED'
      )
    })

    it('error.codeが無い場合はUNKNOWN_ERRORをthrowする', async () => {
      const { addFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(addFavorite(1, ACCESS_TOKEN)).rejects.toThrow(
        'UNKNOWN_ERROR'
      )
    })
  })

  describe('removeFavorite', () => {
    it('DELETEでschoolIdをURLに含めて送信する', async () => {
      const { removeFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await expect(removeFavorite(5, ACCESS_TOKEN)).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/users/me/favorites/5`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      )
    })

    it('失敗時はレスポンスのerror.codeをエラーメッセージとしてthrowする', async () => {
      const { removeFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { code: 'NOT_FOUND' } }),
      })

      await expect(removeFavorite(5, ACCESS_TOKEN)).rejects.toThrow('NOT_FOUND')
    })

    it('error.codeが無い場合はUNKNOWN_ERRORをthrowする', async () => {
      const { removeFavorite } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(removeFavorite(5, ACCESS_TOKEN)).rejects.toThrow(
        'UNKNOWN_ERROR'
      )
    })
  })

  describe('getFavorites', () => {
    it('成功時はレスポンスのJSONをそのまま返す', async () => {
      const { getFavorites } = await import('@/lib/api/favorites')
      const mockData = {
        data: [],
        meta: { favoriteCount: 0, favoriteLimit: 3 },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await getFavorites(ACCESS_TOKEN)

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/users/me/favorites`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      )
    })

    it('失敗時は固定のエラーメッセージをthrowする', async () => {
      const { getFavorites } = await import('@/lib/api/favorites')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(getFavorites(ACCESS_TOKEN)).rejects.toThrow(
        'お気に入り一覧の取得に失敗しました'
      )
    })
  })
})
