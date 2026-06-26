import { Router } from 'express'
import {
  createCheckoutSession,
  handleStripeWebhook,
} from '../controllers/paymentController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { validateRequest } from '../middlewares/validateRequest'
import { checkoutBodySchema } from '../validators/paymentValidator'

const router = Router()

router.post(
  '/checkout',
  authenticateSupabaseUser,
  validateRequest({ body: checkoutBodySchema }),
  createCheckoutSession
)

router.post('/webhook', handleStripeWebhook)

export default router
