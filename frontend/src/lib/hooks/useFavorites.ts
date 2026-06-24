//お気に入り状態を管理するカスタムフック
// src/lib/hooks/useFavorites.ts
import useSWR from 'swr'
import { useCallback } from 'react'
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

const favoritesFetcher = async (): Promise<FavoriteSchool[]> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) return []

  const res = await fetch(`${API_URL}/api/v1/users/me/favorites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('お気に入りの取得に失敗しました')

  const json = await res.json()
  return json.data
}

export function useFavorites(isLoggedIn: boolean) {
  const {
    data: favorites = [],
    mutate,
    error,
  } = useSWR<FavoriteSchool[]>(
    isLoggedIn ? 'favorites' : null,
    favoritesFetcher
  )

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
          [
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
          false
        )
      }
    },
    [isLoggedIn, favorites, mutate]
  )

  const addFavorite = async (schoolId: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return

    const optimisticData: FavoriteSchool[] = [
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
        optimisticData,
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

    const optimisticData: FavoriteSchool[] = favorites.filter(
      (f: FavoriteSchool) => f.school.id !== schoolId
    )

    await mutate(
      async () => {
        await removeFavoriteApi(schoolId, accessToken)
        return optimisticData
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: false,
      }
    )
  }

  return {
    favorites,
    isFavorited,
    initializeFavorite,
    addFavorite,
    removeFavorite,
    isLoading: !error && !favorites,
    error,
  }
}
