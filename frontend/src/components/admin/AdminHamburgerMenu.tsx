// 管理者用ハンバーガーメニュー
// src/components/admin/AdminHamburgerMenu.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type AdminHamburgerMenuProps = {
  isOpen: boolean
  onClose: () => void
  schoolName?: string
  staffName?: string
}

export default function AdminHamburgerMenu({
  isOpen,
  onClose,
  schoolName,
  staffName,
}: AdminHamburgerMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    router.push('/admin/login')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-auto w-full max-w-sm bg-white z-50 shadow-xl flex flex-col rounded-bl-3xl overflow-hidden">
        {/* アカウントセクション */}
        <div className="bg-gradient-to-b from-[#cbe7ff] to-white rounded-bl-[40px] flex flex-col">
          <div className="bg-[#73c0ff] h-14 px-6 flex items-center justify-between rounded-bl-[30px]">
            <p className="text-white font-extrabold text-base tracking-wider">
              アカウント
            </p>
            <button
              onClick={onClose}
              className="flex flex-col gap-1 p-1"
              aria-label="メニューを閉じる"
            >
              <span className="block w-6 h-0.5 bg-white" />
              <span className="block w-6 h-0.5 bg-white" />
              <span className="block w-6 h-0.5 bg-white" />
            </button>
          </div>
          {/* ログインページのみ「ENKATSUホーム画面に戻る」を表示 */}
          {isLoginPage ? (
            <div className="px-6 py-5 flex justify-center">
              <button
                onClick={() => {
                  router.push('/')
                  onClose()
                }}
                className="w-full max-w-[283px] bg-white text-[#a0cd83] font-extrabold text-base rounded-full py-2.5 border-2 border-[#a0cd83] hover:bg-[#a0cd83]/10 active:bg-[#a0cd83]/10 transition-colors"
              >
                ENKATSUホーム画面に戻る
              </button>
            </div>
          ) : (
            <div className="px-6 pt-4 pb-6">
              {/* 修正：園名・担当者名を2行に分けて表示 */}
              <p className="font-bold text-gray-800 text-2xl">
                {schoolName ?? 'かがやき保育園'}
              </p>
              <p className="font-bold text-gray-800 text-lg mt-1">
                担当者名：{staffName ?? 'かがやき瞬'}さん
              </p>
            </div>
          )}
        </div>

        {/* マイ機能セクション：ログインページ以外のみ表示 */}
        {!isLoginPage && (
          <div className="bg-gradient-to-b from-[#cbe7ff] to-white rounded-bl-[50px] pb-4 flex flex-col mt-[-1px]">
            <div className="bg-[#73c0ff] h-14 px-6 flex items-center rounded-bl-[30px]">
              <p className="text-white font-extrabold text-base tracking-wider">
                マイ機能
              </p>
            </div>
            <div className="px-6 pt-4 flex flex-col gap-1">
              <Link
                href="/admin"
                onClick={onClose}
                className="py-3 block text-[#1a1a1a] hover:text-[#73c0ff] transition-colors text-base font-bold tracking-wide"
              >
                ホーム
              </Link>
              <Link
                href="/admin/edit"
                onClick={onClose}
                className="py-3 block text-[#1a1a1a] hover:text-[#73c0ff] transition-colors text-base font-bold tracking-wide"
              >
                園情報編集
              </Link>
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="bg-[#73c0ff] text-white font-extrabold text-sm px-6 py-2 rounded-full hover:bg-[#5aabf0] active:bg-[#5aabf0] transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ロゴ */}
        <div className="bg-white px-6 py-4 flex justify-center mt-[-1px]">
          <Image
            src="/images/logo2.png"
            alt="ENKATSU"
            width={320}
            height={96}
            className="object-contain w-full max-w-[280px]"
          />
        </div>
      </div>
    </>
  )
}
