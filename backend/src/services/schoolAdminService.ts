import { prisma } from '../lib/prisma'

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
  data: {
    name?: string
    area?: string
    address?: string
    phoneNumber?: string | null
    imageUrl?: string | null
    managerName?: string | null
    contactPerson?: string | null
    description?: string | null
  }
) => {
  return prisma.school.update({
    where: {
      id: schoolId,
    },
    data,
  })
}
