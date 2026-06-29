// マイページのユーザー情報カード
// src/components/mypage/MyPageHeader.tsx
import Image from 'next/image'

type MyPageHeaderProps = {
  name: string | null
  email: string
  isPremium: boolean
}

export default function MyPageHeader({
  name,
  email,
  isPremium,
}: MyPageHeaderProps) {
  return (
    <div
      className={`${isPremium ? 'bg-[#F9B84A]' : 'bg-[#A0CD83]'} rounded-xl p-4 flex items-center gap-4 mb-4`}
    >
      <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
        <Image
          src={isPremium ? '/images/icon22.png' : '/images/icon14.png'}
          alt="アバター"
          width={48}
          height={48}
        />
      </div>
      <div>
        <p className="text-white font-bold text-lg">
          {name ? `${name}さん` : email}
        </p>
        <p className="text-white/80 text-sm">
          {isPremium ? 'プレミアムユーザー' : '会員ユーザー'}
        </p>
      </div>
    </div>
  )
}
