// src/__tests__/components/common/Header.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/components/common/Header'

// HamburgerMenuはこのテストの対象外なので、モック化してシンプルにする
vi.mock('@/components/common/HamburgerMenu', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="hamburger-menu">{isOpen ? 'open' : 'closed'}</div>
  ),
}))

describe('Header', () => {
  it('ロゴとENKATSUの文字が表示される', () => {
    render(<Header />)

    expect(screen.getByAltText('ENKATSUロゴ')).toBeInTheDocument()
    expect(screen.getByText('ENKATSU')).toBeInTheDocument()
  })

  it('初期状態ではメニューが閉じている', () => {
    render(<Header />)

    expect(screen.getByTestId('hamburger-menu')).toHaveTextContent('closed')
  })

  it('ハンバーガーボタンをクリックするとメニューが開く', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const button = screen.getByRole('button', { name: 'メニューを開く' })
    await user.click(button)

    expect(screen.getByTestId('hamburger-menu')).toHaveTextContent('open')
  })
})
