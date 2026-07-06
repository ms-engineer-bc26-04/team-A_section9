// src/__tests__/components/common/Toast.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Toast from '@/components/common/Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('messageが表示される', () => {
    render(<Toast message="お気に入りに追加しました" onClose={vi.fn()} />)

    expect(screen.getByText('お気に入りに追加しました')).toBeInTheDocument()
  })

  it('typeを指定しない場合、successのスタイルが適用される', () => {
    render(<Toast message="成功しました" onClose={vi.fn()} />)

    expect(screen.getByText('成功しました')).toHaveClass('bg-[#FF8FAB]')
  })

  it('type="error"を指定した場合、errorのスタイルが適用される', () => {
    render(
      <Toast message="エラーが発生しました" type="error" onClose={vi.fn()} />
    )

    expect(screen.getByText('エラーが発生しました')).toHaveClass('bg-red-500')
  })

  it('type="warning"を指定した場合、warningのスタイルが適用される', () => {
    render(
      <Toast message="注意してください" type="warning" onClose={vi.fn()} />
    )

    expect(screen.getByText('注意してください')).toHaveClass('bg-yellow-500')
  })

  it('durationを指定しない場合、3000ms後にonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(<Toast message="通知" onClose={handleClose} />)

    expect(handleClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3000)

    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('durationを指定した場合、指定した時間後にonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(<Toast message="通知" onClose={handleClose} duration={1000} />)

    vi.advanceTimersByTime(999)
    expect(handleClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(handleClose).toHaveBeenCalledOnce()
  })
})
