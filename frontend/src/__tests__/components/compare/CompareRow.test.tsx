// 比較テーブルの1行分コンポーネントのテスト
// src/__test__/components/compare/CompareRow.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompareRow from '@/components/compare/CompareRow'
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

describe('CompareRow', () => {
  it('labelと各園の値を表示する', () => {
    const schools = [
      makeSchool({ id: '1' }),
      makeSchool({ id: '2', name: 'ひまわり保育園' }),
    ]

    render(
      <CompareRow
        label="給食・弁当"
        schools={schools}
        getValue={(s) => s.lifeBurden.mealType}
        highlightKey={null}
        matchHighlights={null}
        isPremium={false}
      />
    )

    expect(screen.getByText('給食・弁当')).toBeInTheDocument()
    expect(screen.getAllByText('SCHOOL_LUNCH')).toHaveLength(2)
  })

  it('isPremiumかつhighlightKeyが一致する園のセルだけ黄色くハイライトする', () => {
    const schools = [makeSchool({ id: '1' }), makeSchool({ id: '2' })]
    const matchHighlights: MatchHighlights = {
      '1': {
        mealType: true,
        itemBurdenLevel: false,
        diaperSupport: false,
        futonSupport: false,
        extendedCare: false,
        lessons: false,
        allergySupport: false,
        weekdayEventsLevel: false,
        parentAssociationLevel: false,
      },
      '2': {
        mealType: false,
        itemBurdenLevel: false,
        diaperSupport: false,
        futonSupport: false,
        extendedCare: false,
        lessons: false,
        allergySupport: false,
        weekdayEventsLevel: false,
        parentAssociationLevel: false,
      },
    }

    const { container } = render(
      <CompareRow
        label="給食・弁当"
        schools={schools}
        getValue={(s) => s.lifeBurden.mealType}
        highlightKey="mealType"
        matchHighlights={matchHighlights}
        isPremium
      />
    )

    const cells = container.querySelectorAll('.flex-1')
    expect(cells[0]).toHaveStyle({ backgroundColor: 'rgba(255,255,154,0.3)' })
    expect(cells[1]).not.toHaveStyle({
      backgroundColor: 'rgba(255,255,154,0.3)',
    })
  })

  it('isPremiumがfalseの場合はhighlightKeyが一致していてもハイライトしない', () => {
    const schools = [makeSchool({ id: '1' })]
    const matchHighlights: MatchHighlights = {
      '1': {
        mealType: true,
        itemBurdenLevel: false,
        diaperSupport: false,
        futonSupport: false,
        extendedCare: false,
        lessons: false,
        allergySupport: false,
        weekdayEventsLevel: false,
        parentAssociationLevel: false,
      },
    }

    const { container } = render(
      <CompareRow
        label="給食・弁当"
        schools={schools}
        getValue={(s) => s.lifeBurden.mealType}
        highlightKey="mealType"
        matchHighlights={matchHighlights}
        isPremium={false}
      />
    )

    const cell = container.querySelector('.flex-1')
    expect(cell).not.toHaveStyle({ backgroundColor: 'rgba(255,255,154,0.3)' })
  })

  it('isLastがfalse（デフォルト）の場合は下線ボーダーを表示する', () => {
    const { container } = render(
      <CompareRow
        label="給食・弁当"
        schools={[makeSchool()]}
        getValue={(s) => s.lifeBurden.mealType}
        highlightKey={null}
        matchHighlights={null}
        isPremium={false}
      />
    )

    expect(container.firstChild).toHaveClass('border-b')
  })

  it('isLastがtrueの場合は下線ボーダーを表示しない', () => {
    const { container } = render(
      <CompareRow
        label="給食・弁当"
        schools={[makeSchool()]}
        getValue={(s) => s.lifeBurden.mealType}
        highlightKey={null}
        matchHighlights={null}
        isPremium={false}
        isLast
      />
    )

    expect(container.firstChild).not.toHaveClass('border-b')
  })

  it('「・」を含む値は改行制御(renderWithBreaks)を通しても表示上つながって見える', () => {
    const { container } = render(
      <CompareRow
        label="欠席連絡"
        schools={[makeSchool()]}
        getValue={() => 'アプリ・電話'}
        highlightKey={null}
        matchHighlights={null}
        isPremium={false}
      />
    )

    const valueCell = container.querySelector('.flex-1 p')
    expect(valueCell?.textContent).toBe('アプリ・電話')
  })
})
