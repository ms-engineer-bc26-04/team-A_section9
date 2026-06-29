// 園詳細画面
// src/app/schools/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/common/Modal'
import { SchoolCardSkeleton } from '@/components/common/Skeleton'
import Toast from '@/components/common/Toast'
import { useFavorites } from '@/lib/hooks/useFavorites'
import SchoolDetailHeader from '@/components/school/SchoolDetailHeader'
import SchoolDetailSections from '@/components/school/SchoolDetailSections'
import SchoolContactForm from '@/components/school/SchoolContactForm'

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

      <SchoolDetailHeader
        id={school.id}
        name={school.name}
        address={school.address}
        phoneNumber={school.phoneNumber}
        imageUrl={school.imageUrl}
        schoolType={school.schoolType}
        tags={school.tags}
        isFavorited={favorited}
        isLoggedIn={isLoggedIn}
        onToggleFavorite={handleToggle}
        onVisit={() => router.push(`/schools/${id}/visit`)}
      />

      <div className="px-4">
        <SchoolDetailSections
          mealType={school.mealType}
          itemBurdenLevel={school.itemBurdenLevel}
          itemBurdenDetail={school.itemBurdenDetail}
          diaperSupport={school.diaperSupport}
          futonSupport={school.futonSupport}
          extendedCareHours={school.extendedCareHours}
          extendedCareUsage={school.extendedCareUsage}
          weekdayEventsLevel={school.weekdayEventsLevel}
          weekdayEvents={school.weekdayEvents}
          parentAssociationLevel={school.parentAssociationLevel}
          parentAssociationFrequency={school.parentAssociationFrequency}
          description={school.description}
          supportInfo={school.supportInfo}
          isLoggedIn={isLoggedIn}
          supabaseUser={!!supabaseUser}
          onShowRegisterModal={() => setShowRegisterModal(true)}
          onShowPremiumModal={() => setShowPremiumModal(true)}
        />

        <SchoolContactForm
          contactMessage={contactMessage}
          isSending={isSending}
          onChange={setContactMessage}
          onSubmit={handleContact}
        />
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
