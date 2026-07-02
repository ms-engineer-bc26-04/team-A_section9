// src/app/schools/[id]/visit/page.tsx
// 見学申し込み画面。見学希望日・時間を入力して申し込みができる（デモ用）

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Toast from '@/components/common/Toast'
import FavoriteButton from '@/components/school/FavoriteButton'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'

type VisitSchool = {
  id: number
  name: string
  address: string
  phoneNumber: string | null
  imageUrl: string | null
  tags?: string[]
  isFavorited: boolean
}

export default function VisitPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { addFavorite, removeFavorite } = useFavorites(isLoggedIn)

  const [school] = useState<VisitSchool | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = sessionStorage.getItem('visitSchool')
    return stored ? JSON.parse(stored) : null
  })
  const [favorited, setFavorited] = useState(school?.isFavorited ?? false)

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [time, setTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ]

  const handleToggleFavorite = async () => {
    if (!school) return
    try {
      if (favorited) {
        await removeFavorite(school.id)
        setFavorited(false)
        setToast({ message: 'お気に入りを解除しました', type: 'success' })
      } else {
        await addFavorite(school.id)
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
      } else {
        setToast({ message: 'エラーが発生しました', type: 'error' })
      }
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const handleSubmit = () => {
    if (!selectedDate) return
    setIsSubmitting(true)
    setTimeout(() => {
      setToast({ message: '申し込みを受け付けました', type: 'success' })
      setIsSubmitting(false)
      setTimeout(() => router.push(`/schools/${id}`), 1500)
    }, 500)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土']

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
          onClick={() => router.back()}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          ← 戻る
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-4">見学予約</h1>

      {/* 園情報カード */}
      <div className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 mb-6">
        <div className="relative w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {school?.imageUrl ? (
            <Image
              src={school.imageUrl}
              alt={school.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">{school?.name}</p>
          <p className="text-xs text-gray-500">{school?.address}</p>
          {school?.phoneNumber && (
            <p className="text-gray-500 text-xs">
              電話番号：{school.phoneNumber}
            </p>
          )}
          <div className="flex gap-1 mt-1">
            {(school?.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {school && (
          <FavoriteButton
            schoolId={school.id}
            isFavorited={favorited}
            isLoggedIn={isLoggedIn}
            onToggle={handleToggleFavorite}
          />
        )}
      </div>

      {/* カレンダー */}
      <div className="border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 font-medium mb-4">
          見学希望日を選択してください
        </p>

        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="text-gray-500 px-2 py-1">
            {'<'}
          </button>
          <p className="text-sm font-bold text-gray-800">
            {currentYear}年{monthNames[currentMonth]}
          </p>
          <button onClick={handleNextMonth} className="text-gray-500 px-2 py-1">
            {'>'}
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {dayLabels.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isSelected = selectedDate === day
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear()
            const isPast =
              new Date(currentYear, currentMonth, day) <
              new Date(today.getFullYear(), today.getMonth(), today.getDate())

            return (
              <button
                key={day}
                onClick={() => !isPast && setSelectedDate(day)}
                disabled={isPast}
                className={`text-center text-sm py-2 mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#F5A623] text-white font-bold'
                    : isToday
                      ? 'border border-[#A0CD83] text-[#A0CD83]'
                      : isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* 希望時間 */}
      <div className="mb-6">
        <label className="block text-sm text-gray-700 mb-1">
          希望時間の入力
        </label>
        <input
          type="text"
          placeholder="例）9:30"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        />
      </div>

      {/* 申し込みボタン */}
      <button
        onClick={handleSubmit}
        disabled={!selectedDate || isSubmitting}
        className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
      >
        {isSubmitting ? '送信中...' : '見学予約を申し込む'}
      </button>
    </div>
  )
}
