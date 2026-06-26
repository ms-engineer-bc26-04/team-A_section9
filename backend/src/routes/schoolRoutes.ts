import { Router } from 'express'
import { getCompareSchoolsController } from '../controllers/compareController'
import {
  getSchoolByIdController,
  getSchoolsController,
} from '../controllers/schoolController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { optionalAuthenticateSupabaseUser } from '../middlewares/optionalAuthMiddleware'
import { validateRequest } from '../middlewares/validateRequest'
import { compareQuerySchema } from '../validators/compareValidator'
import {
  schoolIdParamsSchema,
  schoolSearchQuerySchema,
} from '../validators/schoolValidator'

const router = Router()

router.get(
  '/',
  optionalAuthenticateSupabaseUser,
  validateRequest({ query: schoolSearchQuerySchema }),
  getSchoolsController
)

router.get(
  '/compare',
  authenticateSupabaseUser,
  validateRequest({ query: compareQuerySchema }),
  getCompareSchoolsController
)

router.get(
  '/:id',
  optionalAuthenticateSupabaseUser,
  validateRequest({ params: schoolIdParamsSchema }),
  getSchoolByIdController
)

export default router
