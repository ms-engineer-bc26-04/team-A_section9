// 改行制御ヘルパーのテスト
// src/__test__/components/compare/breakUtils.test.ts
import { describe, expect, it } from 'vitest'
import {
  renderWithBreaks,
  renderWithBreakBeforeKeyword,
} from '@/components/compare/breakUtils'

describe('renderWithBreaks', () => {
  it('「・」が無い場合は元の文字列だけの配列を返す', () => {
    const result = renderWithBreaks('毎日給食あり')

    expect(result).toEqual(['毎日給食あり'])
  })

  it('「・」が1つの場合、直後に<wbr>を挿入する', () => {
    const result = renderWithBreaks('アプリ・電話')

    expect(result).toHaveLength(4)
    expect(result[0]).toBe('アプリ')
    expect(result[1]).toBe('・')
    expect((result[2] as React.ReactElement).type).toBe('wbr')
    expect(result[3]).toBe('電話')
  })

  it('「・」が複数ある場合、それぞれの直後に<wbr>を挿入する', () => {
    const result = renderWithBreaks('A・B・C')

    expect(result).toHaveLength(7)
    expect(result[0]).toBe('A')
    expect(result[1]).toBe('・')
    expect((result[2] as React.ReactElement).type).toBe('wbr')
    expect(result[3]).toBe('B')
    expect(result[4]).toBe('・')
    expect((result[5] as React.ReactElement).type).toBe('wbr')
    expect(result[6]).toBe('C')
  })

  it('空文字を渡した場合は空文字だけの配列を返す', () => {
    const result = renderWithBreaks('')

    expect(result).toEqual([''])
  })
})

describe('renderWithBreakBeforeKeyword', () => {
  it('キーワードが文字列の途中にある場合、直前に<wbr>を挿入して分割する', () => {
    const text = 'たんぽぽ第二保育園'
    const keywords = ['保育園', 'こども園', '子ども園', '幼稚園']
    const index = text.indexOf('保育園')

    const result = renderWithBreakBeforeKeyword(text, keywords)

    expect(result).toHaveLength(3)
    expect(result[0]).toBe(text.slice(0, index))
    expect((result[1] as React.ReactElement).type).toBe('wbr')
    expect(result[2]).toBe(text.slice(index))
  })

  it('キーワードが文字列の先頭にある場合は改行ポイントを作らない', () => {
    const text = '保育園ひだまり'
    const keywords = ['保育園']

    const result = renderWithBreakBeforeKeyword(text, keywords)

    expect(result).toEqual([text])
  })

  it('複数キーワードのうち、配列内で先に登場するものが優先される', () => {
    const text = 'ほいくえん保育園こども園'
    const keywords = ['保育園', 'こども園']
    const index = text.indexOf('保育園')

    const result = renderWithBreakBeforeKeyword(text, keywords)

    // 「こども園」も文字列内に存在するが、配列内で先にチェックされる「保育園」の位置が採用される
    expect(result).toHaveLength(3)
    expect(result[0]).toBe(text.slice(0, index))
    expect(result[2]).toBe(text.slice(index))
  })

  it('どのキーワードにも一致しない場合は元の文字列だけの配列を返す', () => {
    const text = 'たんぽぽ第二スクール'
    const keywords = ['保育園', 'こども園', '子ども園', '幼稚園']

    const result = renderWithBreakBeforeKeyword(text, keywords)

    expect(result).toEqual([text])
  })
})
