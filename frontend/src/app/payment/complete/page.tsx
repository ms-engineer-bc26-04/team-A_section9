// src/app/payment/complete/page.tsx
// プレミアム登録完了画面

'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function PaymentCompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* チェックアイコン */}
        <div className="flex justify-center mb-8">
          <Image src="/images/check.png" alt="完了" width={120} height={120} />
        </div>

        {/* メッセージ */}
        <h1 className="text-xl font-bold text-gray-800 mb-3">
          プレミアム登録が完了しました！
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          これから素敵な園探しをサポートします！
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
