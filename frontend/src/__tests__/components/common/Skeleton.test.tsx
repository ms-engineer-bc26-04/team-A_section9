// src/__tests__/components/common/Skeleton.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Skeleton, {
  SchoolCardSkeleton,
  SchoolDetailSkeleton,
  ComparePageSkeleton,
  CompareChartSkeleton,
  MyPageSkeleton,
  EditPageSkeleton,
} from '@/components/common/Skeleton'

describe('Skeleton', () => {
  it('classNameを渡さない場合でもエラーなく表示される', () => {
    const { container } = render(<Skeleton />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('classNameを渡した場合、そのクラスが反映される', () => {
    const { container } = render(<Skeleton className="w-10 h-10" />)
    const el = container.querySelector('.animate-pulse')

    expect(el).toHaveClass('w-10')
    expect(el).toHaveClass('h-10')
  })
})

describe('SchoolCardSkeleton', () => {
  it('エラーなく表示される', () => {
    const { container } = render(<SchoolCardSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('SchoolDetailSkeleton', () => {
  it('エラーなく表示される', () => {
    const { container } = render(<SchoolDetailSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('ComparePageSkeleton', () => {
  it('schoolCountを指定しない場合、デフォルトの2件分表示される', () => {
    const { container } = render(<ComparePageSkeleton />)

    // 園ヘッダー部分の要素数を確認（w-full h-20 rounded-xlを持つ要素）
    const items = container.querySelectorAll('.h-20')
    expect(items).toHaveLength(2)
  })

  it('schoolCountを指定した場合、その件数分表示される', () => {
    const { container } = render(<ComparePageSkeleton schoolCount={3} />)

    const items = container.querySelectorAll('.h-20')
    expect(items).toHaveLength(3)
  })
})

describe('CompareChartSkeleton', () => {
  it('エラーなく表示される', () => {
    const { container } = render(<CompareChartSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('schoolCountを指定した場合、凡例の件数が変わる', () => {
    const { container } = render(<CompareChartSkeleton schoolCount={3} />)
    const legendItems = container.querySelectorAll('.w-6.h-0\\.5')

    expect(legendItems).toHaveLength(3)
  })
})

describe('MyPageSkeleton', () => {
  it('エラーなく表示される', () => {
    const { container } = render(<MyPageSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('EditPageSkeleton', () => {
  it('エラーなく表示される', () => {
    const { container } = render(<EditPageSkeleton />)

    expect(container.firstChild).toBeInTheDocument()
  })
})
