//画面上部の緑のヘッダー帯。ロゴ＋ハンバーガーメニューを表示
// src/components/common/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HamburgerMenu from './HamburgerMenu'

// 緑背景に対する白文字・白アイコンの視認性向上のための共通スタイル
const GREEN_TEXT_SHADOW = '[text-shadow:0px_1px_2px_rgba(0,0,0,0.45)]'
const GREEN_ICON_SHADOW = '[box-shadow:0px_1px_1px_rgba(0,0,0,0.25)]'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex justify-end">
        {/* スマホ：右半分のみ・左下丸 / PC：全幅・角なし */}
        <div className="bg-[#A0CD83] h-14 px-4 flex items-center justify-between rounded-bl-3xl w-1/2 md:w-full md:rounded-none">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="ENKATSUロゴ"
              width={36}
              height={36}
              style={{ width: '36px', height: '36px' }}
              className="rounded-full object-cover"
            />
            <span
              className={`text-white font-bold text-lg tracking-wide ${GREEN_TEXT_SHADOW}`}
            >
              ENKATSU
            </span>
          </Link>

          {/* ハンバーガーボタン */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white flex flex-col gap-1 p-1 ml-auto mr-[-6px]"
            aria-label="メニューを開く"
          >
            <span className={`block w-5 h-0.5 bg-white ${GREEN_ICON_SHADOW}`} />
            <span className={`block w-5 h-0.5 bg-white ${GREEN_ICON_SHADOW}`} />
            <span className={`block w-5 h-0.5 bg-white ${GREEN_ICON_SHADOW}`} />
          </button>
        </div>
      </header>

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
