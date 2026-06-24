// src/app/mypage/page.tsx
// マイページ。会員情報・プラン・プレミアム誘導を表示する

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/common/Toast'

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

  // 未ログインの場合は /login へ
  useEffect(() => {
    if (!authLoading && !supabaseUser) {
      router.push('/login')
    }
  }, [authLoading, supabaseUser, router])

  // ログアウト
  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  // Stripe Checkout（プレミアム登録）
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

  // Stripe Customer Portal（プラン変更）
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
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!supabaseUser || !appUser) return null

  const isPremium = appUser.isPremium ?? false

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ヘッダー */}
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

      {/* ユーザー情報カード */}
      <div className="bg-[#A0CD83] rounded-xl p-4 flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <Image
            src="/images/icon14.png"
            alt="アバター"
            width={48}
            height={48}
          />
        </div>
        <div>
          <p className="text-white font-bold text-lg">
            {appUser.name ?? 'ゲスト'}さん
          </p>
          <p className="text-white/80 text-sm">
            {isPremium ? 'プレミアムユーザー' : '会員ユーザー'}
          </p>
        </div>
      </div>

      {/* 導線リスト */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => router.push('/mypage/edit')}
          className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/icon14.png"
              alt="プロフィール"
              width={24}
              height={24}
            />
            <span className="text-sm text-gray-700">プロフィール編集</span>
          </div>
          <span className="text-gray-400">{'>'}</span>
        </button>
        <button
          onClick={() => router.push('/mypage/favorites')}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/icon13.png"
              alt="お気に入り"
              width={24}
              height={24}
            />
            <span className="text-sm text-gray-700">お気に入り一覧</span>
          </div>
          <span className="text-gray-400">{'>'}</span>
        </button>
      </div>

      {/* 現在のプランでできること */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-medium mb-3">
          現在のプランでできること
        </p>
        {isPremium ? (
          <div className="flex flex-col gap-2">
            <PlanItem icon="icon16.png" text="3つの園を同時比較" />
            <PlanItem icon="icon17.png" text="お気に入りを無制限に保存" />
            <PlanItem icon="icon18.png" text="サポート情報を閲覧可能" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <PlanItem icon="icon12.png" text="2つの園を同時比較" />
            <PlanItem icon="icon13.png" text="5件までお気に入り機能の追加" />
            <PlanItem icon="icon14.png" text="マイページから希望条件の登録" />
          </div>
        )}
      </div>

      {/* プレミアム誘導 or 一般プランへの変更 */}
      {isPremium ? (
        <div className="mb-6">
          <hr className="mb-4" />
          <p className="text-sm text-gray-600 font-medium mb-2">
            一般プランに変更する
          </p>
          <p className="text-xs text-gray-400 mb-3">
            下記の機能に変更になります
          </p>
          <div className="flex flex-col gap-2 mb-4">
            <PlanItem icon="icon12.png" text="2つの園を同時比較" />
            <PlanItem icon="icon13.png" text="5件までお気に入り機能の追加" />
            <PlanItem icon="icon14.png" text="マイページから希望条件の登録" />
          </div>
          <button
            onClick={handlePortal}
            disabled={isPortaling}
            className="w-full border border-gray-300 rounded-full py-3 text-sm text-gray-600 font-bold disabled:opacity-50"
          >
            {isPortaling ? '移動中...' : '変更する'}
          </button>
        </div>
      ) : (
        <div className="bg-[#FFF8EC] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
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
          <div className="flex flex-col gap-2 mb-4">
            <PlanItem icon="icon16.png" text="3つの園を同時比較" />
            <PlanItem icon="icon17.png" text="お気に入りを無制限に保存" />
            <PlanItem icon="icon18.png" text="サポート情報を閲覧可能" />
          </div>
          <div className="text-center mb-3">
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

// プランアイテムコンポーネント
function PlanItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={`/images/${icon}`} alt="" width={24} height={24} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}
