//園一覧・検索結果で1件分の園を表示するカード（画像・園名・住所・タグ・ハート）
// src/components/school/SchoolCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { SchoolSummary } from '@/types/school'
import FavoriteButton from './FavoriteButton'

type SchoolCardProps = {
  school: SchoolSummary
  isLoggedIn?: boolean
  onToggleFavorite?: (schoolId: number) => void
}

export default function SchoolCard({
  school,
  isLoggedIn = false,
  onToggleFavorite,
}: SchoolCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex gap-3 p-3">
        {/* 画像 */}
        <Link href={`/schools/${school.id}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            {school.imageUrl ? (
              <Image
                src={school.imageUrl}
                alt={school.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                No Image
              </div>
            )}
          </div>
        </Link>

        {/* テキスト情報 */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <Link href={`/schools/${school.id}`}>
            <p className="font-bold text-gray-800 text-sm leading-snug pr-8">
              {school.name}
            </p>
            <p className="text-gray-500 text-xs truncate">{school.address}</p>
            {school.phoneNumber && (
              <p className="text-gray-500 text-xs">
                電話番号：{school.phoneNumber}
              </p>
            )}
            {/* タグ */}
            <div className="flex flex-wrap gap-1 mt-1">
              {(school.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="bg-[#A0CD83] text-white text-xs px-2 py-0.5 rounded-full font-normal"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>

        {/* お気に入りボタン：カード右上に固定 */}
        <div className="flex-shrink-0 flex items-start pt-1">
          <FavoriteButton
            schoolId={school.id}
            isFavorited={school.isFavorited}
            isLoggedIn={isLoggedIn}
            onToggle={onToggleFavorite}
          />
        </div>
      </div>
    </div>
  )
}
