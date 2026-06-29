// 園詳細画面のセクション群（毎日の準備・仕事との両立・サポート情報・園の特徴）
// src/components/school/SchoolDetailSections.tsx
import Image from 'next/image'

type SupportInfo = {
  isLocked: boolean
  contactBookType: string | null
  absenceContactMethod: string | null
  lessons: string | null
  allergySupport: string | null
}

type SchoolDetailSectionsProps = {
  mealType: string
  itemBurdenLevel: string
  itemBurdenDetail: string | null
  diaperSupport: string | null
  futonSupport: string | null
  extendedCareHours: string | null
  extendedCareUsage: string
  weekdayEventsLevel: string
  weekdayEvents: string | null
  parentAssociationLevel: string
  parentAssociationFrequency: string | null
  description: string | null
  supportInfo: SupportInfo
  isLoggedIn: boolean
  supabaseUser: boolean
  onShowRegisterModal: () => void
  onShowPremiumModal: () => void
}

const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  LUNCH_BOX: '弁当あり',
  MIXED: '給食・弁当併用',
  BOTH: '給食・弁当併用',
}

const burdenLabel: Record<string, string> = {
  LOW: '少ない',
  MIDDLE: '普通',
  MEDIUM: '普通',
  HIGH: '多い',
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function SectionHeader({
  src,
  alt,
  label,
}: {
  src: string
  alt: string
  label: string
}) {
  return (
    <h2 className="font-bold text-base text-gray-700 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
      <Image src={src} alt={alt} width={24} height={24} />
      {label}
    </h2>
  )
}

export default function SchoolDetailSections({
  mealType,
  itemBurdenLevel,
  itemBurdenDetail,
  diaperSupport,
  futonSupport,
  extendedCareHours,
  extendedCareUsage,
  weekdayEventsLevel,
  weekdayEvents,
  parentAssociationLevel,
  parentAssociationFrequency,
  description,
  supportInfo,
  supabaseUser,
  onShowRegisterModal,
  onShowPremiumModal,
}: SchoolDetailSectionsProps) {
  return (
    <>
      {/* 毎日の準備 */}
      <section className="mt-6">
        <SectionHeader
          src="/images/icon5.png"
          alt="毎日の準備"
          label="毎日の準備"
        />
        <div className="flex flex-col gap-2">
          <DetailRow
            label="給食・弁当"
            value={mealTypeLabel[mealType] ?? mealType}
          />
          <DetailRow
            label="持ち物"
            value={
              itemBurdenDetail ??
              burdenLabel[itemBurdenLevel] ??
              itemBurdenLevel
            }
          />
          {diaperSupport && (
            <DetailRow label="おむつ対応" value={diaperSupport} />
          )}
          {futonSupport && <DetailRow label="布団対応" value={futonSupport} />}
        </div>
      </section>

      {/* 仕事との両立 */}
      <section className="mt-6">
        <SectionHeader
          src="/images/icon6.png"
          alt="仕事との両立"
          label="仕事との両立"
        />
        <div className="flex flex-col gap-2">
          {extendedCareHours && (
            <DetailRow label="延長保育の時間" value={extendedCareHours} />
          )}
          <DetailRow label="延長保育利用者" value={extendedCareUsage} />
          <DetailRow
            label="平日行事"
            value={
              weekdayEvents ??
              burdenLabel[weekdayEventsLevel] ??
              weekdayEventsLevel
            }
          />
          <DetailRow
            label="保護者会"
            value={
              parentAssociationFrequency ??
              burdenLabel[parentAssociationLevel] ??
              parentAssociationLevel
            }
          />
        </div>
      </section>

      {/* サポート情報 */}
      <section className="mt-6">
        <SectionHeader
          src="/images/icon7.png"
          alt="サポート情報"
          label="サポート情報"
        />
        {supportInfo.isLocked ? (
          <div className="relative">
            <div className="flex flex-col gap-2 select-none">
              {['連絡帳', '欠席連絡方法', '園内習い事', 'アレルギー対応'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center py-1 border-b border-gray-100"
                  >
                    <span className="text-sm text-gray-500">{item}</span>
                    <span className="text-sm text-gray-200 blur-sm">
                      ▓▓▓▓▓▓
                    </span>
                  </div>
                )
              )}
            </div>
            <button
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-lg"
              onClick={() => {
                if (!supabaseUser) {
                  onShowRegisterModal()
                } else {
                  onShowPremiumModal()
                }
              }}
            >
              <Image
                src="/images/icon9.png"
                alt="ロック"
                width={40}
                height={40}
                className="mb-2"
              />
              <span className="text-sm font-bold text-gray-600 text-center">
                プレミアムユーザーに
                <br />
                登録すれば閲覧可能
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {supportInfo.contactBookType && (
              <DetailRow
                label="連絡帳"
                value={
                  contactBookLabel[supportInfo.contactBookType] ??
                  supportInfo.contactBookType
                }
              />
            )}
            {supportInfo.absenceContactMethod && (
              <DetailRow
                label="欠席連絡方法"
                value={
                  absenceContactLabel[supportInfo.absenceContactMethod] ??
                  supportInfo.absenceContactMethod
                }
              />
            )}
            {supportInfo.lessons && (
              <DetailRow label="園内習い事" value={supportInfo.lessons} />
            )}
            {supportInfo.allergySupport && (
              <DetailRow
                label="アレルギー対応"
                value={supportInfo.allergySupport}
              />
            )}
          </div>
        )}
      </section>

      {/* 園の特徴 */}
      <section className="mt-6">
        <SectionHeader
          src="/images/icon8.png"
          alt="園の特徴"
          label="園の特徴"
        />
        {description ? (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        ) : (
          <p className="text-sm text-gray-400">情報がありません</p>
        )}
      </section>
    </>
  )
}
