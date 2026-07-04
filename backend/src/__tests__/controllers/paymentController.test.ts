import type { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware'

const mockCreateCheckoutSessionService = vi.fn()
const mockCreateCustomerPortalSessionService = vi.fn()
const mockHandleStripeWebhookService = vi.fn()

vi.mock('../../services/paymentService', () => ({
  createCheckoutSessionService: mockCreateCheckoutSessionService,
  createCustomerPortalSessionService: mockCreateCustomerPortalSessionService,
  handleStripeWebhookService: mockHandleStripeWebhookService,
}))

const createAuthUser = () => ({
  id: 'supabase-user-1',
  email: 'test@example.com',
})

const createAuthenticatedRequest = (
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest =>
  ({
    authUser: createAuthUser(),
    body: {},
    headers: {},
    ...overrides,
  }) as AuthenticatedRequest

const createRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    headers: {},
    ...overrides,
  }) as Request

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

describe('paymentController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('authUserがない場合は401を返す', async () => {
      const { createCheckoutSession } =
        await import('../../controllers/paymentController')

      const req = createAuthenticatedRequest({
        authUser: undefined,
      })
      const res = createResponse()

      await createCheckoutSession(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockCreateCheckoutSessionService).not.toHaveBeenCalled()
    })

    it('Checkout Sessionを作成できた場合は200でURLを返す', async () => {
      const { createCheckoutSession } =
        await import('../../controllers/paymentController')

      const result = {
        url: 'https://checkout.stripe.com/test-session',
      }

      mockCreateCheckoutSessionService.mockResolvedValue(result)

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCheckoutSession(req, res)

      expect(mockCreateCheckoutSessionService).toHaveBeenCalledWith(
        'supabase-user-1'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: result,
      })
    })

    it('すでにプレミアムユーザーの場合は403を返す', async () => {
      const { createCheckoutSession } =
        await import('../../controllers/paymentController')

      mockCreateCheckoutSessionService.mockRejectedValue(
        new Error('ALREADY_PREMIUM')
      )

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCheckoutSession(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: 'すでにプレミアムユーザーです',
        },
      })
    })

    it('決済処理で想定外エラーが発生した場合は500を返す', async () => {
      const { createCheckoutSession } =
        await import('../../controllers/paymentController')

      mockCreateCheckoutSessionService.mockRejectedValue(
        new Error('STRIPE_ERROR')
      )

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCheckoutSession(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PAYMENT_ERROR',
          message: '決済処理に失敗しました',
        },
      })
    })

    it('Error以外の例外でも500を返す', async () => {
      const { createCheckoutSession } =
        await import('../../controllers/paymentController')

      mockCreateCheckoutSessionService.mockRejectedValue('STRIPE_ERROR')

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCheckoutSession(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PAYMENT_ERROR',
          message: '決済処理に失敗しました',
        },
      })
    })
  })

  describe('createCustomerPortalSession', () => {
    it('authUserがない場合は401を返す', async () => {
      const { createCustomerPortalSession } =
        await import('../../controllers/paymentController')

      const req = createAuthenticatedRequest({
        authUser: undefined,
      })
      const res = createResponse()

      await createCustomerPortalSession(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      })
      expect(mockCreateCustomerPortalSessionService).not.toHaveBeenCalled()
    })

    it('Customer Portal Sessionを作成できた場合は200でURLを返す', async () => {
      const { createCustomerPortalSession } =
        await import('../../controllers/paymentController')

      const result = {
        url: 'https://billing.stripe.com/test-portal',
      }

      mockCreateCustomerPortalSessionService.mockResolvedValue(result)

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCustomerPortalSession(req, res)

      expect(mockCreateCustomerPortalSessionService).toHaveBeenCalledWith(
        'supabase-user-1'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: result,
      })
    })

    it('プレミアムユーザーではない場合は403を返す', async () => {
      const { createCustomerPortalSession } =
        await import('../../controllers/paymentController')

      mockCreateCustomerPortalSessionService.mockRejectedValue(
        new Error('PREMIUM_REQUIRED')
      )

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCustomerPortalSession(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PREMIUM_REQUIRED',
          message: 'プレミアムユーザーのみ利用できます',
        },
      })
    })

    it('決済処理で想定外エラーが発生した場合は500を返す', async () => {
      const { createCustomerPortalSession } =
        await import('../../controllers/paymentController')

      mockCreateCustomerPortalSessionService.mockRejectedValue(
        new Error('STRIPE_ERROR')
      )

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCustomerPortalSession(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PAYMENT_ERROR',
          message: '決済処理に失敗しました',
        },
      })
    })

    it('Error以外の例外でも500を返す', async () => {
      const { createCustomerPortalSession } =
        await import('../../controllers/paymentController')

      mockCreateCustomerPortalSessionService.mockRejectedValue('STRIPE_ERROR')

      const req = createAuthenticatedRequest()
      const res = createResponse()

      await createCustomerPortalSession(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'PAYMENT_ERROR',
          message: '決済処理に失敗しました',
        },
      })
    })
  })

  describe('handleStripeWebhook', () => {
    it('Webhook処理に成功した場合は200を返す', async () => {
      const { handleStripeWebhook } =
        await import('../../controllers/paymentController')

      mockHandleStripeWebhookService.mockResolvedValue(undefined)

      const req = createRequest({
        body: Buffer.from('stripe webhook body'),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await handleStripeWebhook(req, res)

      expect(mockHandleStripeWebhookService).toHaveBeenCalledWith(
        Buffer.from('stripe webhook body'),
        'test-signature'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        received: true,
      })
    })

    it('Webhook処理に失敗した場合は400を返す', async () => {
      const { handleStripeWebhook } =
        await import('../../controllers/paymentController')

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)

      const error = new Error('WEBHOOK_ERROR')
      mockHandleStripeWebhookService.mockRejectedValue(error)

      const req = createRequest({
        body: Buffer.from('stripe webhook body'),
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      })
      const res = createResponse()

      await handleStripeWebhook(req, res)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Stripe Webhook Error:',
        error
      )
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Webhook処理に失敗しました',
        },
      })
    })
  })
})
