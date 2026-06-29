// プロフィール編集画面
// src/app/mypage/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/common/Toast'
import { User } from '@/types/user'
import ProfileForm from '@/components/mypage/ProfileForm'
import PreferenceForm from '@/components/mypage/PreferenceForm'

export default function MyPageEditPage() {
  const router = useRouter()
  const { supabaseUser, appUser, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !supabaseUser) {
      router.push('/login')
    }
  }, [authLoading, supabaseUser, router])

  if (authLoading || !appUser) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return <EditForm appUser={appUser} />
}

function EditForm({ appUser }: { appUser: User }) {
  const router = useRouter()
  const prefs = appUser.preference

  const [userName, setUserName] = useState(appUser.name ?? '')
  const [postalCode, setPostalCode] = useState(appUser.postalCode ?? '')
  const [address, setAddress] = useState(appUser.address ?? '')
  const [preferences, setPreferences] = useState({
    hasLunch: prefs?.preferredMealType === 'SCHOOL_LUNCH',
    diaperDisposal: !!prefs?.preferredDiaperSupport,
    noBedding: !!prefs?.preferredFutonSupport,
    extendedCare: !!prefs?.preferredExtendedCare,
    noWeekdayEvents: prefs?.preferredWeekdayEventsLevel === 'LOW',
    noPTA: prefs?.preferredParentAssociationLevel === 'LOW',
    hasClub: !!prefs?.preferredLessons,
    allergySupport: !!prefs?.preferredAllergySupport,
  })

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

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

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

  const handleSave = async () => {
    if (!validate()) return

    setIsLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return

      const token = data.session.access_token

      const prefsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/preferences`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferredMealType: preferences.hasLunch ? 'SCHOOL_LUNCH' : null,
            preferredDiaperSupport: preferences.diaperDisposal
              ? '園で廃棄'
              : null,
            preferredFutonSupport: preferences.noBedding ? '園で管理' : null,
            preferredExtendedCare: preferences.extendedCare ? '20人以上' : null,
            preferredWeekdayEventsLevel: preferences.noWeekdayEvents
              ? 'LOW'
              : null,
            preferredParentAssociationLevel: preferences.noPTA ? 'LOW' : null,
            preferredLessons: preferences.hasClub ? true : null,
            preferredAllergySupport: preferences.allergySupport ? true : null,
          }),
        }
      )

      if (!prefsRes.ok) {
        setToast({ message: '希望条件の保存に失敗しました', type: 'error' })
        return
      }

      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: userName, postalCode, address }),
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

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="pt-4 mb-4">
        <button
          onClick={() => router.push('/mypage')}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          ← 戻る
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-6">プロフィール編集</h1>

      <ProfileForm
        userName={userName}
        postalCode={postalCode}
        address={address}
        errors={errors}
        onChangeName={setUserName}
        onChangePostalCode={handlePostalCodeChange}
        onChangeAddress={setAddress}
      />

      <PreferenceForm {...preferences} onChange={handlePreferenceChange} />

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
