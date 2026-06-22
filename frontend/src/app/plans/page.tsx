// src/app/plans/page.tsx
import Link from 'next/link'

export default function PlansPage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-bold text-lg">プラン・料金画面</h1>
      <Link href="/" className="text-primary underline text-sm">
        ← ホームへ戻る
      </Link>
    </div>
  )
}