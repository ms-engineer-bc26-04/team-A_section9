// 比較テーブルの1行分（項目名＋各園の値）を表示するコンポーネント
// src/components/compare/CompareRow.tsx
import { renderWithBreaks } from './breakUtils'
import type { CompareSchool, MatchHighlights } from './compareTypes'

type CompareRowProps = {
  label: string
  schools: CompareSchool[]
  getValue: (school: CompareSchool) => string
  highlightKey: string | null
  matchHighlights: MatchHighlights
  isPremium: boolean
  isLast?: boolean
}

export default function CompareRow({
  label,
  schools,
  getValue,
  highlightKey,
  matchHighlights,
  isPremium,
  isLast = false,
}: CompareRowProps) {
  return (
    <div className={`flex ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="w-20 flex-shrink-0 px-2 py-3 flex items-center">
        <p className="text-xs text-gray-700 whitespace-pre-line leading-tight">
          {label}
        </p>
      </div>
      {schools.map((school) => {
        const isMatch =
          isPremium &&
          highlightKey &&
          matchHighlights?.[String(school.id)]?.[
            highlightKey as keyof (typeof matchHighlights)[string]
          ]

        return (
          <div
            key={school.id}
            className="flex-1 px-2 py-3 flex items-center justify-center border-l border-gray-200"
            style={isMatch ? { backgroundColor: 'rgba(255,255,154,0.3)' } : {}}
          >
            {/* break-keep + renderWithBreaksで「・」の位置を優先的に改行し、
                overflow-wrap:anywhereを保険にして、それでも長すぎる場合ははみ出さないようにする */}
            <p
              className={`text-xs text-center break-keep [overflow-wrap:anywhere] ${isMatch ? 'font-bold text-gray-800' : 'text-gray-800'}`}
            >
              {renderWithBreaks(getValue(school))}
            </p>
          </div>
        )
      })}
    </div>
  )
}
