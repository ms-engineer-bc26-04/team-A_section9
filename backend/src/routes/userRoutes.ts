import { Router } from 'express'
import { getMe } from '../controllers/userController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'

const router = Router()

router.get('/me', authenticateSupabaseUser, getMe)

export default router
