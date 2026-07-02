// src/app/plans/page.tsx
// プラン・料金画面。会員でない方・一般ユーザー・プレミアムユーザーの機能を比較表示する

'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import Toast from '@/components/common/Toast'
import {
  PlanItem,
  FREE_FEATURES,
  PREMIUM_FEATURES,
} from '@/components/mypage/PlanFeatureList'

export default function PlansPage() {
  const router = useRouter()
  const { supabaseUser, appUser, isLoading: authLoading } = useAuth()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isPortaling, setIsPortaling] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const isPremium = appUser?.subscriptionStatus === 'ACTIVE'
  const isLoggedIn = !!supabaseUser

  // Stripe Checkout（プレミアム登録）
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push('/register')
      return
    }

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

  // Stripe Customer Portal（一般プランへの変更・解約）
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
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* タイトル */}
      <h1 className="text-xl font-bold text-gray-800 text-center pt-6 mb-10">
        プラン・料金
      </h1>

      {!isPremium && (
        <>
          {/* 会員でない方 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              会員でない方でも下記機能が使えます
            </p>
            <div className="flex flex-col gap-3">
              <PlanItem icon="icon11.png" text="園の検索" />
              <PlanItem icon="icon15.png" text="園の詳細情報閲覧" />
            </div>
          </div>

          <hr className="mb-6" />

          {/* 一般ユーザー */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              会員ユーザーになると下記機能が解禁！
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <PlanItem icon="icon12.png" text="2つの園を同時比較" />
              <PlanItem icon="icon13.png" text="5件までお気に入り機能の追加" />
              <PlanItem icon="icon14.png" text="マイページから希望条件の登録" />
            </div>
            <button
              onClick={() => router.push('/register')}
              disabled={isLoggedIn}
              className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
            >
              新規会員登録はこちら
            </button>
            <p className="text-center text-xs text-gray-400 mt-1">※無料です</p>
          </div>

          <hr className="mb-6" />
        </>
      )}

      {/* プレミアムユーザー：現在のプラン or 誘導 */}
      {isPremium ? (
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-2 text-center">
            一般プラン
          </p>
          <p className="text-xs text-gray-400 mb-3 text-center">
            下記の機能に変更になります
          </p>
          <div className="flex flex-col gap-3 mb-4">
            {FREE_FEATURES.map((f) => (
              <PlanItem key={f.text} icon={f.icon} text={f.text} />
            ))}
          </div>
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">※無料です</span>
          </div>
          <button
            onClick={handlePortal}
            disabled={isPortaling}
            className="w-full border border-[#A0CD83] rounded-full py-3 text-sm text-[#A0CD83] font-bold disabled:opacity-50"
          >
            {isPortaling ? '移動中...' : '変更する'}
          </button>

          <hr className="my-6" />

          <div className="bg-[#FFF8EC] rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Image
                src="/images/icon21.png"
                alt="プレミアム"
                width={24}
                height={24}
              />
              <p className="text-sm font-bold text-gray-700 text-center">
                プレミアムユーザー
              </p>
            </div>
            <p className="text-xs text-gray-400 mb-3 text-center">
              現在登録プラン
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {PREMIUM_FEATURES.map((f) => (
                <PlanItem key={f.text} icon={f.icon} text={f.text} />
              ))}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">月額</span>
              <span className="text-3xl font-bold text-gray-800 mx-1">500</span>
              <span className="text-sm text-gray-500">円（税込み）</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF8EC] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/images/icon21.png"
              alt="プレミアム"
              width={24}
              height={24}
            />
            <p className="text-sm font-bold text-gray-700 text-center">
              プレミアムユーザーになると
              <br />
              もっと便利に！
            </p>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {PREMIUM_FEATURES.map((f) => (
              <PlanItem key={f.text} icon={f.icon} text={f.text} />
            ))}
          </div>
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">月額</span>
            <span className="text-3xl font-bold text-gray-800 mx-1">500</span>
            <span className="text-sm text-gray-500">円（税込み）</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-[#F5A623] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
          >
            {isCheckingOut ? '移動中...' : 'プレミアム会員に登録する'}
          </button>
        </div>
      )}
    </div>
  )
}
