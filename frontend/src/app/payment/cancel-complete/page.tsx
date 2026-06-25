// src/app/payment/cancel-complete/page.tsx
// プレミアムキャンセル完了画面

'use client'

import { useRouter } from 'next/navigation'

export default function PaymentCancelCompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* メッセージ */}
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          一般会員への変更が完了しました
        </h1>

        {/* 利用可能期間 */}
        <p className="text-sm text-gray-500 mb-8">
          ○月○日までプレミアム機能が使用できます
        </p>

        {/* ホームへ戻るボタン */}
        <button
          onClick={() => router.push('/')}
          className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm"
        >
          ホームへ戻る
        </button>
      </div>
    </div>
  )
}
