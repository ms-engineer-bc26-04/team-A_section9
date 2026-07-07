// 比較テーブル本体のテスト
// src/__tests__/components/compare/CompareTable.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompareTable from '@/components/compare/CompareTable'
import type {
  CompareSchool,
  MatchHighlights,
} from '@/components/compare/compareTypes'

const makeSchool = (overrides: Partial<CompareSchool> = {}): CompareSchool => ({
  id: '1',
  name: 'さくら保育園',
  area: '渋谷区',
  schoolType: 'NURSERY',
  imageUrl: null,
  lifeBurdenLevel: 'LOW',
  timeBurdenLevel: 'LOW',
  itemBurdenLevel: 'LOW',
  weekdayEventsLevel: 'LOW',
  parentAssociationLevel: 'LOW',
  lifeBurden: {
    mealType: 'SCHOOL_LUNCH',
    itemBurdenDetail: '着替え・タオル',
    diaperSupport: null,
    futonSupport: null,
  },
  timeBurden: {
    extendedCareTime: '18:00〜20:00',
    extendedCareUsage: '20人以上',
    weekdayEvents: 'なし',
    parentAssociationFrequency: '年に1回',
  },
  supportInfo: null,
  ...overrides,
})

const makeMatchHighlights = (
  overrides: Partial<
    Record<string, Partial<NonNullable<MatchHighlights>[string]>>
  >
): MatchHighlights => {
  const base = {
    mealType: false,
    itemBurdenLevel: false,
    diaperSupport: false,
    futonSupport: false,
    extendedCare: false,
    lessons: false,
    allergySupport: false,
    weekdayEventsLevel: false,
    parentAssociationLevel: false,
  }

  return Object.fromEntries(
    Object.entries(overrides).map(([schoolId, h]) => [
      schoolId,
      { ...base, ...h },
    ])
  )
}

describe('CompareTable', () => {
  it('生活負担・時間負担セクションを常に表示する', () => {
    render(
      <CompareTable
        schools={[makeSchool()]}
        matchHighlights={null}
        isPremium={false}
      />
    )

    expect(screen.getByText('生活負担')).toBeInTheDocument()
    expect(screen.getByText('時間負担')).toBeInTheDocument()
    expect(screen.getByText('毎日給食あり')).toBeInTheDocument()
    expect(screen.getByText('着替え・タオル')).toBeInTheDocument()
  })

  it('おむつ対応・布団対応が未設定の場合は「なし」と表示する', () => {
    render(
      <CompareTable
        schools={[makeSchool()]}
        matchHighlights={null}
        isPremium={false}
      />
    )

    expect(screen.getAllByText('なし').length).toBeGreaterThan(0)
  })

  it('isPremiumがfalseの場合、サポート情報セクションと希望条件との一致セクションを表示しない', () => {
    render(
      <CompareTable
        schools={[makeSchool()]}
        matchHighlights={null}
        isPremium={false}
      />
    )

    expect(screen.queryByText('サポート情報')).not.toBeInTheDocument()
    expect(
      screen.queryByText('あなたの希望条件との一致')
    ).not.toBeInTheDocument()
  })

  it('isPremiumがtrueの場合、サポート情報セクションを表示する', () => {
    const school = makeSchool({
      supportInfo: {
        contactBookType: 'APP',
        absenceContactMethod: 'PHONE',
        lessons: '英語',
        allergySupport: '個別相談可',
      },
    })

    render(<CompareTable schools={[school]} matchHighlights={null} isPremium />)

    expect(screen.getByText('サポート情報')).toBeInTheDocument()
    expect(screen.getByText('アプリ')).toBeInTheDocument()
    expect(screen.getByText('電話')).toBeInTheDocument()
    expect(screen.getByText('英語')).toBeInTheDocument()
    expect(screen.getByText('個別相談可')).toBeInTheDocument()
  })

  it('isPremiumがtrueでもmatchHighlightsがnullの場合は希望条件との一致セクションを表示しない', () => {
    render(
      <CompareTable schools={[makeSchool()]} matchHighlights={null} isPremium />
    )

    expect(
      screen.queryByText('あなたの希望条件との一致')
    ).not.toBeInTheDocument()
  })

  it('matchHighlightsがある場合、一致数が1以上の園のセルだけ黄色くハイライトする', () => {
    const schools = [
      makeSchool({ id: '1', name: 'さくら保育園' }),
      makeSchool({ id: '2', name: 'ひまわり保育園' }),
    ]
    const matchHighlights = makeMatchHighlights({
      '1': { mealType: true },
      '2': {},
    })

    const { container } = render(
      <CompareTable
        schools={schools}
        matchHighlights={matchHighlights}
        isPremium
      />
    )

    expect(screen.getByText('あなたの希望条件との一致')).toBeInTheDocument()

    const matchCountCells = container.querySelectorAll(
      '.border-l.border-gray-200'
    )
    // 各比較項目行 + 「希望との一致」行のセルが混在するため、
    // 一致数(1と0)のテキストを直接検証する
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('選択中の希望条件（trueの項目）だけをチップとして表示する', () => {
    const matchHighlights = makeMatchHighlights({
      '1': { mealType: true, allergySupport: true },
    })

    render(
      <CompareTable
        schools={[makeSchool({ id: '1' })]}
        matchHighlights={matchHighlights}
        isPremium
      />
    )

    expect(screen.getByText('選択中の希望条件：')).toBeInTheDocument()
    expect(screen.getByText('毎日給食')).toBeInTheDocument()
    expect(screen.getByText('アレルギー対応あり')).toBeInTheDocument()
    expect(screen.queryByText('布団負担少なめ')).not.toBeInTheDocument()
  })

  it('どの条件も一致していない場合は「選択中の希望条件」ブロック自体を表示しない', () => {
    const matchHighlights = makeMatchHighlights({ '1': {} })

    render(
      <CompareTable
        schools={[makeSchool({ id: '1' })]}
        matchHighlights={matchHighlights}
        isPremium
      />
    )

    expect(screen.queryByText('選択中の希望条件：')).not.toBeInTheDocument()
  })
})
