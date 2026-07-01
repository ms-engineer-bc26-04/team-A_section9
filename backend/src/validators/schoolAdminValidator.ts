import { z } from 'zod'

const burdenLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const mealTypeSchema = z.enum(['SCHOOL_LUNCH', 'LUNCH_BOX', 'BOTH'])
const schoolTypeSchema = z.enum([
  'NURSERY',
  'KINDERGARTEN',
  'CERTIFIED_CHILDCARE_CENTER',
])
const contactTypeSchema = z.enum(['APP', 'PHONE', 'PAPER', 'OTHER'])

export const updateManagedSchoolBodySchema = z.object({
  name: z.string().min(1, { message: '園名を入力してください' }).max(255),
  area: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  phoneNumber: z.string().max(20).nullable().optional(),
  imageUrl: z.string().max(255).nullable().optional(),
  managerName: z.string().max(100).nullable().optional(),
  contactPerson: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),

  schoolType: schoolTypeSchema.optional(),
  lifeBurdenLevel: burdenLevelSchema.optional(),
  timeBurdenLevel: burdenLevelSchema.optional(),

  mealType: mealTypeSchema.optional(),
  itemBurdenLevel: burdenLevelSchema.optional(),
  itemBurdenDetail: z.string().max(255).nullable().optional(),
  diaperSupport: z.string().max(50).nullable().optional(),
  futonSupport: z.string().max(50).nullable().optional(),

  extendedCareHours: z.string().max(50).nullable().optional(),
  extendedCareUsage: z.string().max(50).nullable().optional(),
  weekdayEventsLevel: burdenLevelSchema.optional(),
  weekdayEvents: z.string().max(100).nullable().optional(),
  parentAssociationLevel: burdenLevelSchema.optional(),
  parentAssociationFrequency: z.string().max(100).nullable().optional(),

  contactBookType: contactTypeSchema.nullable().optional(),
  absenceContactMethod: contactTypeSchema.nullable().optional(),
  lessons: z.string().max(255).nullable().optional(),
  allergySupport: z.string().max(255).nullable().optional(),
})
