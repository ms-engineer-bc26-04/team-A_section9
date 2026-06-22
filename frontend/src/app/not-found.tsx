// app/not-found.tsx
//存在しないURLにアクセスした時の404画面
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
      <p className="text-gray-500">お探しのページが見つかりませんでした。</p>
      <Link
        href="/"
        className="bg-primary text-white px-6 py-3 rounded-full font-bold"
      >
        ホームへ戻る
      </Link>
    </div>
  )
}