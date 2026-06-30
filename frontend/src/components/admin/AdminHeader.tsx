// 管理者用ヘッダー（水色テーマ）
// src/components/admin/AdminHeader.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AdminHamburgerMenu from './AdminHamburgerMenu'

type AdminHeaderProps = {
  schoolName?: string
  staffName?: string
}

export default function AdminHeader({
  schoolName,
  staffName,
}: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex justify-end">
        <div className="bg-[#73c0ff] h-14 px-4 flex items-center justify-between rounded-bl-3xl w-1/2 md:w-full md:rounded-none">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="ENKATSUロゴ"
              width={36}
              height={36}
              style={{ width: '36px', height: 'auto' }}
              className="rounded-full"
            />
            <span className="text-white font-bold text-lg tracking-wide">
              ENKATSU
            </span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white flex flex-col gap-1 p-1 ml-auto mr-[-6px]"
            aria-label="メニューを開く"
          >
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>
      </header>

      <AdminHamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        schoolName={schoolName}
        staffName={staffName}
      />
    </>
  )
}
