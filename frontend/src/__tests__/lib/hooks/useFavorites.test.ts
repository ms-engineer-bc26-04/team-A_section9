// frontend/src/__tests__/lib/hooks/useFavorites.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '@/lib/hooks/useFavorites'
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
describe('addFavorite', () => {
  it('お気に入り登録に成功した場合、mutate が呼ばれる', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    vi.mocked(addFavoriteApi).mockResolvedValue(undefined)

    // mutate に渡されたコールバックを実際に実行することで158-159行をカバーする
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

describe('removeFavorite', () => {
  it('お気に入り解除に成功した場合、mutate が呼ばれる', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    vi.mocked(removeFavoriteApi).mockResolvedValue(undefined)

    // mutate に渡されたコールバックを実際に実行することで189-192行をカバーする
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
