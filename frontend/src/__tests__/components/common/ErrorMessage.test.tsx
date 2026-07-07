// src/__tests__/components/common/ErrorMessage.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorMessage from '@/components/common/ErrorMessage'

describe('ErrorMessage', () => {
  it('渡されたメッセージが表示される', () => {
    render(<ErrorMessage message="エラーが発生しました" />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })

  it('メッセージが空文字の場合、テキストが空で表示される', () => {
    render(<ErrorMessage message="" />)

    const paragraph = document.querySelector('p')
    expect(paragraph).toBeInTheDocument()
    expect(paragraph?.textContent).toBe('')
  })
})
