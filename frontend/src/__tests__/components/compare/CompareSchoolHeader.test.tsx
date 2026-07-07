// 比較画面の園画像・名前ヘッダーコンポーネントのテスト
// src/__test__/components/compare/CompareSchoolHeader.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompareSchoolHeader from '@/components/compare/CompareSchoolHeader'
import type { CompareSchool } from '@/components/compare/compareTypes'

const makeSchool = (overrides: Partial<CompareSchool> = {}): CompareSchool => ({
  id: '1',
  name: 'たんぽぽ第二保育園',
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
    itemBurdenDetail: '',
    diaperSupport: null,
    futonSupport: null,
  },
  timeBurden: {
    extendedCareTime: null,
    extendedCareUsage: '',
    weekdayEvents: '',
    parentAssociationFrequency: '',
  },
  supportInfo: null,
  ...overrides,
})

describe('CompareSchoolHeader', () => {
  it('各園の名前へのリンクが表示される', () => {
    const schools = [
      makeSchool({ id: '1' }),
      makeSchool({ id: '2', name: 'ひまわり保育園' }),
    ]

    render(<CompareSchoolHeader schools={schools} />)

    const links = screen.getAllByRole('link')
    // 画像・名前でそれぞれLinkがあるため、1園あたり2つ（画像用・名前用）
    expect(links.length).toBeGreaterThanOrEqual(schools.length)
    expect(links[0]).toHaveAttribute('href', '/schools/1')
  })

  it('imageUrlが無い園は「No Image」と表示する', () => {
    render(<CompareSchoolHeader schools={[makeSchool({ imageUrl: null })]} />)

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('imageUrlがある園は画像を表示する', () => {
    render(
      <CompareSchoolHeader
        schools={[makeSchool({ imageUrl: '/school-images/1.png' })]}
      />
    )

    expect(screen.queryByText('No Image')).not.toBeInTheDocument()
    const img = screen.getByAltText('たんぽぽ第二保育園') as HTMLImageElement
    expect(img.src).toContain(encodeURIComponent('/school-images/1.png'))
  })
})
