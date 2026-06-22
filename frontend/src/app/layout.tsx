// src/app/layout.tsx
//全画面共通の外枠。HeaderをここでラップするのでどのページにもHeaderが表示される
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/common/Header'

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
      <body>
        <Header />
        {/* Header(h-14) + pt-2 の分だけpadding */}
        <main className="pt-20 min-h-screen bg-white max-w-2xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}