import { describe, expect, it } from 'vitest'
import {
  compareQuerySchema,
  parseCompareSchoolIds,
} from '../../validators/compareValidator'

describe('compareValidator', () => {
  describe('compareQuerySchema', () => {
    it('ids が指定されている場合は成功する', () => {
      const result = compareQuerySchema.safeParse({
        ids: '1,2',
      })

      expect(result.success).toBe(true)
    })

    it('ids が未指定の場合は失敗する', () => {
      const result = compareQuerySchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('ids が空文字の場合は失敗する', () => {
      const result = compareQuerySchema.safeParse({
        ids: '',
      })

      expect(result.success).toBe(false)
    })

    it('ids 以外の余分なqueryがある場合は失敗する', () => {
      const result = compareQuerySchema.safeParse({
        ids: '1,2',
        keyword: 'test',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('parseCompareSchoolIds', () => {
    it('カンマ区切りの数値文字列を bigint 配列に変換する', () => {
      const result = parseCompareSchoolIds('1,2,3')

      expect(result).toEqual([1n, 2n, 3n])
    })

    it('IDの前後に空白がある場合は trim して変換する', () => {
      const result = parseCompareSchoolIds('1, 2, 3')

      expect(result).toEqual([1n, 2n, 3n])
    })

    it('空のIDが含まれる場合はエラーを投げる', () => {
      expect(() => parseCompareSchoolIds('1,,2')).toThrow(
        '比較対象の園IDが不正です'
      )
    })

    it('数値以外のIDが含まれる場合はエラーを投げる', () => {
      expect(() => parseCompareSchoolIds('1,abc')).toThrow(
        '比較対象の園IDが不正です'
      )
    })

    it('重複したIDが含まれる場合はエラーを投げる', () => {
      expect(() => parseCompareSchoolIds('1,1')).toThrow(
        '比較対象の園IDが重複しています'
      )
    })

    it('比較対象が1件だけの場合はエラーを投げる', () => {
      expect(() => parseCompareSchoolIds('1')).toThrow(
        '比較対象の園は2件以上指定してください'
      )
    })
  })
})
