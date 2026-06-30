import { Router } from 'express'
import {
  getManagedSchool,
  getSchoolAdminMe,
} from '../controllers/schoolAdminController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { requireSchoolAdmin } from '../middlewares/schoolAdminMiddleware'

const router = Router()

router.get(
  '/me',
  authenticateSupabaseUser,
  requireSchoolAdmin,
  getSchoolAdminMe
)

router.get(
  '/school',
  authenticateSupabaseUser,
  requireSchoolAdmin,
  getManagedSchool
)

export default router
