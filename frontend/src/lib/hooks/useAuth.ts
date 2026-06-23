// 認証状態管理カスタムフック
// ログイン状態・ユーザー情報の取得・会員区分の管理を行う

import { useEffect, useState, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/user'

type AuthState = {
  supabaseUser: SupabaseUser | null // Supabase Auth のユーザー
  appUser: User | null // アプリ側のユーザー情報
  isLoading: boolean // 読み込み中かどうか
  isLoggedIn: boolean // ログイン済みかどうか
}

export const useAuth = (): AuthState => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [appUser, setAppUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // バックエンドからアプリ側ユーザー情報を取得する
  const fetchAppUser = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!res.ok) return

      const { data } = await res.json()
      setAppUser(data)
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました', error)
    }
  }, [])

  useEffect(() => {
    // 現在のログイン状態を取得する
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSupabaseUser(session?.user ?? null)

      if (session?.user) {
        await fetchAppUser(session.access_token)
      }
      setIsLoading(false)
    }

    getSession()

    // ログイン状態の変更を検知する
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null)

      if (session?.user) {
        await fetchAppUser(session.access_token)
      } else {
        setAppUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAppUser])

  return {
    supabaseUser,
    appUser,
    isLoading,
    isLoggedIn: !!supabaseUser,
  }
}
