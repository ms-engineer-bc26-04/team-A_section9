import { z } from 'zod'

export const checkoutBodySchema = z
  .object({
    plan: z.literal('premium_monthly'),
  })
  .strict()
