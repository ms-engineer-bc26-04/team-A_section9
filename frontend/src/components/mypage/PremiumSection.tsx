// プレミアム誘導 or 一般プランへの変更セクション
// src/components/mypage/PremiumSection.tsx
import Image from 'next/image'
import { PlanItem, FREE_FEATURES, PREMIUM_FEATURES } from './PlanFeatureList'

type PremiumSectionProps = {
  isPremium: boolean
  isCheckingOut: boolean
  isPortaling: boolean
  onCheckout: () => void
  onPortal: () => void
}

export default function PremiumSection({
  isPremium,
  isCheckingOut,
  isPortaling,
  onCheckout,
  onPortal,
}: PremiumSectionProps) {
  if (isPremium) {
    return (
      <div className="mb-6">
        <hr className="mb-4" />
        <p className="text-sm text-gray-600 font-medium mb-2">
          一般プランに変更する
        </p>
        <p className="text-xs text-gray-400 mb-3">下記の機能に変更になります</p>
        <div className="flex flex-col gap-2 mb-4">
          {FREE_FEATURES.map((f) => (
            <PlanItem key={f.text} icon={f.icon} text={f.text} />
          ))}
        </div>
        <button
          onClick={onPortal}
          disabled={isPortaling}
          className="w-full border border-gray-300 rounded-full py-3 text-sm text-gray-600 font-bold disabled:opacity-50"
        >
          {isPortaling ? '移動中...' : '変更する'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#FFF8EC] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Image
          src="/images/icon21.png"
          alt="プレミアム"
          width={24}
          height={24}
        />
        <p className="text-sm font-bold text-gray-700 text-center">
          プレミアムユーザーになると
          <br />
          もっと便利に！
        </p>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {PREMIUM_FEATURES.map((f) => (
          <PlanItem key={f.text} icon={f.icon} text={f.text} />
        ))}
      </div>
      <div className="text-center mb-3">
        <span className="text-sm text-gray-500">月額</span>
        <span className="text-3xl font-bold text-gray-800 mx-1">500</span>
        <span className="text-sm text-gray-500">円（税込み）</span>
      </div>
      <button
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="w-full bg-[#F5A623] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
      >
        {isCheckingOut ? '移動中...' : 'プレミアム会員に登録する'}
      </button>
    </div>
  )
}
