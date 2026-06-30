import type { Response, NextFunction } from 'express'
import type { SchoolAdminRequest } from '../middlewares/schoolAdminMiddleware'
import {
  getManagedSchoolService,
  getSchoolAdminMeService,
} from '../services/schoolAdminService'

export const getSchoolAdminMe = async (
  req: SchoolAdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const schoolAdmin = req.schoolAdmin
    if (!schoolAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
    }

    const data = await getSchoolAdminMeService(schoolAdmin.id)
    return res.json({ data })
  } catch (error) {
    next(error)
  }
}

export const getManagedSchool = async (
  req: SchoolAdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const schoolAdmin = req.schoolAdmin
    if (!schoolAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: '園管理者として登録されていません',
        },
      })
    }

    const data = await getManagedSchoolService(schoolAdmin.schoolId)
    return res.json({ data })
  } catch (error) {
    next(error)
  }
}
