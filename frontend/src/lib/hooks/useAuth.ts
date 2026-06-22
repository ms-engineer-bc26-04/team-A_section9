// src/lib/hooks/useAuth.ts
//ログイン状態を管理するカスタムフック。「今誰がログインしているか」をどの画面からでも取得できる
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User as AppUser } from '@/types/user'
import { User as SupabaseUser } from '@supabase/supabase-js'

type AuthState = {
  supabaseUser: SupabaseUser | null
  appUser: AppUser | null
  isLoading: boolean
  isPremium: boolean
}

export function useAuth(): AuthState {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初回セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      setIsLoading(false)
    })

    // ログイン状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null)
        if (!session) setAppUser(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    supabaseUser,
    appUser,
    isLoading,
    isPremium: appUser?.isPremium ?? false,
  }
}