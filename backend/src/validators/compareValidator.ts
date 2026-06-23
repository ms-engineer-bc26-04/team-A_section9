import { z } from 'zod'

export const compareQuerySchema = z
  .object({
    ids: z
      .string({
        message: '比較対象の園IDを指定してください',
      })
      .min(1, {
        message: '比較対象の園IDを指定してください',
      }),
  })
  .strict()

export const parseCompareSchoolIds = (ids: string) => {
  const rawIds = ids.split(',')

  if (rawIds.some((id) => id.trim() === '')) {
    throw new Error('比較対象の園IDが不正です')
  }

  if (rawIds.some((id) => !/^\d+$/.test(id.trim()))) {
    throw new Error('比較対象の園IDが不正です')
  }

  const normalizedIds = rawIds.map((id) => id.trim())

  const uniqueIds = new Set(normalizedIds)

  if (uniqueIds.size !== normalizedIds.length) {
    throw new Error('比較対象の園IDが重複しています')
  }

  if (normalizedIds.length < 2) {
    throw new Error('比較対象の園は2件以上指定してください')
  }

  return normalizedIds.map((id) => BigInt(id))
}
