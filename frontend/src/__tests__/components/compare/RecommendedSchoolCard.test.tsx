// あなたにおすすめカードのテスト
// src/__tests__/components/compare/RecommendedSchoolCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecommendedSchoolCard from '@/components/compare/RecommendedSchoolCard'
import type { ChartSchool } from '@/components/compare/BurdenRadarChart'

const makeSchool = (overrides: Partial<ChartSchool> = {}): ChartSchool => ({
  id: '1',
  name: 'さくら保育園',
  lifeBurdenLevel: 3,
  timeBurdenLevel: 3,
  itemBurdenLevel: 3,
  weekdayEventsLevel: 3,
  parentAssociationLevel: 3,
  matchCount: 0,
  ...overrides,
})

describe('RecommendedSchoolCard', () => {
  it('schoolsが空の場合は何も表示しない', () => {
    const { container } = render(<RecommendedSchoolCard schools={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('全園のmatchCountが0の場合は何も表示しない', () => {
    const schools = [
      makeSchool({ id: '1', matchCount: 0 }),
      makeSchool({ id: '2', matchCount: 0 }),
    ]

    const { container } = render(<RecommendedSchoolCard schools={schools} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('matchCountが最大の園だけをおすすめとして表示する', () => {
    const schools = [
      makeSchool({ id: '1', name: 'さくら保育園', matchCount: 2 }),
      makeSchool({ id: '2', name: 'ひまわり保育園', matchCount: 5 }),
      makeSchool({ id: '3', name: 'たんぽぽ保育園', matchCount: 1 }),
    ]

    render(<RecommendedSchoolCard schools={schools} />)

    expect(screen.getByText('あなたにおすすめ')).toBeInTheDocument()
    expect(screen.getByText(/ひまわり保育園/)).toBeInTheDocument()
    expect(screen.queryByText(/さくら保育園/)).not.toBeInTheDocument()
    expect(screen.queryByText(/たんぽぽ保育園/)).not.toBeInTheDocument()
  })

  it('matchCountが同数で並んだ園は「・」区切りですべて表示する', () => {
    const schools = [
      makeSchool({ id: '1', name: 'さくら保育園', matchCount: 3 }),
      makeSchool({ id: '2', name: 'ひまわり保育園', matchCount: 3 }),
    ]

    render(<RecommendedSchoolCard schools={schools} />)

    expect(screen.getByText(/さくら保育園・ひまわり保育園/)).toBeInTheDocument()
  })
})
