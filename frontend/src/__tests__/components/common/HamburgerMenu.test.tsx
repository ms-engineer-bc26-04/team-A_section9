// src/__tests__/components/common/HamburgerMenu.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

describe('HamburgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isOpenがfalseの場合、何も表示されない', () => {
    mockUseAuth.mockReturnValue({
      supabaseUser: null,
      appUser: null,
      isPremium: false,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={false} onClose={vi.fn()} />)

    expect(screen.queryByText('アカウント')).not.toBeInTheDocument()
  })

  it('未ログイン時、新規会員登録とログインボタンが表示される', () => {
    mockUseAuth.mockReturnValue({
      supabaseUser: null,
      appUser: null,
      isPremium: false,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('新規会員登録')).toBeInTheDocument()
    expect(screen.getByText('ログイン')).toBeInTheDocument()
  })

  it('ログイン時（一般会員）、一般会員とユーザー名が表示される', () => {
    mockUseAuth.mockReturnValue({
      supabaseUser: { email: 'test@example.com' },
      appUser: { name: 'テストユーザー' },
      isPremium: false,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('一般会員')).toBeInTheDocument()
    expect(screen.getByText('テストユーザー さん')).toBeInTheDocument()
  })

  it('ログイン時（プレミアム会員）、プレミアム会員と表示される', () => {
    mockUseAuth.mockReturnValue({
      supabaseUser: { email: 'test@example.com' },
      appUser: { name: 'テストユーザー' },
      isPremium: true,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('プレミアム会員')).toBeInTheDocument()
  })

  it('ログイン時、ログアウトボタンを押すとサインアウトしてホームに遷移する', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    mockUseAuth.mockReturnValue({
      supabaseUser: { email: 'test@example.com' },
      appUser: { name: 'テストユーザー' },
      isPremium: false,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByText('ログアウト'))

    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    expect(handleClose).toHaveBeenCalledOnce()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('未ログイン時、お気に入り/比較とマイページはリンクにならず、グレー表示になる', () => {
    mockUseAuth.mockReturnValue({
      supabaseUser: null,
      appUser: null,
      isPremium: false,
      isLoading: false,
    })

    render(<HamburgerMenu isOpen={true} onClose={vi.fn()} />)

    const favoritesLink = screen.queryByRole('link', {
      name: 'お気に入り/比較',
    })
    expect(favoritesLink).not.toBeInTheDocument()
    expect(screen.getByText('お気に入り/比較')).toBeInTheDocument()
  })

  it('オーバーレイをクリックするとonCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    mockUseAuth.mockReturnValue({
      supabaseUser: null,
      appUser: null,
      isPremium: false,
      isLoading: false,
    })

    const { container } = render(
      <HamburgerMenu isOpen={true} onClose={handleClose} />
    )

    const overlay = container.querySelector('.bg-black\\/20')
    if (overlay) {
      await user.click(overlay)
    }

    expect(handleClose).toHaveBeenCalledOnce()
  })
})
