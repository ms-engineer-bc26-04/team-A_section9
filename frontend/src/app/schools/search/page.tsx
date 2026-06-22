// src/app/schools/search/page.tsx
import Link from 'next/link'

export default function SearchPage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-bold text-lg">検索結果画面</h1>
      <Link href="/" className="text-primary underline text-sm">
        ← ホームへ戻る
      </Link>
    </div>
  )
}