// お気に入りボタンのテスト
// src/__tests__/components/school/FavoriteButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FavoriteButton from '@/components/school/FavoriteButton'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('FavoriteButton', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('未ログイン時にクリックするとログイン誘導モーダルが開く', async () => {
    render(
      <FavoriteButton schoolId={1} isFavorited={false} isLoggedIn={false} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'お気に入り登録' })
    )

    expect(screen.getByText('ログインが必要です')).toBeInTheDocument()
  })

  it('モーダルの「ログイン」を押すと/loginへ遷移し、モーダルが閉じる', async () => {
    render(
      <FavoriteButton schoolId={1} isFavorited={false} isLoggedIn={false} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'お気に入り登録' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(pushMock).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('ログインが必要です')).not.toBeInTheDocument()
  })

  it('モーダルの「新規会員登録」を押すと/registerへ遷移する', async () => {
    render(
      <FavoriteButton schoolId={1} isFavorited={false} isLoggedIn={false} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'お気に入り登録' })
    )
    await userEvent.click(screen.getByRole('button', { name: '新規会員登録' }))

    expect(pushMock).toHaveBeenCalledWith('/register')
  })

  it('モーダルの「キャンセル」を押すとモーダルが閉じる', async () => {
    render(
      <FavoriteButton schoolId={1} isFavorited={false} isLoggedIn={false} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'お気に入り登録' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(screen.queryByText('ログインが必要です')).not.toBeInTheDocument()
  })

  it('ログイン済みの場合、クリックから400ms後にonToggleが呼ばれる', () => {
    vi.useFakeTimers()
    const handleToggle = vi.fn()

    render(
      <FavoriteButton
        schoolId={1}
        isFavorited={false}
        isLoggedIn={true}
        onToggle={handleToggle}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'お気に入り登録' }))
    expect(handleToggle).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)
    expect(handleToggle).toHaveBeenCalledWith(1)

    vi.useRealTimers()
  })

  it('isFavoritedがtrueの場合、ハートがピンク色で塗りつぶされる', () => {
    const { container } = render(
      <FavoriteButton schoolId={1} isFavorited={true} isLoggedIn={true} />
    )

    expect(container.querySelector('svg')).toHaveAttribute('fill', '#FF8FAB')
  })

  it('isFavoritedがfalseの場合、ハートは塗りつぶされない', () => {
    const { container } = render(
      <FavoriteButton schoolId={1} isFavorited={false} isLoggedIn={true} />
    )

    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none')
  })
})
