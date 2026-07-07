// セクション見出しコンポーネントのテスト
// src/__test__/components/compare/SectionHeader.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionHeader from '@/components/compare/SectionHeader'

describe('SectionHeader', () => {
  it('labelがテキストとして表示される', () => {
    render(<SectionHeader icon="/images/icon5.png" label="生活負担" />)

    expect(screen.getByText('生活負担')).toBeInTheDocument()
  })

  it('iconに渡したパスが画像のsrcとして使われる', () => {
    render(<SectionHeader icon="/images/icon5.png" label="生活負担" />)

    const img = screen.getByAltText('生活負担') as HTMLImageElement
    expect(img.src).toContain(encodeURIComponent('/images/icon5.png'))
  })
})
