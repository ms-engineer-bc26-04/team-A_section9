// 管理者用ハンバーガーメニューのテスト
// src/__tests__/components/admin/AdminHamburgerMenu.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu'
import { supabase } from '@/lib/supabase'

const pushMock = vi.fn()
let pathnameMock = '/admin'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

describe('AdminHamburgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathnameMock = '/admin'
  })

  it('isOpenがfalseの場合は何も表示しない', () => {
    const { container } = render(
      <AdminHamburgerMenu isOpen={false} onClose={() => {}} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('通常画面では「アカウント」見出しと園名・担当者名（デフォルト値）を表示する', () => {
    render(<AdminHamburgerMenu isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('アカウント')).toBeInTheDocument()
    expect(screen.getByText('○○保育園')).toBeInTheDocument()
    expect(screen.getByText('担当者名：○○さん')).toBeInTheDocument()
  })

  it('schoolName・staffNameを渡すとその値が表示される', () => {
    render(
      <AdminHamburgerMenu
        isOpen={true}
        onClose={() => {}}
        schoolName="さくら保育園"
        staffName="山田 花子"
      />
    )

    expect(screen.getByText('さくら保育園')).toBeInTheDocument()
    expect(screen.getByText('担当者名：山田 花子さん')).toBeInTheDocument()
  })

  it('通常画面では「マイ機能」セクション（ホーム・園情報編集・ログアウト）を表示する', () => {
    render(<AdminHamburgerMenu isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('マイ機能')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホーム' })).toHaveAttribute(
      'href',
      '/admin'
    )
    expect(screen.getByRole('link', { name: '園情報編集' })).toHaveAttribute(
      'href',
      '/admin/edit'
    )
    expect(
      screen.getByRole('button', { name: 'ログアウト' })
    ).toBeInTheDocument()
  })

  it('ログインページでは「ENKATSUホーム画面に戻る」ボタンを表示し、マイ機能セクションは表示しない', () => {
    pathnameMock = '/admin/login'
    render(<AdminHamburgerMenu isOpen={true} onClose={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'ENKATSUホーム画面に戻る' })
    ).toBeInTheDocument()
    expect(screen.queryByText('マイ機能')).not.toBeInTheDocument()
    expect(screen.queryByText('アカウント')).toBeInTheDocument()
  })

  it('「ENKATSUホーム画面に戻る」を押すと/へ遷移し、onCloseが呼ばれる', () => {
    pathnameMock = '/admin/login'
    const handleClose = vi.fn()
    render(<AdminHamburgerMenu isOpen={true} onClose={handleClose} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'ENKATSUホーム画面に戻る' })
    )

    expect(pushMock).toHaveBeenCalledWith('/')
    expect(handleClose).toHaveBeenCalled()
  })

  it('閉じるボタン（✕）を押すとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(<AdminHamburgerMenu isOpen={true} onClose={handleClose} />)

    fireEvent.click(screen.getByLabelText('メニューを閉じる'))

    expect(handleClose).toHaveBeenCalled()
  })

  it('背景オーバーレイをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    const { container } = render(
      <AdminHamburgerMenu isOpen={true} onClose={handleClose} />
    )

    const overlay = container.querySelector('.bg-black\\/20')
    fireEvent.click(overlay!)

    expect(handleClose).toHaveBeenCalled()
  })

  it('ホームリンクをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(<AdminHamburgerMenu isOpen={true} onClose={handleClose} />)

    fireEvent.click(screen.getByRole('link', { name: 'ホーム' }))

    expect(handleClose).toHaveBeenCalled()
  })

  it('ログアウトを押すとsignOut・onClose・/admin/loginへの遷移が行われる', async () => {
    const handleClose = vi.fn()
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    } as never)

    render(<AdminHamburgerMenu isOpen={true} onClose={handleClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }))

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
    expect(handleClose).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/admin/login')
  })
})
