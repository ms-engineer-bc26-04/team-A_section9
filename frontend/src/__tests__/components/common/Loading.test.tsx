// src/__tests__/components/common/Loading.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from '@/components/common/Loading'

describe('Loading', () => {
  it('sizeを指定しない場合、デフォルトのmdサイズが適用される', () => {
    render(<Loading />)
    const spinner = screen.getByTestId('loading-spinner')

    expect(spinner).toHaveClass('w-8')
    expect(spinner).toHaveClass('h-8')
  })

  it('size="sm"を指定した場合、smサイズが適用される', () => {
    render(<Loading size="sm" />)
    const spinner = screen.getByTestId('loading-spinner')

    expect(spinner).toHaveClass('w-4')
    expect(spinner).toHaveClass('h-4')
  })

  it('size="lg"を指定した場合、lgサイズが適用される', () => {
    render(<Loading size="lg" />)
    const spinner = screen.getByTestId('loading-spinner')

    expect(spinner).toHaveClass('w-12')
    expect(spinner).toHaveClass('h-12')
  })

  it('回転アニメーション用のクラスが適用されている', () => {
    render(<Loading />)
    const spinner = screen.getByTestId('loading-spinner')

    expect(spinner).toHaveClass('animate-spin')
  })
})
