// src/app/mypage/edit/page.tsx
// プロフィール編集画面。ユーザー情報・住所・希望条件を編集する

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/common/Toast'

export default function MyPageEditPage() {
  const router = useRouter()
  const { supabaseUser, appUser, isLoading: authLoading } = useAuth()

  const prefs = appUser?.preference

  const [userName, setUserName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [hasLunch, setHasLunch] = useState(
    prefs?.preferredMealType === 'SCHOOL_LUNCH'
  )
  const [diaperDisposal, setDiaperDisposal] = useState(
    !!prefs?.preferredDiaperSupport
  )
  const [noBedding, setNoBedding] = useState(!!prefs?.preferredFutonSupport)
  const [extendedCare, setExtendedCare] = useState(
    !!prefs?.preferredExtendedCare
  )
  const [noWeekdayEvents, setNoWeekdayEvents] = useState(
    prefs?.preferredWeekdayEventsLevel === 'LOW'
  )
  const [noPTA, setNoPTA] = useState(
    prefs?.preferredParentAssociationLevel === 'LOW'
  )
  const [hasClub, setHasClub] = useState(false)
  const [allergySupport, setAllergySupport] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    userName?: string
    postalCode?: string
    address?: string
  }>({})
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

  // 郵便番号から住所を自動入力
  const handlePostalCodeChange = async (value: string) => {
    setPostalCode(value)
    if (value.length === 7) {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) return

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/address/search?zipcode=${value}`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          }
        )
        if (!res.ok) return
        const { data } = await res.json()
        setAddress(data.address)
      } catch {
        // 自動入力失敗時は何もしない
      }
    }
  }

  // バリデーション
  const validate = () => {
    const newErrors: typeof errors = {}
    if (!userName) newErrors.userName = 'お名前を入力してください'
    if (!postalCode) {
      newErrors.postalCode = '郵便番号を入力してください'
    } else if (!/^\d{7}$/.test(postalCode)) {
      newErrors.postalCode = '郵便番号は半角数字7桁で入力してください'
    }
    if (!address) newErrors.address = '住所を入力してください'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存
  const handleSave = async () => {
    if (!validate()) return

    setIsLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return

      const token = data.session.access_token

      // 希望条件を保存
      const prefsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/preferences`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferredMealType: hasLunch ? 'SCHOOL_LUNCH' : null,
            preferredDiaperSupport: diaperDisposal ? '園で廃棄' : null,
            preferredFutonSupport: noBedding ? '園で管理' : null,
            preferredExtendedCare: extendedCare ? '20人以上' : null,
            preferredWeekdayEventsLevel: noWeekdayEvents ? 'LOW' : null,
            preferredParentAssociationLevel: noPTA ? 'LOW' : null,
            preferredLessons: hasClub ? true : null, // ← 追加
            preferredAllergySupport: allergySupport ? true : null, // ← 追加
          }),
        }
      )

      if (!prefsRes.ok) {
        setToast({ message: '希望条件の保存に失敗しました', type: 'error' })
        return
      }

      // お名前・郵便番号・住所を保存
      // ※のっちさんのAPIが確定したらURLとmethodを修正する
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userName,
            postalCode,
            address,
          }),
        }
      )

      if (!profileRes.ok) {
        setToast({ message: 'プロフィールの保存に失敗しました', type: 'error' })
        return
      }

      setToast({ message: '保存しました', type: 'success' })
    } catch {
      setToast({ message: 'エラーが発生しました', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
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

      {/* 戻るボタン */}
      <div className="pt-4 mb-4">
        <button
          onClick={() => router.push('/mypage')}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          ← 戻る
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-6">プロフィール編集</h1>

      {/* お名前 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前
          <span className="text-red-500 text-xs ml-1">※必須</span>
        </label>
        <input
          type="text"
          placeholder="例) 園活 みずえ"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        />
        {errors.userName && (
          <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
        )}
      </div>

      {/* お住いのエリア */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お住いのエリア
          <span className="text-red-500 text-xs ml-1">※必須</span>
        </label>
        <input
          type="text"
          placeholder="郵便番号："
          value={postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          maxLength={7}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-2"
        />
        {errors.postalCode && (
          <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
        )}
        <input
          type="text"
          placeholder="住所"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      {/* 希望条件 */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">希望条件</h2>

        {/* 生活負担 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
            生活負担
          </h3>
          <div className="flex flex-col gap-3">
            <CheckItem
              label="毎日給食"
              checked={hasLunch}
              onChange={setHasLunch}
            />
            <CheckItem
              label="おむつ園処理あり"
              checked={diaperDisposal}
              onChange={setDiaperDisposal}
            />
            <CheckItem
              label="布団負担少なめ"
              checked={noBedding}
              onChange={setNoBedding}
            />
          </div>
        </div>

        {/* 時間負担 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
            時間負担
          </h3>
          <div className="flex flex-col gap-3">
            <CheckItem
              label="延長保育利用者が多い"
              checked={extendedCare}
              onChange={setExtendedCare}
            />
            <CheckItem
              label="平日行事少なめ"
              checked={noWeekdayEvents}
              onChange={setNoWeekdayEvents}
            />
            <CheckItem
              label="保護者会少なめ"
              checked={noPTA}
              onChange={setNoPTA}
            />
          </div>
        </div>

        {/* 補助情報 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
            補助情報
          </h3>
          <div className="flex flex-col gap-3">
            <CheckItem
              label="園内習い事あり"
              checked={hasClub}
              onChange={setHasClub}
            />
            <CheckItem
              label="アレルギー対応あり"
              checked={allergySupport}
              onChange={setAllergySupport}
            />
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
      >
        {isLoading ? '保存中...' : '保存'}
      </button>
    </div>
  )
}

// チェックボックスアイテム
function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#A0CD83]"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  )
}
