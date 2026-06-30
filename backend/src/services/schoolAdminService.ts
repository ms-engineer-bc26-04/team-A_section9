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
