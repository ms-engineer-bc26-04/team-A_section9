import { Router } from 'express'
import {
  createCheckoutSession,
  createCustomerPortalSession,
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

// NOTE: #114 プレミアムユーザーのプラン管理・解約用
// リクエストボディは不要。認証済みプレミアムユーザーのみStripe Customer Portal URLを作成する。
router.post(
  '/customer-portal',
  authenticateSupabaseUser,
  createCustomerPortalSession
)

router.post('/webhook', handleStripeWebhook)

export default router
