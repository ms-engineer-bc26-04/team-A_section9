import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSchoolAdminFindUnique = vi.fn()
const mockSchoolFindUnique = vi.fn()
const mockSchoolUpdate = vi.fn()

vi.mock('../lib/prisma', () => ({
  prisma: {
    schoolAdmin: {
      findUnique: mockSchoolAdminFindUnique,
    },
    school: {
      findUnique: mockSchoolFindUnique,
      update: mockSchoolUpdate,
    },
  },
}))

const createSchool = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  name: 'さくら保育園',
  address: '東京都渋谷区1-1-1',
  area: '渋谷区',
  mealType: 'SCHOOL_LUNCH',
  ...overrides,
})

const createSchoolAdmin = (overrides: Record<string, unknown> = {}) => ({
  id: 'school-admin-1',
  userId: 'user-1',
  schoolId: 1n,
  school: {
    id: 1n,
    name: 'さくら保育園',
  },
  ...overrides,
})

describe('schoolAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSchoolAdminMeService', () => {
    it('園管理者自身の情報を取得し、bigintのidを文字列に変換して返す', async () => {
      const { getSchoolAdminMeService } =
        await import('../services/schoolAdminService')

      const schoolAdmin = createSchoolAdmin()
      mockSchoolAdminFindUnique.mockResolvedValue(schoolAdmin)

      const result = await getSchoolAdminMeService('school-admin-1')

      expect(mockSchoolAdminFindUnique).toHaveBeenCalledWith({
        where: {
          id: 'school-admin-1',
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      expect(result).toEqual({
        ...schoolAdmin,
        schoolId: '1',
        school: {
          id: '1',
          name: 'さくら保育園',
        },
      })
    })

    it('園管理者が存在しない場合はnullを返す', async () => {
      const { getSchoolAdminMeService } =
        await import('../services/schoolAdminService')

      mockSchoolAdminFindUnique.mockResolvedValue(null)

      const result = await getSchoolAdminMeService('school-admin-unknown')

      expect(result).toBeNull()
    })

    it('紐づく園情報がない場合はschoolにnullを返す', async () => {
      const { getSchoolAdminMeService } =
        await import('../services/schoolAdminService')

      mockSchoolAdminFindUnique.mockResolvedValue(
        createSchoolAdmin({
          school: null,
        })
      )

      const result = await getSchoolAdminMeService('school-admin-1')

      expect(result?.schoolId).toBe('1')
      expect(result?.school).toBeNull()
    })
  })

  describe('getManagedSchoolService', () => {
    it('管理対象園を取得し、bigintのidを文字列に変換して返す', async () => {
      const { getManagedSchoolService } =
        await import('../services/schoolAdminService')

      const school = createSchool({
        id: 10n,
        name: '管理対象保育園',
      })

      mockSchoolFindUnique.mockResolvedValue(school)

      const result = await getManagedSchoolService(10n)

      expect(mockSchoolFindUnique).toHaveBeenCalledWith({
        where: {
          id: 10n,
        },
      })

      expect(result).toEqual({
        ...school,
        id: '10',
      })
    })

    it('管理対象園が存在しない場合はnullを返す', async () => {
      const { getManagedSchoolService } =
        await import('../services/schoolAdminService')

      mockSchoolFindUnique.mockResolvedValue(null)

      const result = await getManagedSchoolService(999n)

      expect(result).toBeNull()
    })
  })

  describe('updateManagedSchoolService', () => {
    it('管理対象園を更新する', async () => {
      const { updateManagedSchoolService } =
        await import('../services/schoolAdminService')

      const updatedSchool = createSchool({
        id: 1n,
        name: '更新後の保育園',
        address: '東京都渋谷区2-2-2',
      })

      mockSchoolUpdate.mockResolvedValue(updatedSchool)

      const input = {
        name: '更新後の保育園',
        address: '東京都渋谷区2-2-2',
      } as Parameters<typeof updateManagedSchoolService>[1]

      const result = await updateManagedSchoolService(1n, input)

      expect(mockSchoolUpdate).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          name: '更新後の保育園',
          address: '東京都渋谷区2-2-2',
        },
      })

      expect(result).toBe(updatedSchool)
    })

    it('更新時にnullの項目を除外する', async () => {
      const { updateManagedSchoolService } =
        await import('../services/schoolAdminService')

      mockSchoolUpdate.mockResolvedValue(createSchool())

      const input = {
        name: '更新後の保育園',
        address: null,
        area: '渋谷区',
        mealType: null,
      } as Parameters<typeof updateManagedSchoolService>[1]

      await updateManagedSchoolService(1n, input)

      expect(mockSchoolUpdate).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          name: '更新後の保育園',
          area: '渋谷区',
        },
      })
    })
  })
})
