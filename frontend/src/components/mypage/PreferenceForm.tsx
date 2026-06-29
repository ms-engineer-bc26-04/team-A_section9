// 希望条件フォーム（チェックボックス群）
// src/components/mypage/PreferenceForm.tsx
import CheckItem from './CheckItem'

type PreferenceFormProps = {
  hasLunch: boolean
  diaperDisposal: boolean
  noBedding: boolean
  extendedCare: boolean
  noWeekdayEvents: boolean
  noPTA: boolean
  hasClub: boolean
  allergySupport: boolean
  onChange: (key: string, value: boolean) => void
}

export default function PreferenceForm({
  hasLunch,
  diaperDisposal,
  noBedding,
  extendedCare,
  noWeekdayEvents,
  noPTA,
  hasClub,
  allergySupport,
  onChange,
}: PreferenceFormProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-800 mb-4">希望条件</h2>

      {/* 生活負担 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
          生活負担
        </h3>
        <div className="flex flex-col gap-3">
          <CheckItem
            label="毎日給食"
            checked={hasLunch}
            onChange={(v) => onChange('hasLunch', v)}
          />
          <CheckItem
            label="おむつ園処理あり"
            checked={diaperDisposal}
            onChange={(v) => onChange('diaperDisposal', v)}
          />
          <CheckItem
            label="布団負担少なめ"
            checked={noBedding}
            onChange={(v) => onChange('noBedding', v)}
          />
        </div>
      </div>

      {/* 時間負担 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
          時間負担
        </h3>
        <div className="flex flex-col gap-3">
          <CheckItem
            label="延長保育利用者が多い"
            checked={extendedCare}
            onChange={(v) => onChange('extendedCare', v)}
          />
          <CheckItem
            label="平日行事少なめ"
            checked={noWeekdayEvents}
            onChange={(v) => onChange('noWeekdayEvents', v)}
          />
          <CheckItem
            label="保護者会少なめ"
            checked={noPTA}
            onChange={(v) => onChange('noPTA', v)}
          />
        </div>
      </div>

      {/* 補助情報 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">
          補助情報
        </h3>
        <div className="flex flex-col gap-3">
          <CheckItem
            label="園内習い事あり"
            checked={hasClub}
            onChange={(v) => onChange('hasClub', v)}
          />
          <CheckItem
            label="アレルギー対応あり"
            checked={allergySupport}
            onChange={(v) => onChange('allergySupport', v)}
          />
        </div>
      </div>
    </div>
  )
}
