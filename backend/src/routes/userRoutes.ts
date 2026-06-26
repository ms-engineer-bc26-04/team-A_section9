import { Router } from 'express'
import {
  getMe,
  updateMe,
  updateMyPreference,
} from '../controllers/userController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { validateRequest } from '../middlewares/validateRequest'
import {
  userPreferenceBodySchema,
  userProfileBodySchema,
} from '../validators/userValidator'

const router = Router()

router.get('/me', authenticateSupabaseUser, getMe)

router.put(
  '/me',
  authenticateSupabaseUser,
  validateRequest({ body: userProfileBodySchema }),
  updateMe
)

router.patch(
  '/me/preferences',
  authenticateSupabaseUser,
  validateRequest({ body: userPreferenceBodySchema }),
  updateMyPreference
)

export default router
