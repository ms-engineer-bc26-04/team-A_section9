// 園詳細画面のヘッダー（画像・園名・住所・タグ・ボタン）
// src/components/school/SchoolDetailHeader.tsx
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'

type SchoolDetailHeaderProps = {
  id: string
  name: string
  address: string
  phoneNumber: string | null
  imageUrl: string | null
  schoolType: string
  tags: string[]
  isFavorited: boolean
  isLoggedIn: boolean
  onToggleFavorite: (schoolId: number) => void
  onVisit: () => void
}

const schoolTypeLabel: Record<string, string> = {
  NURSERY: '保育園',
  CERTIFIED_CHILDCARE_CENTER: '認定こども園',
  SMALL_SCALE_NURSERY: '小規模保育',
}

export default function SchoolDetailHeader({
  id,
  name,
  address,
  phoneNumber,
  imageUrl,
  schoolType,
  tags,
  isFavorited,
  isLoggedIn,
  onToggleFavorite,
  onVisit,
}: SchoolDetailHeaderProps) {
  return (
    <>
      <div className="w-full h-48 bg-gray-100 overflow-hidden relative mt-2">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{name}</h1>
            <p className="text-sm text-gray-500 mt-1">{address}</p>
            {phoneNumber && (
              <p className="text-sm text-gray-500">電話番号：{phoneNumber}</p>
            )}
            <p className="text-sm text-gray-500">
              {schoolTypeLabel[schoolType] ?? schoolType}
            </p>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full font-normal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button
              onClick={onVisit}
              className="bg-[#F5A623] text-white text-sm font-bold px-4 py-2 rounded-full"
            >
              見学申込み
            </button>
            <FavoriteButton
              schoolId={Number(id)}
              isFavorited={isFavorited}
              isLoggedIn={isLoggedIn}
              onToggle={onToggleFavorite}
            />
          </div>
        </div>
      </div>
    </>
  )
}
