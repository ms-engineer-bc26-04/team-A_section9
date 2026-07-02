// 保育園管理者マイページ
// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminHeader from '@/components/admin/AdminHeader'
import { supabase } from '@/lib/supabase'
import { getSchoolAdminSchool } from '@/lib/api/schoolAdmin'

const MOCK_CONTACTS = [
  {
    id: 1,
    name: '佐藤 恵',
    email: 'megumi.sato@example.com',
    message: '延長保育について確認したいです。',
    createdAt: '2026/6/29 21:00',
  },
  {
    id: 2,
    name: '高橋 美咲',
    email: 'misaki.takahashi@example.com',
    message: 'アレルギー対応の詳細について確認したいです。',
    createdAt: '2026/6/28 10:00',
  },
  {
    id: 3,
    name: '園活 みずえ',
    email: 'mizue@example.com',
    message: '保育園の空き状況を確認したいです。',
    createdAt: '2026/6/27 15:00',
  },
]

const MOCK_VISITS = [
  {
    id: 1,
    name: '佐藤 恵',
    email: 'megumi.sato@example.com',
    visitDate: '7/30',
    visitTime: '10:30〜',
    createdAt: '2026/6/29 21:00',
  },
  {
    id: 2,
    name: '高橋 美咲',
    email: 'misaki.takahashi@example.com',
    visitDate: '7/20',
    visitTime: '13:30〜',
    createdAt: '2026/6/28 15:00',
  },
  {
    id: 3,
    name: '園活 みずえ',
    email: 'mizue@example.com',
    visitDate: '7/15',
    visitTime: '9:30〜',
    createdAt: '2026/6/27 10:00',
  },
]

type Tab = 'contacts' | 'visits'

// 未取得時のプレースホルダー表示
const FALLBACK_SCHOOL_NAME = '●●保育園'
const FALLBACK_STAFF_NAME = '●●●●'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('contacts')

  const [schoolName, setSchoolName] = useState(FALLBACK_SCHOOL_NAME)
  const [staffName, setStaffName] = useState(FALLBACK_STAFF_NAME)
  const [isMeLoading, setIsMeLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const accessToken = session?.access_token

        if (!accessToken) {
          router.push('/admin/login')
          return
        }

        const res = await getSchoolAdminSchool(accessToken)
        const school = res.data

        setSchoolName(school?.name ?? FALLBACK_SCHOOL_NAME)
        setStaffName(school?.contactPerson ?? FALLBACK_STAFF_NAME)
      } catch {
        router.push('/admin/login')
      } finally {
        setIsMeLoading(false)
      }
    }

    fetchMe()
  }, [router])

  return (
    <>
      <AdminHeader schoolName={schoolName} staffName={staffName} />

      {/* 修正：flex flex-col にし、水色エリアをflex-1で残り全部の高さに広げる
          （min-h-[calc(100vh-350px)]という固定値だと、上部の実際の高さとズレて
          画面下部が白く切れてしまっていたため） */}
      <div className="min-h-screen bg-white pt-4 flex flex-col">
        {/* 上部コンテンツ（白背景エリア） */}
        <div className="max-w-2xl mx-auto w-full">
          {/* 園情報カード */}
          <div className="mx-4 mt-2 bg-[#73c0ff] rounded-xl px-4 py-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 relative">
              <Image
                src="/images/icon27.png"
                alt="管理者アイコン"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-white font-extrabold text-2xl">
                {isMeLoading ? FALLBACK_SCHOOL_NAME : schoolName}
              </p>
              <p className="text-white text-sm">
                担当者名：{isMeLoading ? FALLBACK_STAFF_NAME : staffName}
              </p>
            </div>
          </div>

          {/* 園情報編集ボタン */}
          <div className="flex justify-end mx-4 mt-4">
            <button
              onClick={() => router.push('/admin/edit')}
              className="bg-[#73c0ff] text-white font-extrabold text-sm px-6 py-2.5 rounded-full hover:bg-[#5aabf0] active:bg-[#5aabf0] transition-colors"
            >
              園情報編集
            </button>
          </div>
        </div>

        {/* タブ（白背景） */}
        <div className="mt-4 border-b border-gray-300">
          <div className="max-w-2xl mx-auto px-4 flex pt-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-3 text-base font-extrabold transition-colors relative ${
                activeTab === 'contacts' ? 'text-[#73c0ff]' : 'text-gray-400'
              }`}
            >
              お問い合わせ一覧
              {activeTab === 'contacts' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#73c0ff]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`flex-1 py-3 text-base font-extrabold transition-colors relative ${
                activeTab === 'visits' ? 'text-[#73c0ff]' : 'text-gray-400'
              }`}
            >
              見学予約一覧
              {activeTab === 'visits' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#73c0ff]" />
              )}
            </button>
          </div>
        </div>

        {/* 一覧エリア（水色背景：タブの下から画面下部まで） */}
        <div className="bg-[#ddf0ff] flex-1">
          <div className="max-w-2xl mx-auto">
            {/* お問い合わせ一覧 */}
            {activeTab === 'contacts' && (
              <div className="mx-4 pt-4 pb-10 flex flex-col gap-4">
                {MOCK_CONTACTS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-300 rounded-3xl px-5 py-4"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-bold text-base text-gray-800">
                        {item.name} さん
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {item.createdAt}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      メールアドレス：{item.email}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mb-1">
                      お問い合わせ内容
                    </p>
                    <p className="text-xs text-gray-600">{item.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 見学予約一覧 */}
            {activeTab === 'visits' && (
              <div className="mx-4 pt-4 pb-10 flex flex-col gap-4">
                {MOCK_VISITS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-300 rounded-3xl px-5 py-4"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-bold text-base text-gray-800">
                        {item.name} さん
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {item.createdAt}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      メールアドレス：{item.email}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      見学希望日時：{item.visitDate}
                    </p>
                    <p className="text-sm text-gray-700">
                      見学希望時間：{item.visitTime}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
