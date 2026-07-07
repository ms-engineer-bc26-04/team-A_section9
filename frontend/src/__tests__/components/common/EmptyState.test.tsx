// src/__tests__/components/common/EmptyState.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '@/components/common/EmptyState'

describe('EmptyState', () => {
  it('messageが表示される', () => {
    render(<EmptyState message="お気に入りがありません" />)

    expect(screen.getByText('お気に入りがありません')).toBeInTheDocument()
  })

  it('subMessageを渡さない場合、表示されない', () => {
    render(<EmptyState message="お気に入りがありません" />)

    expect(
      screen.queryByText('条件を変えて検索してみてください')
    ).not.toBeInTheDocument()
  })

  it('subMessageを渡した場合、表示される', () => {
    render(
      <EmptyState
        message="お気に入りがありません"
        subMessage="条件を変えて検索してみてください"
      />
    )

    expect(
      screen.getByText('条件を変えて検索してみてください')
    ).toBeInTheDocument()
  })

  it('actionLabelとonActionを渡さない場合、ボタンが表示されない', () => {
    render(<EmptyState message="お気に入りがありません" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('actionLabelとonActionを渡した場合、ボタンが表示され、クリックするとonActionが呼ばれる', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()

    render(
      <EmptyState
        message="お気に入りがありません"
        actionLabel="園を探す"
        onAction={handleAction}
      />
    )

    const button = screen.getByRole('button', { name: '園を探す' })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(handleAction).toHaveBeenCalledOnce()
  })
})
