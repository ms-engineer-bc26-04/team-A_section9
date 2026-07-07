// 管理者用ヘッダーのテスト
// src/__tests__/components/admin/AdminHeader.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
}))

// AdminHamburgerMenu自体は別ファイルで検証済みのため、
// AdminHeaderからどんなpropsが渡るかだけを確認する
vi.mock('@/components/admin/AdminHamburgerMenu', () => ({
  default: vi.fn(() => null),
}))

const mockedAdminHamburgerMenu = vi.mocked(AdminHamburgerMenu)

describe('AdminHeader', () => {
  beforeEach(() => {
    mockedAdminHamburgerMenu.mockClear()
  })

  it('ENKATSUロゴ・テキストと/adminへのリンクを表示する', () => {
    render(<AdminHeader />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/admin')
    expect(screen.getByText('ENKATSU')).toBeInTheDocument()
  })

  it('初期状態ではAdminHamburgerMenuにisOpen=falseを渡す', () => {
    render(<AdminHeader />)

    const props = mockedAdminHamburgerMenu.mock.calls.at(-1)?.[0]
    expect(props?.isOpen).toBe(false)
  })

  it('ハンバーガーボタンを押すとAdminHamburgerMenuにisOpen=trueが渡る', () => {
    render(<AdminHeader />)

    fireEvent.click(screen.getByLabelText('メニューを開く'))

    const props = mockedAdminHamburgerMenu.mock.calls.at(-1)?.[0]
    expect(props?.isOpen).toBe(true)
  })

  it('schoolName・staffNameをそのままAdminHamburgerMenuへ渡す', () => {
    render(<AdminHeader schoolName="さくら保育園" staffName="山田 花子" />)

    const props = mockedAdminHamburgerMenu.mock.calls.at(-1)?.[0]
    expect(props?.schoolName).toBe('さくら保育園')
    expect(props?.staffName).toBe('山田 花子')
  })

  it('AdminHamburgerMenuのonCloseを呼ぶとisOpenがfalseに戻る', () => {
    render(<AdminHeader />)

    fireEvent.click(screen.getByLabelText('メニューを開く'))
    let props = mockedAdminHamburgerMenu.mock.calls.at(-1)?.[0]
    expect(props?.isOpen).toBe(true)

    act(() => {
      props?.onClose()
    })

    props = mockedAdminHamburgerMenu.mock.calls.at(-1)?.[0]
    expect(props?.isOpen).toBe(false)
  })
})
