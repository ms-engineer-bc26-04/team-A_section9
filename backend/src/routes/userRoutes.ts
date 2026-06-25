import { Router } from 'express'
import { getMe, updateMyPreference } from '../controllers/userController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'

const router = Router()

router.get('/me', authenticateSupabaseUser, getMe)
router.patch('/me/preferences', authenticateSupabaseUser, updateMyPreference)

export default router
