// frontend/src/__tests__/lib/hooks/useFavorites.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites, favoritesFetcher } from '@/lib/hooks/useFavorites'
import { supabase } from '@/lib/supabase'

// SWR のモック
vi.mock('swr', () => ({
  default: vi.fn(),
}))

// Supabase のモック
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

// favorites API のモック
vi.mock('@/lib/api/favorites', () => ({
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}))

import useSWR from 'swr'
import {
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from '@/lib/api/favorites'

const mockUseSWR = useSWR as ReturnType<typeof vi.fn>
const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>
const mockMutate = vi.fn()

// テスト用のモックデータ
const MOCK_FAVORITE_1 = {
  id: 1,
  school: {
    id: 1,
    name: 'さくら保育園',
    area: '渋谷区',
    address: '東京都渋谷区',
    phoneNumber: null,
    imageUrl: null,
    schoolType: 'NURSERY',
    tags: ['毎日給食'],
  },
  createdAt: '2026-06-30T00:00:00.000Z',
}

const MOCK_FAVORITE_2 = {
  id: 2,
  school: {
    id: 2,
    name: 'みらいこども園',
    area: '新宿区',
    address: '東京都新宿区',
    phoneNumber: null,
    imageUrl: null,
    schoolType: 'CERTIFIED_CHILDCARE_CENTER',
    tags: [],
  },
  createdAt: '2026-06-30T00:00:00.000Z',
}

beforeEach(() => {
  vi.resetAllMocks()
  global.fetch = vi.fn()

  // デフォルトのSWRモック: 2件登録済み・上限3件の状態
  mockUseSWR.mockReturnValue({
    data: {
      favorites: [MOCK_FAVORITE_1, MOCK_FAVORITE_2],
      favoriteCount: 2,
      favoriteLimit: 5,
    },
    mutate: mockMutate,
    error: undefined,
    isLoading: false,
  })
})

// ---- favoritesFetcher のテスト ----
describe('favoritesFetcher', () => {
  it('アクセストークンが無い場合は空のレスポンスを返し、fetchを呼ばない', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const result = await favoritesFetcher()

    expect(result).toEqual({
      favorites: [],
      favoriteCount: 0,
      favoriteLimit: null,
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('レスポンスが失敗した場合はエラーをthrowする', async () => {
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

  it('成功時はAPIレスポンスをFavoritesResponse形式に整形して返す', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [MOCK_FAVORITE_1],
        meta: { favoriteCount: 1, favoriteLimit: 3 },
      }),
    })

    const result = await favoritesFetcher()

    expect(result).toEqual({
      favorites: [MOCK_FAVORITE_1],
      favoriteCount: 1,
      favoriteLimit: 3,
    })
  })

  it('meta情報が無い場合はdataの件数をfavoriteCountのフォールバックにする', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [MOCK_FAVORITE_1, MOCK_FAVORITE_2] }),
    })

    const result = await favoritesFetcher()

    expect(result.favoriteCount).toBe(2)
    expect(result.favoriteLimit).toBeNull()
  })
})

// ---- isFavorited のテスト ----
describe('isFavorited', () => {
  it('登録済みの園IDに対してtrueを返す', () => {
    const { result } = renderHook(() => useFavorites(true))

    expect(result.current.isFavorited(1)).toBe(true)
  })

  it('未登録の園IDに対してfalseを返す', () => {
    const { result } = renderHook(() => useFavorites(true))

    expect(result.current.isFavorited(999)).toBe(false)
  })
})

// ---- initializeFavorite のテスト ----
describe('initializeFavorite', () => {
  it('未ログインの場合は何もしない', () => {
    const { result } = renderHook(() => useFavorites(false))

    act(() => {
      result.current.initializeFavorite(999, true)
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('既にお気に入りに存在する場合は何もしない', () => {
    const { result } = renderHook(() => useFavorites(true))

    act(() => {
      // MOCK_FAVORITE_1のschool.idは既にfavoritesに存在する
      result.current.initializeFavorite(1, true)
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('未登録かつisFav=trueの場合、キャッシュに仮のお気に入りを追加する', () => {
    const { result } = renderHook(() => useFavorites(true))

    act(() => {
      result.current.initializeFavorite(999, true)
    })

    expect(mockMutate).toHaveBeenCalledOnce()
    const [updater, shouldRevalidate] = mockMutate.mock.calls[0]
    expect(shouldRevalidate).toBe(false)
    expect(updater.favoriteCount).toBe(3)
    expect(
      updater.favorites.some(
        (f: { school: { id: number } }) => f.school.id === 999
      )
    ).toBe(true)
  })

  it('未登録かつisFav=falseの場合は何もしない', () => {
    const { result } = renderHook(() => useFavorites(true))

    act(() => {
      result.current.initializeFavorite(999, false)
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })
})

// ---- addFavorite のテスト ----
describe('addFavorite', () => {
  it('お気に入り登録に成功した場合、mutate が呼ばれる', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    vi.mocked(addFavoriteApi).mockResolvedValue(undefined)

    // mutate に渡されたコールバックを実際に実行することでカバレッジを上げる
    mockMutate.mockImplementation(async (callback) => {
      if (typeof callback === 'function') await callback()
    })

    // favoritesFetcher が呼ばれるのでfetchもモックしておく
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { favoriteCount: 3, favoriteLimit: 5 },
      }),
    })
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })

    const { result } = renderHook(() => useFavorites(true))

    await act(async () => {
      await result.current.addFavorite(3)
    })

    expect(mockMutate).toHaveBeenCalledOnce()
    expect(addFavoriteApi).toHaveBeenCalledWith(3, 'dummy-token')
  })

  it('アクセストークンがない場合は何もしない', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { result } = renderHook(() => useFavorites(true))

    await act(async () => {
      await result.current.addFavorite(3)
    })

    expect(mockMutate).not.toHaveBeenCalled()
    expect(addFavoriteApi).not.toHaveBeenCalled()
  })
})

// ---- removeFavorite のテスト ----
describe('removeFavorite', () => {
  it('お気に入り解除に成功した場合、mutate が呼ばれる', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    vi.mocked(removeFavoriteApi).mockResolvedValue(undefined)

    // mutate に渡されたコールバックを実際に実行することでカバレッジを上げる
    mockMutate.mockImplementation(async (callback) => {
      if (typeof callback === 'function') await callback()
    })

    const { result } = renderHook(() => useFavorites(true))

    await act(async () => {
      await result.current.removeFavorite(1)
    })

    expect(mockMutate).toHaveBeenCalledOnce()
    expect(removeFavoriteApi).toHaveBeenCalledWith(1, 'dummy-token')
  })

  it('アクセストークンがない場合は何もしない', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const { result } = renderHook(() => useFavorites(true))

    await act(async () => {
      await result.current.removeFavorite(1)
    })

    expect(mockMutate).not.toHaveBeenCalled()
    expect(removeFavoriteApi).not.toHaveBeenCalled()
  })
})

describe('未ログイン時の挙動', () => {
  it('isLoggedIn=false の場合、SWR のキーが null になり favorites は空になる', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      mutate: mockMutate,
      error: undefined,
      isLoading: false,
    })

    const { result } = renderHook(() => useFavorites(false))

    expect(result.current.favorites).toEqual([])
    expect(result.current.favoriteCount).toBe(0)
    expect(result.current.favoriteLimit).toBeNull()
  })
})
