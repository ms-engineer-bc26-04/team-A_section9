import type { NextFunction, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SchoolAdminRequest } from '../../middlewares/schoolAdminMiddleware'

const mockGetSchoolAdminMeService = vi.fn()
const mockGetManagedSchoolService = vi.fn()
const mockUpdateManagedSchoolService = vi.fn()

vi.mock('../../services/schoolAdminService', () => ({
  getSchoolAdminMeService: mockGetSchoolAdminMeService,
  getManagedSchoolService: mockGetManagedSchoolService,
  updateManagedSchoolService: mockUpdateManagedSchoolService,
}))

const createSchoolAdmin = () => ({
  id: 'school-admin-1',
  userId: 'user-1',
  schoolId: 1n,
})

const createRequest = (
  overrides: Partial<SchoolAdminRequest> = {}
): SchoolAdminRequest =>
  ({
    schoolAdmin: createSchoolAdmin(),
    body: {},
    ...overrides,
  }) as SchoolAdminRequest

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

const createNext = () =>
  vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>

describe('schoolAdminController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSchoolAdminMe', () => {
    it('req.schoolAdminがない場合は403を返す', async () => {
      const { getSchoolAdminMe } =
        await import('../../controllers/schoolAdminController')

      const req = createRequest({
        schoolAdmin: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await getSchoolAdminMe(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
      expect(mockGetSchoolAdminMeService).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('園管理者情報が存在しない場合は404を返す', async () => {
      const { getSchoolAdminMe } =
        await import('../../controllers/schoolAdminController')

      mockGetSchoolAdminMeService.mockResolvedValue(null)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getSchoolAdminMe(req, res, next)

      expect(mockGetSchoolAdminMeService).toHaveBeenCalledWith('school-admin-1')
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NOT_FOUND',
          message: '園管理者情報が見つかりません',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('園管理者情報を取得できた場合はdataを返す', async () => {
      const { getSchoolAdminMe } =
        await import('../../controllers/schoolAdminController')

      mockGetSchoolAdminMeService.mockResolvedValue({
        id: 'school-admin-1',
        userId: 'user-1',
        schoolId: '1',
        school: {
          id: '1',
          name: 'さくら保育園',
        },
      })

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getSchoolAdminMe(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: 'school-admin-1',
          userId: 'user-1',
          schoolId: '1',
          school: {
            id: '1',
            name: 'さくら保育園',
          },
        },
      })
      expect(res.status).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { getSchoolAdminMe } =
        await import('../../controllers/schoolAdminController')

      const error = new Error('SERVICE_ERROR')
      mockGetSchoolAdminMeService.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getSchoolAdminMe(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getManagedSchool', () => {
    it('req.schoolAdminがない場合は403を返す', async () => {
      const { getManagedSchool } =
        await import('../../controllers/schoolAdminController')

      const req = createRequest({
        schoolAdmin: undefined,
      })
      const res = createResponse()
      const next = createNext()

      await getManagedSchool(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
      expect(mockGetManagedSchoolService).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('管理対象園が存在しない場合は404を返す', async () => {
      const { getManagedSchool } =
        await import('../../controllers/schoolAdminController')

      mockGetManagedSchoolService.mockResolvedValue(null)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getManagedSchool(req, res, next)

      expect(mockGetManagedSchoolService).toHaveBeenCalledWith(1n)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NOT_FOUND',
          message: '管理対象の園情報が見つかりません',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('管理対象園を取得できた場合はdataを返す', async () => {
      const { getManagedSchool } =
        await import('../../controllers/schoolAdminController')

      mockGetManagedSchoolService.mockResolvedValue({
        id: '1',
        name: 'さくら保育園',
        area: '渋谷区',
      })

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getManagedSchool(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: '1',
          name: 'さくら保育園',
          area: '渋谷区',
        },
      })
      expect(res.status).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { getManagedSchool } =
        await import('../../controllers/schoolAdminController')

      const error = new Error('SERVICE_ERROR')
      mockGetManagedSchoolService.mockRejectedValue(error)

      const req = createRequest()
      const res = createResponse()
      const next = createNext()

      await getManagedSchool(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('updateManagedSchool', () => {
    it('req.schoolAdminがない場合は403を返す', async () => {
      const { updateManagedSchool } =
        await import('../../controllers/schoolAdminController')

      const req = createRequest({
        schoolAdmin: undefined,
        body: {
          name: '更新後の保育園',
        },
      })
      const res = createResponse()
      const next = createNext()

      await updateManagedSchool(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
      expect(mockUpdateManagedSchoolService).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('管理対象園を更新できた場合はdataを返す', async () => {
      const { updateManagedSchool } =
        await import('../../controllers/schoolAdminController')

      mockUpdateManagedSchoolService.mockResolvedValue({
        id: 1n,
        name: '更新後の保育園',
        area: '渋谷区',
      })

      const req = createRequest({
        body: {
          name: '更新後の保育園',
        },
      })
      const res = createResponse()
      const next = createNext()

      await updateManagedSchool(req, res, next)

      expect(mockUpdateManagedSchoolService).toHaveBeenCalledWith(1n, {
        name: '更新後の保育園',
      })
      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: '1',
          name: '更新後の保育園',
          area: '渋谷区',
        },
      })
      expect(res.status).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('処理中にエラーが発生した場合はnextに渡す', async () => {
      const { updateManagedSchool } =
        await import('../../controllers/schoolAdminController')

      const error = new Error('SERVICE_ERROR')
      mockUpdateManagedSchoolService.mockRejectedValue(error)

      const req = createRequest({
        body: {
          name: '更新後の保育園',
        },
      })
      const res = createResponse()
      const next = createNext()

      await updateManagedSchool(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
