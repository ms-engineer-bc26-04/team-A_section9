// あなたにおすすめカードコンポーネント
// src/components/compare/RecommendedSchoolCard.tsx
import Image from 'next/image'
import { ChartSchool } from './BurdenRadarChart'

type RecommendedSchoolCardProps = {
  schools: ChartSchool[]
}

export default function RecommendedSchoolCard({
  schools,
}: RecommendedSchoolCardProps) {
  const maxMatchCount =
    schools.length > 0 ? Math.max(...schools.map((s) => s.matchCount)) : 0
  const recommendedSchools = schools.filter(
    (s) => s.matchCount === maxMatchCount && s.matchCount > 0
  )

  if (recommendedSchools.length === 0) return null

  return (
    <div className="bg-[#fff1db] rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image
            src="/images/icon21.png"
            alt="おすすめ"
            fill
            sizes="36px"
            className="object-contain"
          />
        </div>
        <p className="font-bold text-gray-800 text-base">あなたにおすすめ</p>
      </div>
      <p className="text-sm text-gray-700">
        {recommendedSchools.map((s) => s.name).join('・')}は<br />
        あなたの希望条件に合っていておすすめです
      </p>
    </div>
  )
}
