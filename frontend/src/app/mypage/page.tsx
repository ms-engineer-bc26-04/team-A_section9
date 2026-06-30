// マイページ
// src/app/mypage/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/common/Toast'
import MyPageHeader from '@/components/mypage/MyPageHeader'
import MyPageNav from '@/components/mypage/MyPageNav'
import PlanFeatureList from '@/components/mypage/PlanFeatureList'
import PremiumSection from '@/components/mypage/PremiumSection'
import { MyPageSkeleton } from '@/components/common/Skeleton'

export default function MyPage() {
  const router = useRouter()
  const { supabaseUser, appUser, isLoading: authLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isPortaling, setIsPortaling] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !supabaseUser) {
      router.push('/login')
    }
  }, [authLoading, supabaseUser, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/checkout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: 'premium_monthly' }),
        }
      )

      if (!res.ok) {
        setToast({ message: '決済の開始に失敗しました', type: 'error' })
        return
      }

      const body = await res.json()
      window.location.href = body.data.checkoutUrl
    } catch {
      setToast({ message: 'エラーが発生しました', type: 'error' })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handlePortal = async () => {
    setIsPortaling(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/customer-portal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }
      )

      if (!res.ok) {
        setToast({ message: 'ポータルの開始に失敗しました', type: 'error' })
        return
      }

      const body = await res.json()
      window.location.href = body.data.portalUrl
    } catch {
      setToast({ message: 'エラーが発生しました', type: 'error' })
    } finally {
      setIsPortaling(false)
    }
  }

  if (authLoading) {
    return <MyPageSkeleton />
  }

  if (!supabaseUser || !appUser) return null

  const isPremium = appUser.subscriptionStatus === 'ACTIVE'

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between pt-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800">マイページ</h1>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600 disabled:opacity-50"
        >
          {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </div>

      <MyPageHeader
        name={appUser.name}
        email={appUser.email}
        isPremium={isPremium}
      />

      <MyPageNav
        isPremium={isPremium}
        onEditProfile={() => router.push('/mypage/edit')}
        onFavorites={() => router.push('/mypage/favorites')}
      />

      <PlanFeatureList isPremium={isPremium} />

      <PremiumSection
        isPremium={isPremium}
        isCheckingOut={isCheckingOut}
        isPortaling={isPortaling}
        onCheckout={handleCheckout}
        onPortal={handlePortal}
      />
    </div>
  )
}
