// 選択した2〜3園を横並びで比較表示するテーブル
// src/components/compare/CompareTable.tsx
import Image from 'next/image'

type SupportInfo = {
  contactBookType: string | null
  absenceContactMethod: string | null
  lessons: string | null
  allergySupport: string | null
}

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
  supportInfo?: SupportInfo | null
}

type MatchHighlights = {
  [schoolId: string]: {
    mealType: boolean
    itemBurdenLevel: boolean
    diaperSupport: boolean
    futonSupport: boolean
    extendedCare: boolean
    lessons: boolean
    allergySupport: boolean
    weekdayEventsLevel: boolean
    parentAssociationLevel: boolean
  }
} | null

const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  BOTH: '給食・弁当併用',
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
const contactBookLabel: Record<string, string> = {
  APP: 'アプリ',
  PAPER: '手書き',
  BOTH: 'アプリ・手書き併用',
}
const absenceContactLabel: Record<string, string> = {
  APP: 'アプリ',
  PHONE: '電話',
  BOTH: 'アプリ・電話',
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
  // 各園の一致数を計算
  const matchCounts = schools.reduce<Record<string, number>>((acc, school) => {
    const highlights = matchHighlights?.[String(school.id)]
    if (!highlights) {
      acc[school.id] = 0
      return acc
    }
    acc[school.id] = Object.values(highlights).filter(Boolean).length
    return acc
  }, {})

  // 選択中の希望条件ラベル（一致しているキーから生成）
  const matchedConditionLabels: Record<string, string> = {
    mealType: '毎日給食',
    diaperSupport: 'おむつ園処理あり',
    futonSupport: '布団負担少なめ',
    extendedCare: '延長保育利用者が多い',
    lessons: '園内習い事あり',
    allergySupport: 'アレルギー対応あり',
    weekdayEventsLevel: '平日行事少なめ',
    parentAssociationLevel: '保護者会少なめ',
  }

  // いずれかの園でtrueになっている条件を「選択中の希望条件」として表示
  const activeConditions = matchHighlights
    ? Object.keys(matchedConditionLabels).filter((key) =>
        Object.values(matchHighlights).some(
          (h) => h[key as keyof typeof h] === true
        )
      )
    : []

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
          highlightKey="itemBurdenLevel"
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
          highlightKey={null}
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label={`延長保育\n利用者`}
          schools={schools}
          getValue={(s) => s.timeBurden.extendedCareUsage ?? 'なし'}
          highlightKey="extendedCare"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="平日行事"
          schools={schools}
          getValue={(s) => s.timeBurden.weekdayEvents}
          highlightKey="weekdayEventsLevel"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
        />
        <CompareRow
          label="保護者会"
          schools={schools}
          getValue={(s) => s.timeBurden.parentAssociationFrequency}
          highlightKey="parentAssociationLevel"
          matchHighlights={matchHighlights}
          isPremium={isPremium}
          isLast
        />
      </div>

      {/* サポート情報セクション（プレミアムのみ） */}
      {isPremium && (
        <>
          <SectionHeader icon="/images/icons/icon7.png" label="サポート情報" />
          <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
            <CompareRow
              label="連絡帳"
              schools={schools}
              getValue={(s) =>
                s.supportInfo?.contactBookType
                  ? (contactBookLabel[s.supportInfo.contactBookType] ??
                    s.supportInfo.contactBookType)
                  : '未対応'
              }
              highlightKey={null}
              matchHighlights={matchHighlights}
              isPremium={isPremium}
            />
            <CompareRow
              label="欠席連絡"
              schools={schools}
              getValue={(s) =>
                s.supportInfo?.absenceContactMethod
                  ? (absenceContactLabel[s.supportInfo.absenceContactMethod] ??
                    s.supportInfo.absenceContactMethod)
                  : '未対応'
              }
              highlightKey={null}
              matchHighlights={matchHighlights}
              isPremium={isPremium}
            />
            <CompareRow
              label="習い事"
              schools={schools}
              getValue={(s) => s.supportInfo?.lessons ?? 'なし'}
              highlightKey="lessons"
              matchHighlights={matchHighlights}
              isPremium={isPremium}
            />
            <CompareRow
              label={`アレルギー\n対応`}
              schools={schools}
              getValue={(s) => s.supportInfo?.allergySupport ?? 'なし'}
              highlightKey="allergySupport"
              matchHighlights={matchHighlights}
              isPremium={isPremium}
              isLast
            />
          </div>
        </>
      )}

      {/* あなたの希望条件との一致（プレミアムかつmatchHighlightsがある場合） */}
      {isPremium && matchHighlights && (
        <>
          <SectionHeader
            icon="/images/icons/icon8.png"
            label="あなたの希望条件との一致"
          />
          <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
            <div className="flex">
              <div className="w-20 flex-shrink-0 px-2 py-3 flex items-center">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-tight">
                  希望との{'\n'}一致
                </p>
              </div>
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="flex-1 px-2 py-3 flex items-center justify-center border-l border-gray-200"
                >
                  <p className="text-sm font-bold text-gray-800">
                    {matchCounts[school.id]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 選択中の希望条件 */}
          {activeConditions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <p className="text-xs text-gray-500">選択中の希望条件：</p>
              {activeConditions.map((key) => (
                <span
                  key={key}
                  className="text-xs text-gray-600 flex items-center gap-1"
                >
                  <span className="text-[#A0CD83]">✓</span>
                  {matchedConditionLabels[key]}
                </span>
              ))}
            </div>
          )}
        </>
      )}
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
            className={`flex-1 px-2 py-3 flex items-center justify-center border-l border-gray-200`}
            style={isMatch ? { backgroundColor: 'rgba(255,255,154,0.3)' } : {}}
          >
            <p
              className={`text-xs text-center ${isMatch ? 'font-bold text-gray-800' : 'text-gray-800'}`}
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
