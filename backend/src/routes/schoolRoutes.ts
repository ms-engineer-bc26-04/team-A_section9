import { Router } from 'express'
import {
  getSchoolByIdController,
  getSchoolsController,
} from '../controllers/schoolController'
import { optionalAuthenticateSupabaseUser } from '../middlewares/optionalAuthMiddleware'

const router = Router()

router.get('/', optionalAuthenticateSupabaseUser, getSchoolsController)
router.get('/:id', optionalAuthenticateSupabaseUser, getSchoolByIdController)

export default router
