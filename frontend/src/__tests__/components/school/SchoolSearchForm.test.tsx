// keyword・条件検索をまとめてURLに反映するフォームのテスト
// src/__tests__/components/school/SchoolSearchForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchoolSearchForm from '@/components/school/SchoolSearchForm'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams('existing=1'),
}))

// pushMockに渡されたURL文字列から、pathとクエリパラメータを取り出すヘルパー
const parsePushedUrl = (calledUrl: string) => {
  const [path, query] = calledUrl.split('?')
  return { path, params: new URLSearchParams(query) }
}

describe('SchoolSearchForm', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('検索ボタンを押すと、既存のパラメータを維持しつつkeywordを追加してpushする', async () => {
    render(<SchoolSearchForm defaultKeyword="さくら" />)

    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    const { path, params } = parsePushedUrl(pushMock.mock.calls[0][0])
    expect(path).toBe('/schools/search')
    expect(params.get('existing')).toBe('1')
    expect(params.get('keyword')).toBe('さくら')
  })

  it('keywordが空の場合はkeywordパラメータを含めない', async () => {
    render(<SchoolSearchForm defaultKeyword="" />)

    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    const { params } = parsePushedUrl(pushMock.mock.calls[0][0])
    expect(params.has('keyword')).toBe(false)
    expect(params.get('existing')).toBe('1')
  })

  it('条件検索で選択した項目もまとめてURLに反映される', async () => {
    render(<SchoolSearchForm defaultKeyword="" />)

    await userEvent.click(screen.getByRole('button', { name: /条件で検索/ }))
    const checkbox = await screen.findByLabelText('毎日給食')
    await userEvent.click(checkbox)

    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    const { params } = parsePushedUrl(pushMock.mock.calls[0][0])
    expect(params.get('hasLunch')).toBe('true')
    expect(params.get('existing')).toBe('1')
  })
})
