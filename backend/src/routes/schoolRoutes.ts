import { Router } from 'express'
import { getCompareSchoolsController } from '../controllers/compareController'
import {
  getSchoolByIdController,
  getSchoolsController,
} from '../controllers/schoolController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { optionalAuthenticateSupabaseUser } from '../middlewares/optionalAuthMiddleware'

const router = Router()

router.get('/', optionalAuthenticateSupabaseUser, getSchoolsController)
router.get('/compare', authenticateSupabaseUser, getCompareSchoolsController)
router.get('/:id', optionalAuthenticateSupabaseUser, getSchoolByIdController)

export default router
