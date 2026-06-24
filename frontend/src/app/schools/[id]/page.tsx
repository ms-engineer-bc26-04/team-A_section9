// src/app/schools/[id]/page.tsx
// 園詳細画面。生活負担・時間負担・サポート情報・お気に入りを表示する
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/common/Modal'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import Toast from '@/components/common/Toast'
import { useFavorites } from '@/lib/hooks/useFavorites'

type SupportInfo = {
  isLocked: boolean
  contactBookType: string | null
  absenceContactMethod: string | null
  lessons: string | null
  allergySupport: string | null
}

type SchoolDetail = {
  id: string
  name: string
  area: string
  address: string
  phoneNumber: string | null
  imageUrl: string | null
  schoolType: string
  description: string | null
  lifeBurdenLevel: string
  mealType: string
  itemBurdenLevel: string
  diaperSupport: string | null
  futonSupport: string | null
  timeBurdenLevel: string
  extendedCareHours: string | null
  extendedCareUsage: string
  weekdayEventsLevel: string
  parentAssociationLevel: string
  tags: string[]
  supportInfo: SupportInfo
  isFavorited: boolean
}

const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  LUNCH_BOX: '弁当あり',
  MIXED: '給食・弁当併用',
  BOTH: '給食・弁当併用',
}

const burdenLabel: Record<string, string> = {
  LOW: '少ない',
  MIDDLE: '普通',
  MEDIUM: '普通',
  HIGH: '多い',
}

const schoolTypeLabel: Record<string, string> = {
  NURSERY: '保育園',
  CERTIFIED_CHILDCARE_CENTER: '認定こども園',
  SMALL_SCALE_NURSERY: '小規模保育',
}

const contactBookLabel: Record<string, string> = {
  APP: 'アプリ',
  PAPER: '手書き',
  BOTH: 'アプリ・手書き併用',
}

const absenceContactLabel: Record<string, string> = {
  APP: 'アプリ',
  PHONE: '電話',
  BOTH: 'アプリ・電話',
}

