import { describe, expect, it } from 'vitest'
import {
  favoriteBodySchema,
  favoriteParamsSchema,
} from '../../validators/favoriteValidator'

describe('favoriteValidator', () => {
  describe('favoriteBodySchema', () => {
    it('schoolId が数値文字列の場合は成功する', () => {
      const result = favoriteBodySchema.safeParse({
        schoolId: '1',
      })

      expect(result.success).toBe(true)
    })

    it('schoolId が number の場合は文字列に変換して成功する', () => {
      const result = favoriteBodySchema.safeParse({
        schoolId: 1,
      })

      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.schoolId).toBe('1')
      }
    })

    it('schoolId が bigint の場合は文字列に変換して成功する', () => {
      const result = favoriteBodySchema.safeParse({
        schoolId: 1n,
      })

      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.schoolId).toBe('1')
      }
    })

    it('schoolId が未指定の場合は失敗する', () => {
      const result = favoriteBodySchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('schoolId が数値文字列でない場合は失敗する', () => {
      const result = favoriteBodySchema.safeParse({
        schoolId: 'abc',
      })

      expect(result.success).toBe(false)
    })

    it('schoolId が空文字の場合は失敗する', () => {
      const result = favoriteBodySchema.safeParse({
        schoolId: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('favoriteParamsSchema', () => {
    it('schoolId が数値文字列の場合は成功する', () => {
      const result = favoriteParamsSchema.safeParse({
        schoolId: '1',
      })

      expect(result.success).toBe(true)
    })

    it('schoolId が未指定の場合は失敗する', () => {
      const result = favoriteParamsSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('schoolId が数値文字列でない場合は失敗する', () => {
      const result = favoriteParamsSchema.safeParse({
        schoolId: 'abc',
      })

      expect(result.success).toBe(false)
    })
  })
})
