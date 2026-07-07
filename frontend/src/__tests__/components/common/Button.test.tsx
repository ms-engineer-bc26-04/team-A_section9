// src/__tests__/components/common/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/common/Button'

describe('Button', () => {
  it('childrenが表示される', () => {
    render(<Button>送信する</Button>)

    expect(screen.getByRole('button', { name: '送信する' })).toBeInTheDocument()
  })

  it('クリックするとonClickが呼ばれる', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>送信する</Button>)
    await user.click(screen.getByRole('button', { name: '送信する' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('variantを指定しない場合、primaryのスタイルが適用される', () => {
    render(<Button>送信する</Button>)

    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('variant="secondary"を指定した場合、secondaryのスタイルが適用される', () => {
    render(<Button variant="secondary">送信する</Button>)

    expect(screen.getByRole('button')).toHaveClass('border-primary')
  })

  it('sizeを指定しない場合、mdサイズが適用される', () => {
    render(<Button>送信する</Button>)

    expect(screen.getByRole('button')).toHaveClass('text-base')
  })

  it('size="lg"を指定した場合、lgサイズが適用される', () => {
    render(<Button size="lg">送信する</Button>)

    expect(screen.getByRole('button')).toHaveClass('text-lg')
  })

  it('disabledがtrueの場合、ボタンが無効化される', () => {
    render(<Button disabled>送信する</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disabledがtrueの場合、クリックしてもonClickが呼ばれない', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        送信する
      </Button>
    )
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('isLoadingがtrueの場合、「処理中...」と表示され、ボタンが無効化される', () => {
    render(<Button isLoading>送信する</Button>)

    expect(screen.getByText('処理中...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('isLoadingがfalseの場合、childrenがそのまま表示される', () => {
    render(<Button isLoading={false}>送信する</Button>)

    expect(screen.getByText('送信する')).toBeInTheDocument()
  })

  it('typeを指定しない場合、type="button"が設定される', () => {
    render(<Button>送信する</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('type="submit"を指定した場合、正しく設定される', () => {
    render(<Button type="submit">送信する</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