export default function SchoolDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { supabaseUser, isLoggedIn, isLoading: authLoading } = useAuth()

  const [school, setSchool] = useState<SchoolDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const { isFavorited, addFavorite, removeFavorite, initializeFavorite } =
    useFavorites(isLoggedIn)
  const schoolId = Number(id)
  const currentlyFavorited = isFavorited(schoolId)

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const headers: Record<string, string> = {}

        if (supabaseUser) {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            headers['Authorization'] = `Bearer ${data.session.access_token}`
          }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schools/${id}`,
          { headers }
        )

        if (res.status === 404) {
          router.push('/not-found')
          return
        }

        if (!res.ok) {
          setError('データの取得に失敗しました')
          return
        }

        const { data } = await res.json()
        setSchool(data)
        initializeFavorite(Number(id), data.isFavorited) // 追加
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchSchool()
    }
  }, [id, supabaseUser, authLoading, router, initializeFavorite])

  const handleFavorite = async () => {
    if (!supabaseUser) {
      setShowLoginModal(true)
      return
    }

    setFavoriteLoading(true)

    try {
      if (currentlyFavorited) {
        await removeFavorite(schoolId)
        setToast({ message: 'お気に入りを解除しました', type: 'success' })
      } else {
        await addFavorite(schoolId)
        setToast({ message: 'お気に入りに追加しました', type: 'success' })
      }
    } catch (e: unknown) {
      const code = e instanceof Error ? e.message : ''
      if (code === 'FAVORITE_LIMIT_EXCEEDED') {
        setToast({
          message: 'お気に入りは5件まで。プレミアムで無制限に',
          type: 'warning',
        })
        setTimeout(() => router.push('/plans'), 2000)
      } else if (code === 'ALREADY_FAVORITED') {
        // 追加
        setToast({ message: 'すでにお気に入り登録済みです', type: 'warning' })
      } else {
        setToast({ message: 'エラーが発生しました', type: 'error' })
      }
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <SchoolCardSkeleton />
        <SchoolCardSkeleton />
        <SchoolCardSkeleton />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || 'データが見つかりませんでした'}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          ← 戻る
        </button>
      </div>

      <div className="w-full h-48 bg-gray-100 overflow-hidden relative mt-2">
        {school.imageUrl ? (
          <Image
            src={school.imageUrl}
            alt={school.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{school.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{school.address}</p>
            {school.phoneNumber && (
              <p className="text-sm text-gray-500">
                電話番号：{school.phoneNumber}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {schoolTypeLabel[school.schoolType] ?? school.schoolType}
            </p>
            {school.tags && school.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {school.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full font-normal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* お気に入りボタン */}
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className="p-2 flex-shrink-0"
            aria-label={
              currentlyFavorited ? 'お気に入り解除' : 'お気に入り登録'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={currentlyFavorited ? '#FFCFCF' : 'none'}
              stroke={currentlyFavorited ? '#FFCFCF' : '#ccc'}
              strokeWidth={2}
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        <section className="mt-6">
          <h2 className="font-bold text-base text-gray-700 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
            <Image
              src="/images/icon5.png"
              alt="毎日の準備"
              width={24}
              height={24}
            />
            毎日の準備
          </h2>
          <div className="flex flex-col gap-2">
            <DetailRow
              label="給食・弁当"
              value={mealTypeLabel[school.mealType] ?? school.mealType}
            />
            <DetailRow label="持ち物" value={school.itemBurdenLevel} />
            {school.diaperSupport && (
              <DetailRow label="おむつ対応" value={school.diaperSupport} />
            )}
            {school.futonSupport && (
              <DetailRow label="布団対応" value={school.futonSupport} />
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-bold text-base text-gray-700 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
            <Image
              src="/images/icon6.png"
              alt="仕事との両立"
              width={24}
              height={24}
            />
            仕事との両立
          </h2>
          <div className="flex flex-col gap-2">
            {school.extendedCareHours && (
              <DetailRow
                label="延長保育の時間"
                value={school.extendedCareHours}
              />
            )}
            <DetailRow
              label="延長保育利用者"
              value={school.extendedCareUsage}
            />
            <DetailRow
              label="平日行事"
              value={
                burdenLabel[school.weekdayEventsLevel] ??
                school.weekdayEventsLevel
              }
            />
            <DetailRow
              label="保護者会"
              value={
                burdenLabel[school.parentAssociationLevel] ??
                school.parentAssociationLevel
              }
            />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-bold text-base text-gray-700 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
            <Image
              src="/images/icon7.png"
              alt="サポート情報"
              width={24}
              height={24}
            />
            サポート情報
          </h2>

          {school.supportInfo.isLocked ? (
            <div className="relative">
              <div className="flex flex-col gap-2 select-none">
                {['連絡帳', '欠席連絡方法', '園内習い事', 'アレルギー対応'].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex justify-between items-center py-1 border-b border-gray-100"
                    >
                      <span className="text-sm text-gray-500">{item}</span>
                      <span className="text-sm text-gray-200 blur-sm">
                        ▓▓▓▓▓▓
                      </span>
                    </div>
                  )
                )}
              </div>
              <button
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-lg"
                onClick={() => {
                  if (!supabaseUser) {
                    setShowRegisterModal(true)
                  } else {
                    setShowPremiumModal(true)
                  }
                }}
              >
                <Image
                  src="/images/icon19.png"
                  alt="ロック"
                  width={40}
                  height={40}
                  className="mb-2"
                />
                <span className="text-sm font-bold text-gray-600 text-center">
                  プレミアムユーザーに
                  <br />
                  登録すれば閲覧可能
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {school.supportInfo.contactBookType && (
                <DetailRow
                  label="連絡帳"
                  value={
                    contactBookLabel[school.supportInfo.contactBookType] ??
                    school.supportInfo.contactBookType
                  }
                />
              )}
              {school.supportInfo.absenceContactMethod && (
                <DetailRow
                  label="欠席連絡方法"
                  value={
                    absenceContactLabel[
                      school.supportInfo.absenceContactMethod
                    ] ?? school.supportInfo.absenceContactMethod
                  }
                />
              )}
              {school.supportInfo.lessons && (
                <DetailRow
                  label="園内習い事"
                  value={school.supportInfo.lessons}
                />
              )}
              {school.supportInfo.allergySupport && (
                <DetailRow
                  label="アレルギー対応"
                  value={school.supportInfo.allergySupport}
                />
              )}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="font-bold text-base text-gray-700 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
            <Image
              src="/images/icon8.png"
              alt="園の特徴"
              width={24}
              height={24}
            />
            園の特徴
          </h2>
          {school.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">
              {school.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400">情報がありません</p>
          )}
        </section>
      </div>

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="ログインが必要です"
      >
        <p className="text-sm text-gray-600 text-center mb-4">
          お気に入り登録にはログインが必要です
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-primary text-white rounded-full py-3 font-bold text-sm"
        >
          ログインする
        </button>
      </Modal>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="会員登録が必要です"
      >
        <p className="text-sm text-gray-600 text-center mb-4">
          サポート情報の閲覧には会員登録が必要です
        </p>
        <button
          onClick={() => router.push('/register')}
          className="w-full bg-primary text-white rounded-full py-3 font-bold text-sm"
        >
          会員登録する
        </button>
      </Modal>

      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="プレミアム会員限定です"
      >
        <p className="text-sm text-gray-600 text-center mb-4">
          サポート情報の閲覧はプレミアム会員限定です
        </p>
        <button
          onClick={() => router.push('/plans')}
          className="w-full bg-primary text-white rounded-full py-3 font-bold text-sm"
        >
          プランを見る
        </button>
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}
