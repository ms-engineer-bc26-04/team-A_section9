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
import FavoriteButton from '@/components/school/FavoriteButton'

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
  itemBurdenDetail: string | null
  diaperSupport: string | null
  futonSupport: string | null
  timeBurdenLevel: string
  extendedCareHours: string | null
  extendedCareUsage: string
  weekdayEventsLevel: string
  weekdayEvents: string | null
  parentAssociationLevel: string
  parentAssociationFrequency: string | null
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
  const [favorited, setFavorited] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const { addFavorite, removeFavorite } = useFavorites(isLoggedIn)
  const schoolId = Number(id)

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
        setFavorited(data.isFavorited)
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchSchool()
    }
  }, [id, supabaseUser, authLoading, router])

  const handleToggle = async (schoolId: number) => {
    try {
      if (favorited) {
        await removeFavorite(schoolId)
        setFavorited(false)
        setToast({ message: 'お気に入りを解除しました', type: 'success' })
      } else {
        await addFavorite(schoolId)
        setFavorited(true)
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
      } else {
        setToast({ message: 'エラーが発生しました', type: 'error' })
      }
    }
  }

  const handleContact = () => {
    if (!contactMessage.trim()) return
    setIsSending(true)
    setTimeout(() => {
      setToast({ message: 'お問い合わせを受け付けました', type: 'success' })
      setContactMessage('')
      setIsSending(false)
    }, 500)
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

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/schools/${id}/visit`)}
              className="bg-[#F5A623] text-white text-sm font-bold px-4 py-2 rounded-full"
            >
              見学申込み
            </button>
            <FavoriteButton
              schoolId={schoolId}
              isFavorited={favorited}
              isLoggedIn={isLoggedIn}
              onToggle={handleToggle}
            />
          </div>
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
            <DetailRow
              label="持ち物"
              value={
                school.itemBurdenDetail ??
                burdenLabel[school.itemBurdenLevel] ??
                school.itemBurdenLevel
              }
            />
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
                school.weekdayEvents ??
                burdenLabel[school.weekdayEventsLevel] ??
                school.weekdayEventsLevel
              }
            />
            <DetailRow
              label="保護者会"
              value={
                school.parentAssociationFrequency ??
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
                  src="/images/icon9.png"
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

        <section className="mt-6 bg-[#F5F5F0] rounded-xl p-4">
          <h2 className="font-bold text-base text-gray-800 mb-1">
            園へのお問い合わせ
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            見学の事や入園に関するご質問など、お気軽にお問い合わせください
          </p>
          <label className="block text-sm text-gray-600 mb-1">
            お問い合わせ内容
          </label>
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder=""
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none mb-3"
          />
          <button
            onClick={handleContact}
            disabled={isSending || !contactMessage.trim()}
            className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
          >
            {isSending ? '送信中...' : '送信する'}
          </button>
        </section>
      </div>

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
