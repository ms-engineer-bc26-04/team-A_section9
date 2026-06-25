// 選択した2〜3園を横並びで比較表示するテーブル
// src/components/compare/CompareTable.tsx
import Image from 'next/image'

type CompareSchool = {
  id: string
  name: string
  area: string
  schoolType: string
  lifeBurden: {
    mealType: string
    itemBurdenDetail: string
    diaperSupport: string | null
    futonSupport: string | null
  }
  timeBurden: {
    extendedCareTime: string | null
    extendedCareUsage: string
    weekdayEvents: string
    parentAssociationFrequency: string
  }
}

type MatchHighlights = {
  [schoolId: string]: {
    mealType: boolean
    itemBurdenDetail: boolean
    diaperSupport: boolean
    futonSupport: boolean
    extendedCare: boolean
    weekdayEvents: boolean
    parentAssociationFrequency: boolean
  }
} | null

const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  MIXED: '給食・弁当併用',
}
const diaperLabel: Record<string, string> = {
  DISPOSED_BY_SCHOOL: '園で廃棄',
  TAKE_HOME: '持ち帰り',
  SUBSCRIPTION: 'サブスク対応',
}
const futonLabel: Record<string, string> = {
  RENTAL: 'レンタルあり',
  TAKE_HOME_WEEKLY: '毎週持ち帰り',
  MANAGED_BY_SCHOOL: '園で管理',
}

type CompareTableProps = {
  schools: CompareSchool[]
  matchHighlights: MatchHighlights
  isPremium: boolean
}

export default function CompareTable({
  schools,
  matchHighlights,
  isPremium,
}: CompareTableProps) {
  return (
    <>
      {/* 生活負担セクション */}
      <SectionHeader icon="/images/icons/icon5.png" label="生活負担" />
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
        <CompareRow
          label="給食・弁当"
          schools={schools}
          getValue={(s) =>
            mealTypeLabel[s.lifeBurden.mealType] ?? s.lifeBurden.mealType
          }
          highlightKey="mealType"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="持ち物"
          schools={schools}
          getValue={(s) => s.lifeBurden.itemBurdenDetail}
          highlightKey="itemBurdenDetail"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="おむつ対応"
          schools={schools}
          getValue={(s) =>
            s.lifeBurden.diaperSupport
              ? (diaperLabel[s.lifeBurden.diaperSupport] ??
                s.lifeBurden.diaperSupport)
              : 'なし'
          }
          highlightKey="diaperSupport"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="布団対応"
          schools={schools}
          getValue={(s) =>
            s.lifeBurden.futonSupport
              ? (futonLabel[s.lifeBurden.futonSupport] ??
                s.lifeBurden.futonSupport)
              : 'なし'
          }
          highlightKey="futonSupport"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
          isLast
        />
      </div>

      {/* 時間負担セクション */}
      <SectionHeader icon="/images/icons/icon6.png" label="時間負担" />
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
        <CompareRow
          label={`延長保育\nの時間`}
          schools={schools}
          getValue={(s) => s.timeBurden.extendedCareTime ?? 'なし'}
          highlightKey="extendedCare"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label={`延長保育\n利用者`}
          schools={schools}
          getValue={(s) => s.timeBurden.extendedCareUsage ?? 'なし'}
          highlightKey={null}
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="平日行事"
          schools={schools}
          getValue={(s) => s.timeBurden.weekdayEvents}
          highlightKey="weekdayEvents"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="保護者会"
          schools={schools}
          getValue={(s) => s.timeBurden.parentAssociationFrequency}
          highlightKey="parentAssociationFrequency"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
          isLast
        />
      </div>
    </>
  )
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image
          src={icon}
          alt={label}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      <p className="font-medium text-gray-800 text-base">{label}</p>
    </div>
  )
}

type CompareRowProps = {
  label: string
  schools: CompareSchool[]
  getValue: (school: CompareSchool) => string
  highlightKey: string | null
  matchHighlights: MatchHighlights
  isPremium: boolean
  isLast?: boolean
}

function CompareRow({
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
            className={`flex-1 px-2 py-3 flex items-center justify-center border-l border-gray-200 ${
              isMatch ? 'bg-primary-light' : ''
            }`}
          >
            <p
              className={`text-xs text-center ${isMatch ? 'font-bold text-primary' : 'text-gray-800'}`}
            >
              {getValue(school)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export type { CompareSchool, MatchHighlights }
