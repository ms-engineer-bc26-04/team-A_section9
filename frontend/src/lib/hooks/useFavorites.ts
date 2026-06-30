//お気に入り状態を管理するカスタムフック
// src/lib/hooks/useFavorites.ts
import useSWR from 'swr'
import { useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from '@/lib/api/favorites'

type FavoriteSchool = {
  id: number
  school: {
    id: number
    name: string
    area: string
    address: string
    phoneNumber: string | null
    imageUrl: string | null
    schoolType: string
    tags?: string[]
  }
  createdAt: string
}

// 修正: APIが返すお気に入り一覧・件数・上限をまとめて扱う型を追加
type FavoritesResponse = {
  favorites: FavoriteSchool[]
  favoriteCount: number
  favoriteLimit: number | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 修正: 未ログイン時やトークンがない場合も同じ形式で返すための初期値
const emptyFavoritesResponse: FavoritesResponse = {
  favorites: [],
  favoriteCount: 0,
  favoriteLimit: null,
}

// 修正: 返り値を FavoriteSchool[] から FavoritesResponse に変更
const favoritesFetcher = async (): Promise<FavoritesResponse> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.access_token

  if (!accessToken) {
    return emptyFavoritesResponse
  }

  const res = await fetch(`${API_URL}/api/v1/users/me/favorites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error('お気に入りの取得に失敗しました')
  }

  const json = await res.json()

  // 修正: APIレスポンスは data 配下に一覧、meta 配下に件数・上限が入る形式
  // （API設計書 11-1 お気に入り一覧取得 のレスポンス形式に合わせる）
  return {
    favorites: json.data ?? [],
    favoriteCount: json.meta?.favoriteCount ?? json.data?.length ?? 0,
    favoriteLimit: json.meta?.favoriteLimit ?? null,
  }
}

export function useFavorites(isLoggedIn: boolean) {
  // 修正: useSWRの型を FavoritesResponse に変更
  const { data, mutate, error, isLoading } = useSWR<FavoritesResponse>(
    isLoggedIn ? 'favorites' : null,
    favoritesFetcher
  )

  // 修正: dataからお気に入り一覧・件数・上限を取り出す
  // 修正: 空配列が毎回新規作成されることによるlint warningを防ぐためuseMemoを使用
  const favorites = useMemo(() => data?.favorites ?? [], [data?.favorites])
  const favoriteCount = data?.favoriteCount ?? favorites.length
  const favoriteLimit = data?.favoriteLimit ?? null

  const isFavorited = (schoolId: number): boolean => {
    return favorites.some((f: FavoriteSchool) => f.school.id === schoolId)
  }

  const initializeFavorite = useCallback(
    (schoolId: number, isFav: boolean) => {
      if (!isLoggedIn) return

      const exists = favorites.some(
        (f: FavoriteSchool) => f.school.id === schoolId
      )

      if (exists) return

      if (isFav) {
        mutate(
          {
            favorites: [
              ...favorites,
              {
                id: Date.now(),
                school: {
                  id: schoolId,
                  name: '',
                  area: '',
                  address: '',
                  phoneNumber: null,
                  imageUrl: null,
                  schoolType: '',
                },
                createdAt: new Date().toISOString(),
              },
            ],
            favoriteCount: favoriteCount + 1,
            favoriteLimit,
          },
          false
        )
      }
    },
    [isLoggedIn, favorites, favoriteCount, favoriteLimit, mutate]
  )

  const addFavorite = async (schoolId: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token

    if (!accessToken) return

    const optimisticFavorites: FavoriteSchool[] = [
      ...favorites,
      {
        id: Date.now(),
        school: {
          id: schoolId,
          name: '',
          area: '',
          address: '',
          phoneNumber: null,
          imageUrl: null,
          schoolType: '',
        },
        createdAt: new Date().toISOString(),
      },
    ]

    await mutate(
      async () => {
        await addFavoriteApi(schoolId, accessToken)
        return favoritesFetcher()
      },
      {
        // 修正: optimisticDataもFavoritesResponse形式に変更
        optimisticData: {
          favorites: optimisticFavorites,
          favoriteCount: favoriteCount + 1,
          favoriteLimit,
        },
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  const removeFavorite = async (schoolId: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token

    if (!accessToken) return

    const optimisticFavorites: FavoriteSchool[] = favorites.filter(
      (f: FavoriteSchool) => f.school.id !== schoolId
    )

    await mutate(
      async () => {
        await removeFavoriteApi(schoolId, accessToken)

        // 修正: 削除後もFavoritesResponse形式で返す
        return {
          favorites: optimisticFavorites,
          favoriteCount: optimisticFavorites.length,
          favoriteLimit,
        }
      },
      {
        // 修正: optimisticDataもFavoritesResponse形式に変更
        optimisticData: {
          favorites: optimisticFavorites,
          favoriteCount: optimisticFavorites.length,
          favoriteLimit,
        },
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  return {
    favorites,
    // 修正: 呼び出し元でAPI由来の件数・上限を使えるように返す
    favoriteCount,
    favoriteLimit,
    isFavorited,
    initializeFavorite,
    addFavorite,
    removeFavorite,
    // 修正: SWRのisLoadingをそのまま返す
    isLoading,
    error,
  }
}
