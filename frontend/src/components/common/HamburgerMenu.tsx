// src/components/common/HamburgerMenu.tsx
//ハンバーガーアイコンを押すと開くメニュー。ログイン状態・会員区分で中身を切り替える
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type HamburgerMenuProps = {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { supabaseUser, appUser, isPremium, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    router.push('/')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-auto w-full max-w-sm bg-white z-50 shadow-xl flex flex-col rounded-bl-3xl overflow-hidden">
        <div className="bg-gradient-to-b from-[#f2f8ee] to-white rounded-bl-[40px] flex flex-col">
          <div className="bg-[#a0cd83] h-14 px-6 flex items-center justify-between rounded-bl-[30px]">
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

          {isLoading ? (
            <div className="px-6 py-5 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !supabaseUser ? (
            <div className="px-6 py-5 flex gap-3">
              <button
                onClick={() => {
                  router.push('/register')
                  onClose()
                }}
                className="flex-1 bg-[#A0CD83] text-white font-bold text-sm py-2.5 px-4 rounded-full hover:bg-[#82b865] active:bg-[#82b865] transition-colors"
              >
                新規会員登録
              </button>
              <button
                onClick={() => {
                  router.push('/login')
                  onClose()
                }}
                className="flex-1 bg-[#A0CD83] text-white font-bold text-sm py-2.5 px-4 rounded-full hover:bg-[#82b865] active:bg-[#82b865] transition-colors"
              >
                ログイン
              </button>
            </div>
          ) : (
            <div className="px-6 pt-4 pb-6 flex flex-col gap-2">
              <p className="text-gray-600 text-base">
                {isPremium ? 'プレミアム会員' : '一般会員'}
              </p>
              <p className="font-bold text-gray-800 text-2xl">
                {appUser?.name ?? supabaseUser.email} さん
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-b from-[#f2f8ee] to-white rounded-bl-[50px] pb-4 flex flex-col mt-[-1px]">
          <div className="bg-[#a0cd83] h-14 px-6 flex items-center rounded-bl-[30px]">
            <p className="text-white font-extrabold text-base tracking-wider">
              マイ機能
            </p>
          </div>
          <div className="px-6 pt-4 flex flex-col gap-1">
            <MenuItem href="/" label="ホーム" onClick={onClose} enabled bold />
            <MenuItem
              href="/mypage/favorites"
              label="お気に入り/比較"
              onClick={onClose}
              enabled={isLoading || !!supabaseUser}
            />
            <MenuItem
              href="/mypage"
              label="マイページ"
              onClick={onClose}
              enabled={isLoading || !!supabaseUser}
            />
            <MenuItem
              href="/plans"
              label="プラン・料金確認"
              onClick={onClose}
              enabled
              bold
            />
            {!isLoading && supabaseUser && (
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="bg-[#a0cd83] text-white font-extrabold text-sm px-6 py-2 rounded-full hover:bg-[#82b865] active:bg-[#82b865] transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
            {/* 保育園の方はこちらボタン：全員に表示 */}
            <div className="mt-6">
              <button
                onClick={() => {
                  router.push('/admin/login')
                  onClose()
                }}
                className="border-2 border-[#a0cd83] text-[#a0cd83] font-extrabold text-sm px-6 py-2.5 rounded-full hover:bg-[#f2f8ee] active:bg-[#f2f8ee] transition-colors"
              >
                保育園の方はこちら
              </button>
            </div>
          </div>
        </div>

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

type MenuItemProps = {
  href: string
  label: string
  onClick: () => void
  enabled: boolean
  bold?: boolean
}

function MenuItem({ href, label, onClick, enabled, bold }: MenuItemProps) {
  if (!enabled) {
    return (
      <div className="py-3">
        <span className="text-gray-400 text-base font-bold tracking-wide">
          {label}
        </span>
      </div>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`py-3 block text-[#1a1a1a] hover:text-[#a2d382] transition-colors text-base tracking-wide ${
        bold ? 'font-bold' : 'font-bold'
      }`}
    >
      {label}
    </Link>
  )
}
