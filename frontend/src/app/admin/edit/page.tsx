// 園詳細情報編集画面
// src/app/admin/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminHeader from '@/components/admin/AdminHeader'
import Toast from '@/components/common/Toast'

import { supabase } from '@/lib/supabase'
import {
  getSchoolAdminSchool,
  updateSchoolAdminSchool,
} from '@/lib/api/schoolAdmin'

// APIレスポンス・リクエストの項目名（API設計書 19-2 / 19-3 に準拠）
type SchoolForm = {
  imageUrl: string
  name: string
  managerName: string // 経営者名
  contactPerson: string // 担当者名
  area: string
  address: string
  phoneNumber: string
  schoolType: 'NURSERY' | 'CERTIFIED_CHILDCARE_CENTER' | ''
  // 毎日の準備
  mealType: string
  itemBurdenDetail: string
  diaperSupport: string
  futonSupport: string
  // 仕事との両立
  extendedCareHours: string
  extendedCareUsage: string
  weekdayEvents: string
  parentAssociationFrequency: string
  // サポート情報
  contactBookType: string
  absenceContactMethod: string
  lessons: string
  allergySupport: string
  // 園の特徴
  description: string
}

const INITIAL_FORM: SchoolForm = {
  imageUrl: '',
  name: '',
  managerName: '',
  contactPerson: '',
  area: '',
  address: '',
  phoneNumber: '',
  schoolType: '',
  mealType: '',
  itemBurdenDetail: '',
  diaperSupport: '',
  futonSupport: '',
  extendedCareHours: '',
  extendedCareUsage: '',
  weekdayEvents: '',
  parentAssociationFrequency: '',
  contactBookType: '',
  absenceContactMethod: '',
  lessons: '',
  allergySupport: '',
  description: '',
}

// APIレスポンス → フォーム用の整形
// バックエンド未実装の間は使われないが、つなぎこみ時はここだけ調整すればOK
function mapResponseToForm(data: Partial<SchoolForm>): SchoolForm {
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value ?? ''])
  ) as Partial<SchoolForm>

  return {
    ...INITIAL_FORM,
    ...sanitized,
  }
}

// フォーム → PATCHリクエストボディの整形
// API設計書 19-3 のリクエストボディに合わせる
function buildRequestBody(form: SchoolForm) {
  return {
    name: form.name,
    area: form.area,
    address: form.address,
    phoneNumber: form.phoneNumber,
    managerName: form.managerName,
    contactPerson: form.contactPerson,
    imageUrl: form.imageUrl,
    schoolType: form.schoolType,
    mealType: form.mealType,
    itemBurdenDetail: form.itemBurdenDetail,
    diaperSupport: form.diaperSupport,
    futonSupport: form.futonSupport,
    extendedCareHours: form.extendedCareHours,
    extendedCareUsage: form.extendedCareUsage,
    weekdayEvents: form.weekdayEvents,
    parentAssociationFrequency: form.parentAssociationFrequency,
    contactBookType: form.contactBookType,
    absenceContactMethod: form.absenceContactMethod,
    lessons: form.lessons,
    allergySupport: form.allergySupport,
    description: form.description,
  }
}

