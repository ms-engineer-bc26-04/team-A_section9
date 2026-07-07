// レーダーチャートコンポーネントのテスト
// src/__tests__/components/compare/BurdenRadarChart.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import BurdenRadarChart, {
  ChartSchool,
} from '@/components/compare/BurdenRadarChart'
import { vi } from 'vitest'

// recharts本体はjsdom上で実サイズを要求するため描画できない。
// ここではデータ変換とカスタムtick関数のロジックを検証したいので、
// 必要なぶんだけ軽量なモックに差し替える。
type TickProps = {
  x: number
  y: number
  cx: number
  cy: number
  textAnchor: 'start' | 'middle' | 'end'
  payload: { value: string }
}

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  RadarChart: (props: { data: unknown; children: ReactNode }) => (
    <div data-testid="radar-chart">
      <div data-testid="chart-data">{JSON.stringify(props.data)}</div>
      {props.children}
    </div>
  ),
  Radar: (props: { name: string; strokeDasharray?: string }) => (
    <div
      data-testid={`radar-${props.name}`}
      data-stroke-dasharray={props.strokeDasharray ?? ''}
    />
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  PolarAngleAxis: (props: { tick: (p: TickProps) => ReactNode }) => {
    // AXESに実在するラベル2つ＋マップに無いラベル1つを渡し、
    // 2行分割・1行フォールバックの両方の分岐を検証する
    const samples: TickProps[] = [
      {
        x: 100,
        y: 20,
        cx: 100,
        cy: 100,
        textAnchor: 'middle',
        payload: { value: '生活のしやすさ' },
      },
      {
        x: 200,
        y: 100,
        cx: 100,
        cy: 100,
        textAnchor: 'start',
        payload: { value: '時間的な余裕' },
      },
      {
        x: 100,
        y: 100,
        cx: 100,
        cy: 100,
        textAnchor: 'middle',
        payload: { value: '未知のラベル' },
      },
    ]

    return (
      <div data-testid="polar-angle-axis">
        {samples.map((sample, i) => (
          <svg key={i} data-testid={`tick-${i}`}>
            {props.tick(sample)}
          </svg>
        ))}
      </div>
    )
  },
}))

const makeSchool = (overrides: Partial<ChartSchool> = {}): ChartSchool => ({
  id: '1',
  name: 'さくら保育園',
  lifeBurdenLevel: 3,
  timeBurdenLevel: 2,
  itemBurdenLevel: 1,
  weekdayEventsLevel: 3,
  parentAssociationLevel: 2,
  matchCount: 0,
  ...overrides,
})

describe('BurdenRadarChart', () => {
  it('凡例に各園の名前を表示する', () => {
    const schools = [
      makeSchool({ id: '1', name: 'さくら保育園' }),
      makeSchool({ id: '2', name: 'ひまわり保育園' }),
    ]

    render(<BurdenRadarChart schools={schools} />)

    expect(screen.getByText('さくら保育園')).toBeInTheDocument()
    expect(screen.getByText('ひまわり保育園')).toBeInTheDocument()
  })

  it('1つ目の園は実線、2つ目は破線、3つ目は点線の凡例スタイルになる', () => {
    const schools = [
      makeSchool({ id: '1', name: '園A' }),
      makeSchool({ id: '2', name: '園B' }),
      makeSchool({ id: '3', name: '園C' }),
    ]

    const { container } = render(<BurdenRadarChart schools={schools} />)

    const swatches = container.querySelectorAll('span.border-t-2')
    expect(swatches[0]).toHaveStyle({ borderStyle: 'solid' })
    expect(swatches[1]).toHaveStyle({ borderStyle: 'dashed' })
    expect(swatches[2]).toHaveStyle({ borderStyle: 'dotted' })
  })

  it('Radarコンポーネントにも同じ線種(strokeDasharray)が渡る', () => {
    const schools = [
      makeSchool({ id: '1', name: '園A' }),
      makeSchool({ id: '2', name: '園B' }),
      makeSchool({ id: '3', name: '園C' }),
    ]

    render(<BurdenRadarChart schools={schools} />)

    expect(screen.getByTestId('radar-園A')).toHaveAttribute(
      'data-stroke-dasharray',
      ''
    )
    expect(screen.getByTestId('radar-園B')).toHaveAttribute(
      'data-stroke-dasharray',
      '6 4'
    )
    expect(screen.getByTestId('radar-園C')).toHaveAttribute(
      'data-stroke-dasharray',
      '2 4'
    )
  })

  it('RadarChartに渡すデータが5軸ぶん、各園の値を含んで生成される', () => {
    const school = makeSchool({
      name: 'さくら保育園',
      lifeBurdenLevel: 3,
      timeBurdenLevel: 2,
      itemBurdenLevel: 1,
      weekdayEventsLevel: 3,
      parentAssociationLevel: 2,
    })

    render(<BurdenRadarChart schools={[school]} />)

    const chartData = JSON.parse(
      screen.getByTestId('chart-data').textContent ?? '[]'
    )

    expect(chartData).toHaveLength(5)
    expect(chartData[0]).toMatchObject({
      subject: '生活のしやすさ',
      さくら保育園: 3,
    })
    expect(chartData[1]).toMatchObject({
      subject: '時間的な余裕',
      さくら保育園: 2,
    })
  })

  it('2行ラベル（AXESに存在する値）は2つのtspanに分割される', () => {
    render(<BurdenRadarChart schools={[makeSchool()]} />)

    const tick0 = screen.getByTestId('tick-0')
    const tspans = tick0.querySelectorAll('tspan')

    expect(tspans).toHaveLength(2)
    expect(tspans[0].textContent).toBe('生活の')
    expect(tspans[1].textContent).toBe('しやすさ')
  })

  it('「時間的な余裕」も指定した位置（時間的な／余裕）で2行に分割される', () => {
    render(<BurdenRadarChart schools={[makeSchool()]} />)

    const tick1 = screen.getByTestId('tick-1')
    const tspans = tick1.querySelectorAll('tspan')

    expect(tspans).toHaveLength(2)
    expect(tspans[0].textContent).toBe('時間的な')
    expect(tspans[1].textContent).toBe('余裕')
  })

  it('マップに無いラベルは1行のtspanでそのまま表示される（フォールバック）', () => {
    render(<BurdenRadarChart schools={[makeSchool()]} />)

    const tick2 = screen.getByTestId('tick-2')
    const tspans = tick2.querySelectorAll('tspan')

    expect(tspans).toHaveLength(1)
    expect(tspans[0].textContent).toBe('未知のラベル')
  })

  it('注釈文言を表示する', () => {
    render(<BurdenRadarChart schools={[makeSchool()]} />)

    expect(
      screen.getByText(
        '※チャートが大きいほど、負担が少なく過ごしやすい傾向です'
      )
    ).toBeInTheDocument()
  })
})
