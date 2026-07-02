// 比較画面の園の画像・名前エリアを担当するコンポーネント
// src/components/compare/CompareSchoolHeader.tsx
import Link from 'next/link'
import Image from 'next/image'
import { renderWithBreakBeforeKeyword } from './breakUtils'
import { CompareSchool } from './CompareTable'

type CompareSchoolHeaderProps = {
  schools: CompareSchool[]
}

// 園名が長い場合に、種別名（保育園／こども園など）の直前で改行できるようにする
const SCHOOL_TYPE_KEYWORDS = ['保育園', 'こども園', '子ども園', '幼稚園']

export default function CompareSchoolHeader({
  schools,
}: CompareSchoolHeaderProps) {
  return (
    <div className="flex gap-2">
      <div className="w-20 flex-shrink-0" />
      {schools.map((school) => (
        <div
          key={school.id}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <Link href={`/schools/${school.id}`} className="w-full">
            <div className="relative w-full h-20 rounded-xl overflow-hidden bg-gray-100">
              {school.imageUrl ? (
                <Image
                  src={school.imageUrl}
                  alt={school.name}
                  fill
                  sizes="(max-width: 672px) 33vw, 224px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Image
                </div>
              )}
            </div>
          </Link>
          <Link href={`/schools/${school.id}`}>
            {/* break-keep + renderWithBreakBeforeKeywordで「保育園」等の直前を優先的に改行し、
                overflow-wrap:anywhereを保険にして、それでも長すぎる場合ははみ出さないようにする */}
            <p className="text-sm font-medium text-center text-gray-800 hover:text-primary break-keep [overflow-wrap:anywhere]">
              {renderWithBreakBeforeKeyword(school.name, SCHOOL_TYPE_KEYWORDS)}
            </p>
          </Link>
        </div>
      ))}
    </div>
  )
}
