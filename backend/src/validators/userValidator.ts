import { z } from 'zod'

const burdenLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const mealTypeSchema = z.enum(['SCHOOL_LUNCH', 'LUNCH_BOX', 'BOTH'])

const nullableStringSchema = z.string().nullable().optional()
const nullableBooleanSchema = z.boolean().nullable().optional()

export const userProfileBodySchema = z
  .object({
    name: z
      .string({
        message: 'お名前を入力してください',
      })
      .trim()
      .min(1, {
        message: 'お名前を入力してください',
      })
      .max(100, {
        message: 'お名前は100文字以内で入力してください',
      }),
    postalCode: z
      .string({
        message: '郵便番号は7桁の数字で入力してください',
      })
      .transform((value) => value.replace('-', ''))
      .refine((value) => /^\d{7}$/.test(value), {
        message: '郵便番号は7桁の数字で入力してください',
      }),
    address: z
      .string({
        message: '住所を入力してください',
      })
      .trim()
      .min(1, {
        message: '住所を入力してください',
      })
      .max(255, {
        message: '住所は255文字以内で入力してください',
      }),
  })
  .strict()

export const userPreferenceBodySchema = z
  .object({
    preferredMealType: mealTypeSchema.nullable().optional(),
    preferredItemBurdenLevel: burdenLevelSchema.nullable().optional(),
    preferredDiaperSupport: nullableStringSchema,
    preferredFutonSupport: nullableStringSchema,
    preferredExtendedCare: nullableStringSchema,
    preferredLessons: nullableBooleanSchema,
    preferredAllergySupport: nullableBooleanSchema,
    preferredWeekdayEventsLevel: burdenLevelSchema.nullable().optional(),
    preferredParentAssociationLevel: burdenLevelSchema.nullable().optional(),
  })
  .strict()

export type UserProfileBodyInput = z.infer<typeof userProfileBodySchema>
export type UserPreferenceBodyInput = z.infer<typeof userPreferenceBodySchema>
