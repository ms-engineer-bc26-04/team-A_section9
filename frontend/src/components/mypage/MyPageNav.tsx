// マイページの導線リスト
// src/components/mypage/MyPageNav.tsx
import Image from 'next/image'

type MyPageNavProps = {
  isPremium: boolean
  onEditProfile: () => void
  onFavorites: () => void
}

export default function MyPageNav({ isPremium, onEditProfile, onFavorites }: MyPageNavProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
      <button
        onClick={onEditProfile}
        className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <Image
            src={isPremium ? '/images/icon22.png' : '/images/icon14.png'}
            alt="プロフィール"
            width={24}
            height={24}
          />
          <span className="text-sm text-gray-700">プロフィール編集</span>
        </div>
        <span className="text-gray-400">{'>'}</span>
      </button>
      <button
        onClick={onFavorites}
        className="w-full flex items-center justify-between px-4 py-4"
      >
        <div className="flex items-center gap-3">
          <Image
            src={isPremium ? '/images/icon22.png' : '/images/icon13.png'}
            alt="お気に入り"
            width={24}
            height={24}
          />
          <span className="text-sm text-gray-700">お気に入り一覧</span>
        </div>
        <span className="text-gray-400">{'>'}</span>
      </button>
    </div>
  )
}