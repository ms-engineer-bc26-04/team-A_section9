import { z } from 'zod'

const burdenLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const mealTypeSchema = z.enum(['SCHOOL_LUNCH', 'LUNCH_BOX', 'BOTH'])

export const schoolSearchQuerySchema = z
  .object({
    keyword: z.string().optional(),
    q: z.string().optional(),
    area: z.string().optional(),
    mealType: mealTypeSchema.optional(),
    diaperSupport: z.string().optional(),
    futonSupport: z.string().optional(),
    extendedCareHours: z.string().optional(),
    extendedCareUsage: z.string().optional(),
    itemBurdenLevel: burdenLevelSchema.optional(),
    weekdayEventsLevel: burdenLevelSchema.optional(),
    parentAssociationLevel: burdenLevelSchema.optional(),
    lessons: z.string().optional(),
    allergySupport: z.string().optional(),
    sort: z.enum(['id_asc', 'recommended']).optional(),
  })
  .strict()

export const schoolIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, {
    message: '園IDの形式が正しくありません',
  }),
})

export type SchoolSearchQueryInput = z.infer<typeof schoolSearchQuerySchema>
