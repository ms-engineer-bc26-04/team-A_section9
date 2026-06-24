import { Router } from 'express'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { createCheckoutSession } from '../controllers/paymentController'

const router = Router()

router.post('/checkout', authenticateSupabaseUser, createCheckoutSession)

export default router
