//画面上部の緑のヘッダー帯。ロゴ＋ハンバーガーメニューを表示
// src/components/common/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HamburgerMenu from './HamburgerMenu'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex justify-end">
        <div className="bg-primary h-14 pl-4 pr-1 flex items-center justify-between rounded-bl-3xl w-1/2">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="ENKATSUロゴ"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-white font-bold text-lg tracking-wide">
              ENKATSU
            </span>
          </Link>

          {/* ハンバーガーボタン */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white flex flex-col gap-1 p-1 ml-auto"
            aria-label="メニューを開く"
          >
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>
      </header>

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}