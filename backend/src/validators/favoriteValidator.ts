import { z } from 'zod'

const schoolIdSchema = z.preprocess(
  (value) => {
    if (typeof value === 'number' || typeof value === 'bigint') {
      return value.toString()
    }

    return value
  },
  z.string().regex(/^\d+$/, {
    message: '園IDの形式が正しくありません',
  })
)

export const favoriteBodySchema = z.object({
  schoolId: schoolIdSchema,
})

export const favoriteParamsSchema = z.object({
  schoolId: schoolIdSchema,
})
