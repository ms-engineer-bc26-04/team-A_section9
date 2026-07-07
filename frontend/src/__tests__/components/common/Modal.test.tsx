// src/__tests__/components/common/Modal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/common/Modal'

describe('Modal', () => {
  it('isOpenがfalseの場合、何も表示されない', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>モーダルの中身</p>
      </Modal>
    )

    expect(screen.queryByText('モーダルの中身')).not.toBeInTheDocument()
  })

  it('isOpenがtrueの場合、childrenが表示される', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>モーダルの中身</p>
      </Modal>
    )

    expect(screen.getByText('モーダルの中身')).toBeInTheDocument()
  })

  it('titleを渡した場合、タイトルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="確認">
        <p>モーダルの中身</p>
      </Modal>
    )

    expect(screen.getByText('確認')).toBeInTheDocument()
  })

  it('titleを渡さない場合、タイトルが表示されない', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>モーダルの中身</p>
      </Modal>
    )

    expect(container.querySelector('h2')).not.toBeInTheDocument()
  })

  it('オーバーレイをクリックするとonCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>モーダルの中身</p>
      </Modal>
    )

    const overlay = container.querySelector('.bg-black\\/50')
    expect(overlay).toBeInTheDocument()

    if (overlay) {
      await user.click(overlay)
    }

    expect(handleClose).toHaveBeenCalledOnce()
  })
})
