// src/components/common/HamburgerMenu.tsx
//ハンバーガーアイコンを押すと開くメニュー。ログイン状態・会員区分で中身を切り替える
'use client'

import Link from 'next/link'
import Image from 'next/image'
import Button from './Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type HamburgerMenuProps = {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { supabaseUser } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    router.push('/')
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* メニュー本体 */}
      <div className="fixed top-0 right-0 h-auto w-full max-w-sm bg-white z-50 shadow-xl flex flex-col rounded-bl-3xl rounded-br-3xl overflow-hidden">
        {/* ==========================================
            ブロック1: アカウントエリア
           ========================================== */}
        {/* 外側を「薄い緑➔白」のグラデーションにし、左下を角丸に */}
        <div className="bg-gradient-to-b from-[#e3eedb] to-white rounded-bl-[40px] pb-6 flex flex-col">
          {/* ヘッダー帯：ここをしっかりした濃い緑に */}
          <div className="bg-[#a2d382] px-6 pt-6 pb-4 flex items-center justify-between rounded-bl-[30px]">
            <p className="text-white font-bold text-lg tracking-wider">
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

          {/* 新規会員登録・ログインボタン（白背景に抜ける部分に配置） */}
          {!supabaseUser && (
            <div className="px-6 pt-6 flex gap-4">
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-[#9ed07d] text-white border-none rounded-xl font-bold py-2.5 shadow-sm hover:bg-[#8bc169] transition-colors"
                onClick={() => {
                  router.push('/register')
                  onClose()
                }}
              >
                新規会員登録
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-[#9ed07d] text-white border-none rounded-xl font-bold py-2.5 shadow-sm hover:bg-[#8bc169] transition-colors"
                onClick={() => {
                  router.push('/login')
                  onClose()
                }}
              >
                ログイン
              </Button>
            </div>
          )}
        </div>

        {/* ==========================================
            ブロック2: マイ機能エリア
           ========================================== */}
        {/* 外側を「薄い緑➔白」のグラデーションにし、左下を大きな角丸に */}
        <div className="bg-gradient-to-b from-[#e3eedb] to-white rounded-bl-[50px] pb-8 flex flex-col mt-[-1px]">
          {/* マイ機能帯：ここをしっかりした濃い緑に */}
          <div className="bg-[#a2d382] px-6 py-4 rounded-bl-[30px]">
            <p className="text-white font-bold text-lg tracking-wider">
              マイ機能
            </p>
          </div>

          {/* メニューリスト（グラデーション背景の上に黒文字で配置） */}
          <div className="px-6 pt-4 flex flex-col gap-1">
            <MenuItem href="/" label="ホーム" onClick={onClose} enabled bold />
            <MenuItem
              href="/mypage/favorites"
              label="お気に入り/比較"
              onClick={onClose}
              enabled={!!supabaseUser}
            />
            <MenuItem
              href="/mypage"
              label="マイページ"
              onClick={onClose}
              enabled={!!supabaseUser}
            />
            <MenuItem
              href="/plans"
              label="プラン・料金確認"
              onClick={onClose}
              enabled
              bold
            />

            {supabaseUser && (
              <div className="mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="text-red-600 text-sm font-bold w-full text-left py-2 hover:text-red-800"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            ブロック3: 下部ロゴエリア (完全な白背景)
           ========================================== */}
        <div className="bg-white px-6 py-10 flex justify-center mt-[-1px]">
          <Image
            src="/images/logo2.png"
            alt="ENKATSU"
            width={240}
            height={72}
            className="object-contain"
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
  // 非活性（未ログイン）時：すこし薄いグレー（画像のお気に入り/比較のイメージ）
  if (!enabled) {
    return (
      <div className="py-3">
        <span className="text-gray-400 text-base font-bold tracking-wide">
          {label}
        </span>
      </div>
    )
  }

  // 活性時：はっきりした黒文字
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
