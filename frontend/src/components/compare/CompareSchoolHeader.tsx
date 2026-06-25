// 比較画面の園の画像・名前エリアを担当するコンポーネント
// src/components/compare/CompareSchoolHeader.tsx
import Link from 'next/link'
import { CompareSchool } from './CompareTable'

type CompareSchoolHeaderProps = {
  schools: CompareSchool[]
}

export default function CompareSchoolHeader({
  schools,
}: CompareSchoolHeaderProps) {
  return (
    <div className="flex gap-2 mb-6">
      <div className="w-20 flex-shrink-0" />
      {schools.map((school) => (
        <div
          key={school.id}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <Link href={`/schools/${school.id}`} className="w-full">
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100">
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                No Image
              </div>
            </div>
          </Link>
          <Link href={`/schools/${school.id}`}>
            <p className="text-sm font-medium text-center text-gray-800 hover:text-primary">
              {school.name}
            </p>
          </Link>
        </div>
      ))}
    </div>
  )
}
