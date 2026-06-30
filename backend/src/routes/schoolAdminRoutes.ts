import { Router } from 'express'
import {
  getManagedSchool,
  getSchoolAdminMe,
  updateManagedSchool,
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

router.patch(
  '/school',
  authenticateSupabaseUser,
  requireSchoolAdmin,
  updateManagedSchool
)
export default router
