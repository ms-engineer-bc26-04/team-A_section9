// 条件検索パネル（controlled）のテスト
// src/__tests__/components/school/FilterPanel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterPanel, { FILTER_OPTIONS } from '@/components/school/FilterPanel'

describe('FilterPanel', () => {
  it('初期状態では条件一覧が閉じている', () => {
    render(<FilterPanel value={{}} onChange={() => {}} />)

    expect(screen.queryByText(FILTER_OPTIONS[0].label)).not.toBeInTheDocument()
  })

  it('開閉ボタンを押すと条件一覧が表示される', async () => {
    render(<FilterPanel value={{}} onChange={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: /条件で検索/ }))

    await waitFor(() => {
      expect(screen.getByText(FILTER_OPTIONS[0].label)).toBeInTheDocument()
    })
  })

  it('チェックボックスをクリックするとonChangeに反転した値が渡される', async () => {
    const handleChange = vi.fn()
    render(<FilterPanel value={{ hasLunch: false }} onChange={handleChange} />)

    await userEvent.click(screen.getByRole('button', { name: /条件で検索/ }))
    const checkbox = await screen.findByLabelText(FILTER_OPTIONS[0].label)
    await userEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith({ hasLunch: true })
  })

  it('valueで渡された項目はチェック済みで表示される', async () => {
    render(
      <FilterPanel
        value={{ [FILTER_OPTIONS[0].key]: true }}
        onChange={() => {}}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /条件で検索/ }))
    const checkbox = await screen.findByLabelText(FILTER_OPTIONS[0].label)

    expect(checkbox).toBeChecked()
  })
})
