// src/app/layout.tsx
//全画面共通の外枠。HeaderをここでラップするのでどのページにもHeaderが表示される
import type { Metadata } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google' // 🌟【修正】Next.js公式のフォントローダーをインポート
import './globals.css'
import Header from '@/components/common/Header'

// 🌟【修正】Google Fontsの「M PLUS Rounded 1c」を設定
const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ENKATSU 〜園活を円滑に〜',
  description: '復職後の生活が無理なく回る園を見つけよう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      {/* 🌟【修正】不要になった <head> と <link> タグを削除（Next.jsが自動管理するため） */}
      <body className={mPlusRounded1c.className}>
        <Header />
        {/* max-w-2xl を削除して全幅にする */}
        <main className="pt-11 min-h-screen bg-white">{children}</main>
      </body>
    </html>
  )
}
