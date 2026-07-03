// 負担バランスのレーダーチャートコンポーネント
// src/components/compare/BurdenRadarChart.tsx
'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

type ChartSchool = {
  id: string
  name: string
  lifeBurdenLevel: number
  timeBurdenLevel: number
  itemBurdenLevel: number
  weekdayEventsLevel: number
  parentAssociationLevel: number
  matchCount: number
}

type BurdenRadarChartProps = {
  schools: ChartSchool[]
}

const CHART_COLORS = ['#A0CD83', '#73C0FF', '#FF8C8C']
// 追加：値が同じ園同士が重なった時に判別できるよう、色に加えて線種も分ける
const STROKE_DASHARRAYS: (string | undefined)[] = [undefined, '6 4', '2 4']
const LEGEND_BORDER_STYLES: ('solid' | 'dashed' | 'dotted')[] = [
  'solid',
  'dashed',
  'dotted',
]

// 修正：項目名を「〜の少なさ／しやすさ」に統一（値が大きい＝チャートが大きいほど良い、という向きに合わせた表現）
// 追加：linesで改行位置を明示的に指定（「の」の有無に関わらず狙った位置で2行にできる）
const AXES = [
  {
    key: 'lifeBurdenLevel',
    label: '生活のしやすさ',
    lines: ['生活の', 'しやすさ'],
  },
  {
    key: 'timeBurdenLevel',
    label: '時間的な余裕',
    lines: ['時間的な', '余裕'],
  },
  {
    key: 'itemBurdenLevel',
    label: '持ち物の少なさ',
    lines: ['持ち物の', '少なさ'],
  },
  {
    key: 'weekdayEventsLevel',
    label: '平日行事の少なさ',
    lines: ['平日行事の', '少なさ'],
  },
  {
    key: 'parentAssociationLevel',
    label: '保護者会の少なさ',
    lines: ['保護者会の', '少なさ'],
  },
]

// 追加：チャート描画時にラベル文字列から改行位置を引けるようにするマップ
const LABEL_LINES_MAP: Record<string, string[]> = Object.fromEntries(
  AXES.map((axis) => [axis.label, axis.lines])
)

export default function BurdenRadarChart({ schools }: BurdenRadarChartProps) {
  const chartData = AXES.map((axis) => {
    const entry: Record<string, string | number> = { subject: axis.label }
    schools.forEach((s) => {
      entry[s.name] = s[axis.key as keyof ChartSchool] as number
    })
    return entry
  })

  return (
    <>
      {/* 凡例 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {schools.map((school, i) => (
          <div key={school.id} className="flex items-center gap-1">
            <span
              className="inline-block w-6 h-0 border-t-2"
              style={{
                borderColor: CHART_COLORS[i],
                borderStyle: LEGEND_BORDER_STYLES[i],
              }}
            />
            <span className="text-xs text-gray-700">{school.name}</span>
          </div>
        ))}
      </div>

      {/* レーダーチャート */}
      {/* 修正：
          ・max-w-[380px] mx-auto で幅を固定 → PCで横に伸びきってラベル位置がずれるのを防止（レスポンシブ対応）
          ・h-80(320px) → h-[420px] に拡大（390x844のスマホ幅を基準に調整） */}
      <div className="w-full max-w-[380px] mx-auto h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            outerRadius="68%"
            margin={{ top: 25, right: 30, bottom: 55, left: 30 }}
          >
            <PolarGrid />
            {/* 修正：目盛りをデータ範囲(0〜3)ちょうどに固定し、データが届かない余分な外側の5角形を除去 */}
            <PolarRadiusAxis
              domain={[0, 3]}
              tickCount={4}
              tick={false}
              axisLine={false}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => {
                // 修正：x座標のしきい値による自前判定をやめ、rechartsが角度から算出する
                // textAnchorをそのまま使う（画面幅が変わっても向きがずれない）
                const { x, y, cx, cy, textAnchor, payload } =
                  props as unknown as {
                    x: number
                    y: number
                    cx: number
                    cy: number
                    textAnchor: 'start' | 'middle' | 'end'
                    payload: { value: string }
                  }

                // 追加：中心(cx,cy)から見た方向へラベルを少し押し出し、チャート本体との隙間を作る
                const LABEL_OFFSET = 12
                const dx = x - cx
                const dy = y - cy
                const dist = Math.sqrt(dx * dx + dy * dy) || 1
                const lx = x + (dx / dist) * LABEL_OFFSET
                const ly = y + (dy / dist) * LABEL_OFFSET

                const value = payload.value
                const lines = LABEL_LINES_MAP[value] ?? [value]
                if (lines.length === 2) {
                  return (
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={textAnchor}
                      fill="#555"
                      fontSize={11}
                    >
                      {/* 修正：2行ラベルをアンカー位置の上下にバランス良く配置し、チャート本体への食い込みを軽減 */}
                      <tspan x={lx} dy="-6">
                        {lines[0]}
                      </tspan>
                      <tspan x={lx} dy="14">
                        {lines[1]}
                      </tspan>
                    </text>
                  )
                }
                return (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={textAnchor}
                    fill="#555"
                    fontSize={11}
                  >
                    <tspan>{value}</tspan>
                  </text>
                )
              }}
            />
            {schools.map((school, i) => (
              <Radar
                key={school.id}
                name={school.name}
                dataKey={school.name}
                stroke={CHART_COLORS[i]}
                strokeWidth={2}
                strokeDasharray={STROKE_DASHARRAYS[i]}
                fill={CHART_COLORS[i]}
                fillOpacity={0.15}
                dot={{ r: 3, fill: CHART_COLORS[i], strokeWidth: 0 }}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 注釈 */}
      {/* 修正：値の向きを反転（LOW=負担小=値大）させたため、文言も「チャートが大きいほど良い」に変更 */}
      <p className="text-[10px] text-gray-400 text-center mb-6">
        ※チャートが大きいほど、負担が少なく過ごしやすい傾向です
      </p>
    </>
  )
}

export type { ChartSchool }
