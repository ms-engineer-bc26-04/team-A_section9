import { prisma } from '../lib/prisma'
import { updateManagedSchoolBodySchema } from '../validators/schoolAdminValidator'
import { z } from 'zod'

type UpdateManagedSchoolInput = z.output<typeof updateManagedSchoolBodySchema>

const removeNullValues = (data: UpdateManagedSchoolInput) => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null)
  )
}

export const getSchoolAdminMeService = async (schoolAdminId: string) => {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { id: schoolAdminId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!schoolAdmin) return null

  return {
    ...schoolAdmin,
    schoolId: schoolAdmin.schoolId.toString(),
    school: schoolAdmin.school
      ? {
          ...schoolAdmin.school,
          id: schoolAdmin.school.id.toString(),
        }
      : null,
  }
}

export const getManagedSchoolService = async (schoolId: bigint) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  })

  if (!school) return null

  return {
    ...school,
    id: school.id.toString(),
  }
}

export const updateManagedSchoolService = async (
  schoolId: bigint,
  data: UpdateManagedSchoolInput
) => {
  const updateData = removeNullValues(data)

  return prisma.school.update({
    where: {
      id: schoolId,
    },
    data: updateData,
  })
}
