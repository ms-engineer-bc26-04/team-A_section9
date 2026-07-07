// 園カードのテスト
// src/__tests__/components/school/SchoolCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SchoolCard from '@/components/school/SchoolCard'
import type { SchoolSummary } from '@/types/school'

// FavoriteButtonは別ファイルで検証済みのため、SchoolCard自体の責務に絞ってモックする
vi.mock('@/components/school/FavoriteButton', () => ({
  default: () => <button>fav</button>,
}))

const baseSchool = {
  id: 1,
  name: 'さくら保育園',
  address: '東京都渋谷区さくら1-1-1',
  phoneNumber: '03-1234-0001',
  imageUrl: null,
  tags: ['保育園', '毎日給食'],
  isFavorited: false,
} as SchoolSummary

describe('SchoolCard', () => {
  it('園名・住所・電話番号を表示する', () => {
    render(<SchoolCard school={baseSchool} />)

    expect(screen.getByText('さくら保育園')).toBeInTheDocument()
    expect(screen.getByText('東京都渋谷区さくら1-1-1')).toBeInTheDocument()
    expect(screen.getByText('電話番号：03-1234-0001')).toBeInTheDocument()
  })

  it('電話番号が無い場合は表示しない', () => {
    render(<SchoolCard school={{ ...baseSchool, phoneNumber: null }} />)

    expect(screen.queryByText(/電話番号/)).not.toBeInTheDocument()
  })

  it('タグを表示する', () => {
    render(<SchoolCard school={baseSchool} />)

    expect(screen.getByText('保育園')).toBeInTheDocument()
    expect(screen.getByText('毎日給食')).toBeInTheDocument()
  })

  it('imageUrlが無い場合はNo Imageと表示する', () => {
    render(<SchoolCard school={baseSchool} />)

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('imageUrlがある場合は画像を表示する', () => {
    render(
      <SchoolCard
        school={{ ...baseSchool, imageUrl: '/school-images/1.png' }}
      />
    )

    expect(screen.queryByText('No Image')).not.toBeInTheDocument()
  })

  it('園詳細へのリンクが正しいhrefになっている', () => {
    render(<SchoolCard school={baseSchool} />)

    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/schools/1')
  })
})
