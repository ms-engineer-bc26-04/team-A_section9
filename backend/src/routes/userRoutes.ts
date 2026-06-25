import { Router } from 'express'
import {
  getMe,
  updateMe,
  updateMyPreference,
} from '../controllers/userController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'

const router = Router()

router.get('/me', authenticateSupabaseUser, getMe)
router.put('/me', authenticateSupabaseUser, updateMe)
router.patch('/me/preferences', authenticateSupabaseUser, updateMyPreference)

export default router
