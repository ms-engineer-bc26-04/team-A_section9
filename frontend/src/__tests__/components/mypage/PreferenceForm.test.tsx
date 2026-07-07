// src/__tests__/components/mypage/PreferenceForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PreferenceForm from '@/components/mypage/PreferenceForm'

// CheckItemは別テストでカバーする想定のため、checkbox操作だけできる簡易モックに置き換える
vi.mock('@/components/mypage/CheckItem', () => ({
  default: ({
    label,
    checked,
    onChange,
  }: {
    label: string
    checked: boolean
    onChange: (value: boolean) => void
  }) => (
    <label>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  ),
}))

// 8項目すべてfalseの基準props
const baseProps = {
  hasLunch: false,
  diaperDisposal: false,
  noBedding: false,
  extendedCare: false,
  noWeekdayEvents: false,
  noPTA: false,
  hasClub: false,
  allergySupport: false,
  onChange: vi.fn(),
}

// label・propキー・onChangeに渡るべきkey名の対応表
const items = [
  { label: '毎日給食', propKey: 'hasLunch' as const },
  { label: 'おむつ園処理あり', propKey: 'diaperDisposal' as const },
  { label: '布団負担少なめ', propKey: 'noBedding' as const },
  { label: '延長保育利用者が多い', propKey: 'extendedCare' as const },
  { label: '平日行事少なめ', propKey: 'noWeekdayEvents' as const },
  { label: '保護者会少なめ', propKey: 'noPTA' as const },
  { label: '園内習い事あり', propKey: 'hasClub' as const },
  { label: 'アレルギー対応あり', propKey: 'allergySupport' as const },
]

describe('PreferenceForm', () => {
  it('見出し「希望条件」と3つのセクション見出しを表示する', () => {
    render(<PreferenceForm {...baseProps} />)

    expect(screen.getByText('希望条件')).toBeInTheDocument()
    expect(screen.getByText('生活負担')).toBeInTheDocument()
    expect(screen.getByText('時間負担')).toBeInTheDocument()
    expect(screen.getByText('補助情報')).toBeInTheDocument()
  })

  it('8項目すべてのチェック項目を表示する', () => {
    render(<PreferenceForm {...baseProps} />)

    items.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    })
  })

  it.each(items)(
    '「$label」のchecked状態がpropsの値と一致する',
    ({ label, propKey }) => {
      const props = { ...baseProps, [propKey]: true }
      render(<PreferenceForm {...props} />)

      expect(screen.getByLabelText(label)).toBeChecked()
    }
  )

  it.each(items)(
    '「$label」をオンにするとonChangeが($propKey, true)で呼ばれる',
    ({ label, propKey }) => {
      const onChange = vi.fn()
      render(<PreferenceForm {...baseProps} onChange={onChange} />)

      fireEvent.click(screen.getByLabelText(label))

      expect(onChange).toHaveBeenCalledWith(propKey, true)
    }
  )

  it.each(items)(
    '「$label」がオンの状態でオフにするとonChangeが($propKey, false)で呼ばれる',
    ({ label, propKey }) => {
      const onChange = vi.fn()
      const props = { ...baseProps, [propKey]: true, onChange }
      render(<PreferenceForm {...props} />)

      fireEvent.click(screen.getByLabelText(label))

      expect(onChange).toHaveBeenCalledWith(propKey, false)
    }
  )

  it('他の項目の状態に影響されず、それぞれ独立してonChangeが呼ばれる', () => {
    const onChange = vi.fn()
    render(
      <PreferenceForm
        {...baseProps}
        hasLunch={true}
        hasClub={true}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByLabelText('毎日給食'))
    fireEvent.click(screen.getByLabelText('アレルギー対応あり'))

    expect(onChange).toHaveBeenNthCalledWith(1, 'hasLunch', false)
    expect(onChange).toHaveBeenNthCalledWith(2, 'allergySupport', true)
  })
})
