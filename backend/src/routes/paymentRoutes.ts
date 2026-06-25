import { Router } from 'express'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import {
  createCheckoutSession,
  handleStripeWebhook,
} from '../controllers/paymentController'

const router = Router()

router.post('/checkout', authenticateSupabaseUser, createCheckoutSession)
router.post('/webhook', handleStripeWebhook)

export default router
