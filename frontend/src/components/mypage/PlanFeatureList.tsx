// プランでできることリスト
// src/components/mypage/PlanFeatureList.tsx
import Image from 'next/image'

type PlanFeatureListProps = {
  isPremium: boolean
}

function PlanItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={`/images/${icon}`} alt="" width={24} height={24} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

const PREMIUM_FEATURES = [
  { icon: 'icon16.png', text: '3つの園を同時比較' },
  { icon: 'icon17.png', text: 'お気に入りを無制限に保存' },
  { icon: 'icon18.png', text: 'サポート情報を閲覧可能' },
]

const FREE_FEATURES = [
  { icon: 'icon12.png', text: '2つの園を同時比較' },
  { icon: 'icon13.png', text: '5件までお気に入り機能の追加' },
  { icon: 'icon14.png', text: 'マイページから希望条件の登録' },
]

export default function PlanFeatureList({ isPremium }: PlanFeatureListProps) {
  const features = isPremium ? PREMIUM_FEATURES : FREE_FEATURES

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 font-medium mb-3">
        現在のプランでできること
      </p>
      <div className="flex flex-col gap-2">
        {features.map((f) => (
          <PlanItem key={f.text} icon={f.icon} text={f.text} />
        ))}
      </div>
    </div>
  )
}

export { PlanItem, PREMIUM_FEATURES, FREE_FEATURES }