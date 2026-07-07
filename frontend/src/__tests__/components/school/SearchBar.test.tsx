// 検索バー（controlled）のテスト
// src/__tests__/components/school/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/school/SearchBar'

describe('SearchBar', () => {
  it('valueが入力欄に表示される', () => {
    render(<SearchBar value="さくら" onChange={() => {}} onSubmit={() => {}} />)

    expect(screen.getByPlaceholderText('園の名前か住所で検索')).toHaveValue(
      'さくら'
    )
  })

  it('入力するとonChangeが呼ばれる', async () => {
    const handleChange = vi.fn()
    render(<SearchBar value="" onChange={handleChange} onSubmit={() => {}} />)

    await userEvent.type(
      screen.getByPlaceholderText('園の名前か住所で検索'),
      'あ'
    )

    expect(handleChange).toHaveBeenCalledWith('あ')
  })

  it('Enterキーを押すとonSubmitが呼ばれる', () => {
    const handleSubmit = vi.fn()
    render(
      <SearchBar value="さくら" onChange={() => {}} onSubmit={handleSubmit} />
    )

    fireEvent.keyDown(screen.getByPlaceholderText('園の名前か住所で検索'), {
      key: 'Enter',
    })

    expect(handleSubmit).toHaveBeenCalled()
  })

  it('Enter以外のキーではonSubmitが呼ばれない', () => {
    const handleSubmit = vi.fn()
    render(
      <SearchBar value="さくら" onChange={() => {}} onSubmit={handleSubmit} />
    )

    fireEvent.keyDown(screen.getByPlaceholderText('園の名前か住所で検索'), {
      key: 'a',
    })

    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
