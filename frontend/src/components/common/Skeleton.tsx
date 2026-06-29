// src/components/common/Skeleton.tsx
// データ取得中に表示するグレーのプレースホルダー

type SkeletonProps = {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

// SchoolCard用（ホーム・検索結果・お気に入り一覧）
export function SchoolCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 border border-gray-200 rounded-xl bg-white">
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// 園詳細画面用
export function SchoolDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto pb-10 animate-pulse">
      {/* 戻るボタン */}
      <div className="px-4 pt-4 mb-2">
        <Skeleton className="h-4 w-10" />
      </div>

      {/* メイン画像 */}
      <Skeleton className="w-full h-48" />

      <div className="px-4 mt-4">
        {/* 園名・住所・タグ */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          </div>
        </div>

        {/* セクション × 3 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="flex justify-between py-1 border-b border-gray-100"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 比較画面用
export function ComparePageSkeleton({
  schoolCount = 2,
}: {
  schoolCount?: number
}) {
  return (
    <div className="animate-pulse">
      {/* スティッキーヘッダー部分 */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-4 w-10 mb-2" />
          <Skeleton className="h-6 w-40 mb-3" />
          {/* 園ヘッダー */}
          <div className="flex gap-2">
            <div className="w-20 flex-shrink-0" />
            {Array.from({ length: schoolCount }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full h-20 rounded-xl" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* テーブル部分 */}
      <div className="px-4 max-w-2xl mx-auto pt-4 space-y-6">
        {[1, 2].map((section) => (
          <div key={section}>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="flex border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-20 flex-shrink-0 px-2 py-3">
                    <Skeleton className="h-3 w-14" />
                  </div>
                  {Array.from({ length: schoolCount }).map((_, col) => (
                    <div
                      key={col}
                      className="flex-1 px-2 py-3 border-l border-gray-100"
                    >
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 比較チャート画面用
export function CompareChartSkeleton({
  schoolCount = 2,
}: {
  schoolCount?: number
}) {
  return (
    <div className="px-4 max-w-2xl mx-auto pb-10 animate-pulse">
      <div className="pt-4 mb-2">
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-6 w-40 mb-1" />
      <Skeleton className="h-3 w-56 mb-6" />

      {/* 凡例 */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Array.from({ length: schoolCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <Skeleton className="w-6 h-0.5" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* レーダーチャート（五角形で表現） */}
      <div className="w-full h-80 flex items-center justify-center mb-2">
        <svg viewBox="0 0 300 300" className="w-full h-full opacity-20">
          {/* グリッド五角形（3段） */}
          {[1, 0.66, 0.33].map((scale, i) => (
            <polygon
              key={i}
              points={Array.from({ length: 5 })
                .map((_, j) => {
                  const angle = (j * 72 - 90) * (Math.PI / 180)
                  const r = 120 * scale
                  return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`
                })
                .join(' ')}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
            />
          ))}
          {/* 軸線 */}
          {Array.from({ length: 5 }).map((_, j) => {
            const angle = (j * 72 - 90) * (Math.PI / 180)
            return (
              <line
                key={j}
                x1="150"
                y1="150"
                x2={150 + 120 * Math.cos(angle)}
                y2={150 + 120 * Math.sin(angle)}
                stroke="#9ca3af"
                strokeWidth="1"
              />
            )
          })}
          {/* ラベルのプレースホルダー */}
          {[
            '生活負担',
            '時間負担',
            '持ち物負担',
            '平日行事の多さ',
            '保護者会の負担',
          ].map((label, j) => {
            const angle = (j * 72 - 90) * (Math.PI / 180)
            const r = 145
            return (
              <text
                key={j}
                x={150 + r * Math.cos(angle)}
                y={150 + r * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* 注釈 */}
      <Skeleton className="h-3 w-48 mx-auto mb-6" />

      {/* おすすめカード */}
      <div className="bg-gray-100 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

// マイページ用
export function MyPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto pb-10 px-4 animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center justify-between pt-4 mb-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* ユーザー情報カード */}
      <div className="bg-gray-200 rounded-xl p-4 flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* 導線リスト */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>

      {/* プランでできること */}
      <Skeleton className="h-4 w-40 mb-3" />
      <div className="space-y-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* プレミアム誘導 */}
      <Skeleton className="w-full h-48 rounded-xl" />
    </div>
  )
}

// プロフィール編集画面用
export function EditPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto pb-10 px-4 animate-pulse">
      <div className="pt-4 mb-4">
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-7 w-40 mb-6" />

      {/* お名前 */}
      <div className="mb-4">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* 住所 */}
      <div className="mb-6">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-12 w-full rounded-lg mb-2" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* 希望条件 */}
      <Skeleton className="h-6 w-24 mb-4" />
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-4">
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 保存ボタン */}
      <Skeleton className="h-12 w-full rounded-full mt-6" />
    </div>
  )
}
