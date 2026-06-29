// 負担バランスのレーダーチャートコンポーネント
// src/components/compare/BurdenRadarChart.tsx
'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
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

const CHART_COLORS = ['#A0CD83', '#F5A623', '#FF8C8C']

const AXES = [
  { key: 'lifeBurdenLevel', label: '生活負担' },
  { key: 'timeBurdenLevel', label: '時間負担' },
  { key: 'itemBurdenLevel', label: '持ち物負担' },
  { key: 'weekdayEventsLevel', label: '平日行事の多さ' },
  { key: 'parentAssociationLevel', label: '保護者会の負担' },
]

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
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
        {schools.map((school, i) => (
          <div key={school.id} className="flex items-center gap-1">
            <span
              className="inline-block w-6 h-0.5"
              style={{ backgroundColor: CHART_COLORS[i] }}
            />
            <span className="text-xs text-gray-700">{school.name}</span>
          </div>
        ))}
      </div>

      {/* レーダーチャート */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => {
                const { x, y, payload } = props as {
                  x: number
                  y: number
                  payload: { value: string }
                }
                const value = payload.value
                const lines = value.split('の')
                const anchor = x > 200 ? 'start' : x < 150 ? 'end' : 'middle'
                if (lines.length === 2) {
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={anchor as 'start' | 'end' | 'middle'}
                      fill="#555"
                      fontSize={11}
                    >
                      <tspan x={x} dy="0">
                        {lines[0]}の
                      </tspan>
                      <tspan x={x} dy="14">
                        {lines[1]}
                      </tspan>
                    </text>
                  )
                }
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor as 'start' | 'end' | 'middle'}
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
                fill={CHART_COLORS[i]}
                fillOpacity={0.15}
                dot={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 注釈 */}
      <p className="text-[10px] text-gray-400 text-center mb-6">
        ※チャートが大きいほど負担が大きくなります
      </p>
    </>
  )
}

export type { ChartSchool }
