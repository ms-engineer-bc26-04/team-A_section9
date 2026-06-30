import { prisma } from '../lib/prisma'

export const getSchoolAdminMeService = async (schoolAdminId: string) => {
  return prisma.schoolAdmin.findUnique({
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
}

export const getManagedSchoolService = async (schoolId: bigint) => {
  return prisma.school.findUnique({
    where: { id: schoolId },
  })
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
