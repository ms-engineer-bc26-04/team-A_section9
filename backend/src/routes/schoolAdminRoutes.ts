import { Router } from 'express'
import {
  getManagedSchool,
  getSchoolAdminMe,
  updateManagedSchool,
} from '../controllers/schoolAdminController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { requireSchoolAdmin } from '../middlewares/schoolAdminMiddleware'
import { validateRequest } from '../middlewares/validateRequest'
import { updateManagedSchoolBodySchema } from '../validators/schoolAdminValidator'

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
  validateRequest({ body: updateManagedSchoolBodySchema }),
  updateManagedSchool
)

export default router
