// src/__tests__/components/school/SchoolDetailHeader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SchoolDetailHeader from '@/components/school/SchoolDetailHeader'

// next/image のモック（fillなどNext独自propsを無視して<img>として描画）
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// FavoriteButtonは別テストでカバー済みのため、渡されたpropsを確認できる簡易モックに置き換える
vi.mock('@/components/school/FavoriteButton', () => ({
  default: ({
    schoolId,
    isFavorited,
    isLoggedIn,
    onToggle,
  }: {
    schoolId: number
    isFavorited: boolean
    isLoggedIn: boolean
    onToggle: (schoolId: number) => void
  }) => (
    <button
      data-testid="favorite-button"
      data-school-id={schoolId}
      data-favorited={isFavorited}
      data-logged-in={isLoggedIn}
      onClick={() => onToggle(schoolId)}
    >
      お気に入り
    </button>
  ),
}))

const baseProps = {
  id: '123',
  name: 'さくら保育園',
  address: '神奈川県横浜市西区1-2-3',
  phoneNumber: null,
  imageUrl: null,
  schoolType: 'NURSERY',
  tags: [] as string[],
  isFavorited: false,
  isLoggedIn: false,
  onToggleFavorite: vi.fn(),
  onVisit: vi.fn(),
}

describe('SchoolDetailHeader', () => {
  it('imageUrlがある場合はnameをalt属性にした画像を表示する', () => {
    render(
      <SchoolDetailHeader
        {...baseProps}
        imageUrl="/images/schools/sakura.png"
      />
    )

    const image = screen.getByAltText('さくら保育園')
    expect(image).toHaveAttribute('src', '/images/schools/sakura.png')
    expect(screen.queryByText('No Image')).not.toBeInTheDocument()
  })

  it('imageUrlがない場合は「No Image」を表示する', () => {
    render(<SchoolDetailHeader {...baseProps} imageUrl={null} />)

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('園名と住所を表示する', () => {
    render(<SchoolDetailHeader {...baseProps} />)

    expect(
      screen.getByRole('heading', { name: 'さくら保育園' })
    ).toBeInTheDocument()
    expect(screen.getByText('神奈川県横浜市西区1-2-3')).toBeInTheDocument()
  })

  it('phoneNumberは値がある場合のみ表示する', () => {
    const { rerender } = render(
      <SchoolDetailHeader {...baseProps} phoneNumber={null} />
    )
    expect(screen.queryByText(/電話番号/)).not.toBeInTheDocument()

    rerender(<SchoolDetailHeader {...baseProps} phoneNumber="045-123-4567" />)
    expect(screen.getByText('電話番号：045-123-4567')).toBeInTheDocument()
  })

  it('tagsが空の場合はタグ一覧を表示しない', () => {
    render(<SchoolDetailHeader {...baseProps} tags={[]} />)

    // タグに使われるクラスを持つ要素が無いことで判定
    expect(screen.queryByText('駅チカ')).not.toBeInTheDocument()
  })

  it('tagsがある場合はすべてのタグを表示する', () => {
    render(
      <SchoolDetailHeader
        {...baseProps}
        tags={['駅チカ', '園庭あり', '英語教育']}
      />
    )

    expect(screen.getByText('駅チカ')).toBeInTheDocument()
    expect(screen.getByText('園庭あり')).toBeInTheDocument()
    expect(screen.getByText('英語教育')).toBeInTheDocument()
  })

  it('未ログインの場合は見学申込みボタンを表示しない', () => {
    render(<SchoolDetailHeader {...baseProps} isLoggedIn={false} />)

    expect(screen.queryByText('見学申込み')).not.toBeInTheDocument()
  })

  it('ログイン済みの場合は見学申込みボタンを表示し、クリックでonVisitが呼ばれる', () => {
    const onVisit = vi.fn()
    render(
      <SchoolDetailHeader {...baseProps} isLoggedIn={true} onVisit={onVisit} />
    )

    const visitButton = screen.getByText('見学申込み')
    fireEvent.click(visitButton)

    expect(onVisit).toHaveBeenCalledTimes(1)
  })

  it('FavoriteButtonにidを数値変換したschoolIdとisFavorited/isLoggedInを渡す', () => {
    render(
      <SchoolDetailHeader
        {...baseProps}
        id="456"
        isFavorited={true}
        isLoggedIn={true}
      />
    )

    const favoriteButton = screen.getByTestId('favorite-button')
    expect(favoriteButton).toHaveAttribute('data-school-id', '456')
    expect(favoriteButton).toHaveAttribute('data-favorited', 'true')
    expect(favoriteButton).toHaveAttribute('data-logged-in', 'true')
  })

  it('FavoriteButtonのクリックでonToggleFavoriteがschoolId（数値）付きで呼ばれる', () => {
    const onToggleFavorite = vi.fn()
    render(
      <SchoolDetailHeader
        {...baseProps}
        id="789"
        onToggleFavorite={onToggleFavorite}
      />
    )

    fireEvent.click(screen.getByTestId('favorite-button'))

    expect(onToggleFavorite).toHaveBeenCalledWith(789)
  })
})
