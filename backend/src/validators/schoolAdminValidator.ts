import { z } from 'zod'

export const updateManagedSchoolBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  area: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(255).optional(),
  phoneNumber: z.string().max(20).nullable().optional(),
  imageUrl: z.string().max(255).nullable().optional(),
  managerName: z.string().max(100).nullable().optional(),
  contactPerson: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
})