export default function AdminEditPage() {
  const router = useRouter()
  const [form, setForm] = useState<SchoolForm>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  // 初期表示時に自園情報を取得（GET /school-admin/school）
  useEffect(() => {
    const fetchSchoolData = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const accessToken = session?.access_token
        if (!accessToken) {
          router.push('/admin/login')
          return
        }

        const json = await getSchoolAdminSchool(accessToken)
        setForm(mapResponseToForm(json.data))
      } catch {
        // API未実装・接続エラー時はモック初期値のまま表示する
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolData()
  }, [router])

  const handleChange = (key: keyof SchoolForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const accessToken = session?.access_token
      if (!accessToken) {
        router.push('/admin/login')
        return
      }

      await updateSchoolAdminSchool(accessToken, buildRequestBody(form))
      setToast({ message: '保存しました', type: 'success' })
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <AdminHeader />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-white pt-4">
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="mb-2">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              ＜戻る
            </button>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-400 mb-6">
            園詳細情報 編集画面
          </h1>

          {isLoading && (
            <p className="text-sm text-gray-400 mb-4">読み込み中...</p>
          )}

          {/* 画像 */}
          <div className="mb-6">
            <div className="relative w-24 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt="園の画像"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Image
                </div>
              )}
              <button
                type="button"
                className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center"
                aria-label="画像を編集"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F5A9B8"
                  strokeWidth={2}
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487a2.06 2.06 0 1 1 2.915 2.914L7.5 19.678l-4 1 1-4L16.862 4.487Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="flex flex-col gap-4 mb-6">
            <FormField
              label="保育園名"
              value={form.name}
              onChange={(v) => handleChange('name', v)}
            />
            <FormField
              label="経営者名"
              value={form.managerName}
              onChange={(v) => handleChange('managerName', v)}
            />
            <FormField
              label="担当者名"
              value={form.contactPerson}
              onChange={(v) => handleChange('contactPerson', v)}
            />
            <FormField
              label="エリア"
              value={form.area}
              onChange={(v) => handleChange('area', v)}
            />
            <FormField
              label="住所"
              value={form.address}
              onChange={(v) => handleChange('address', v)}
            />
            <FormField
              label="電話番号"
              value={form.phoneNumber}
              onChange={(v) => handleChange('phoneNumber', v)}
            />
          </div>

          {/* 保育園の種別 */}
          <div className="mb-6">
            <label className="block text-base text-gray-800 mb-2">
              保育園の種別
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schoolType"
                  value="NURSERY"
                  checked={form.schoolType === 'NURSERY'}
                  onChange={() => handleChange('schoolType', 'NURSERY')}
                  className="accent-[#73c0ff]"
                />
                保育園
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schoolType"
                  value="CERTIFIED_CHILDCARE_CENTER"
                  checked={form.schoolType === 'CERTIFIED_CHILDCARE_CENTER'}
                  onChange={() =>
                    handleChange('schoolType', 'CERTIFIED_CHILDCARE_CENTER')
                  }
                  className="accent-[#73c0ff]"
                />
                認定こども園
              </label>
            </div>
          </div>

          <SectionHeader label="毎日の準備" iconSrc="/images/icon23.png" />
          <div className="flex flex-col gap-4 mb-6">
            <FormField
              label="給食・弁当"
              value={form.mealType}
              onChange={(v) => handleChange('mealType', v)}
            />
            <FormField
              label="持ち物"
              value={form.itemBurdenDetail}
              onChange={(v) => handleChange('itemBurdenDetail', v)}
            />
            <FormField
              label="おむつ対応"
              value={form.diaperSupport}
              onChange={(v) => handleChange('diaperSupport', v)}
            />
            <FormField
              label="布団対応"
              value={form.futonSupport}
              onChange={(v) => handleChange('futonSupport', v)}
            />
          </div>

          <SectionHeader label="仕事との両立" iconSrc="/images/icon24.png" />
          <div className="flex flex-col gap-4 mb-6">
            <FormField
              label="延長保育の時間"
              value={form.extendedCareHours}
              onChange={(v) => handleChange('extendedCareHours', v)}
            />
            <FormField
              label="延長保育利用者"
              value={form.extendedCareUsage}
              onChange={(v) => handleChange('extendedCareUsage', v)}
            />
            <FormField
              label="平日行事"
              value={form.weekdayEvents}
              onChange={(v) => handleChange('weekdayEvents', v)}
            />
            <FormField
              label="保護者会"
              value={form.parentAssociationFrequency}
              onChange={(v) => handleChange('parentAssociationFrequency', v)}
            />
          </div>

          <SectionHeader label="サポート情報" iconSrc="/images/icon25.png" />
          <div className="flex flex-col gap-4 mb-6">
            <FormField
              label="連絡帳"
              value={form.contactBookType}
              onChange={(v) => handleChange('contactBookType', v)}
            />
            <FormField
              label="欠席連絡方法"
              value={form.absenceContactMethod}
              onChange={(v) => handleChange('absenceContactMethod', v)}
            />
            <FormField
              label="園内習い事"
              value={form.lessons}
              onChange={(v) => handleChange('lessons', v)}
            />
            <FormField
              label="アレルギー対応"
              value={form.allergySupport}
              onChange={(v) => handleChange('allergySupport', v)}
            />
          </div>

          <SectionHeader label="園の特徴" iconSrc="/images/icon26.png" />
          <div className="mb-8">
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#73c0ff] resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#73c0ff] text-white font-bold rounded-full py-3 text-base hover:bg-[#5aabf0] active:bg-[#5aabf0] transition-colors disabled:opacity-50 [text-shadow:0px_1px_2px_rgba(0,0,0,0.45)]"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </>
  )
}

type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function FormField({ label, value, onChange }: FormFieldProps) {
  return (
    <div>
      <label className="block text-base text-gray-800 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#73c0ff]"
      />
    </div>
  )
}

type SectionHeaderProps = {
  label: string
  iconSrc: string
}

function SectionHeader({ label, iconSrc }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <div className="w-6 h-6 rounded-full flex-shrink-0 relative overflow-hidden">
        <Image src={iconSrc} alt="" fill className="object-contain" />
      </div>
      <h2 className="text-base font-bold text-gray-800">{label}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
