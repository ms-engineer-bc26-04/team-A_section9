import { z } from 'zod'

export const addressSearchQuerySchema = z
  .object({
    zipcode: z
      .string({
        message: '郵便番号を指定してください',
      })
      .transform((value) => value.replace('-', ''))
      .refine((value) => /^\d{7}$/.test(value), {
        message: '郵便番号は7桁の数字で入力してください',
      }),
  })
  .strict()
