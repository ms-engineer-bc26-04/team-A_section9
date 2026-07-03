import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUserFindUnique = vi.fn()
const mockSubscriptionFindUnique = vi.fn()
const mockSubscriptionUpsert = vi.fn()
const mockSubscriptionUpdate = vi.fn()
const mockUserUpdate = vi.fn()
const mockTransaction = vi.fn()

const mockCustomersCreate = vi.fn()
const mockCheckoutSessionsCreate = vi.fn()
const mockBillingPortalSessionsCreate = vi.fn()
const mockConstructEvent = vi.fn()
const mockSubscriptionsRetrieve = vi.fn()

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
    },
    subscription: {
      findUnique: mockSubscriptionFindUnique,
      upsert: mockSubscriptionUpsert,
      update: mockSubscriptionUpdate,
    },
    $transaction: mockTransaction,
  },
}))

vi.mock('stripe', () => {
  class MockStripe {
    customers = {
      create: mockCustomersCreate,
    }

    checkout = {
      sessions: {
        create: mockCheckoutSessionsCreate,
        retrieve: vi.fn(),
      },
    }

    billingPortal = {
      sessions: {
        create: mockBillingPortalSessionsCreate,
      },
    }

    webhooks = {
      constructEvent: mockConstructEvent,
    }

    subscriptions = {
      retrieve: mockSubscriptionsRetrieve,
    }

    invoices = {
      retrieve: vi.fn(),
    }

    constructor(_secretKey: string) {}
  }

  return {
    default: MockStripe,
  }
})

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
    process.env.STRIPE_PRICE_ID = 'price_mock'
    process.env.FRONTEND_URL = 'http://localhost:3000'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'

    mockTransaction.mockResolvedValue([])
  })

  describe('createCheckoutSessionService', () => {
    it('ユーザーが存在しない場合はUSER_NOT_FOUNDを投げる', async () => {
      const { createCheckoutSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue(null)

      await expect(
        createCheckoutSessionService('supabase-user-1')
      ).rejects.toThrow('USER_NOT_FOUND')
    })

    it('すでにACTIVEのサブスクリプションがある場合はALREADY_PREMIUMを投げる', async () => {
      const { createCheckoutSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: {
          status: 'ACTIVE',
          stripeCustomerId: 'cus_existing',
        },
      })

      await expect(
        createCheckoutSessionService('supabase-user-1')
      ).rejects.toThrow('ALREADY_PREMIUM')
    })

    it('stripeCustomerIdがない場合、Customerを作成してCheckout SessionのURLを返す', async () => {
      const { createCheckoutSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: null,
      })

      mockCustomersCreate.mockResolvedValue({
        id: 'cus_new',
      })

      mockSubscriptionUpsert.mockResolvedValue({
        userId: 'user-1',
        stripeCustomerId: 'cus_new',
        status: 'CANCELED',
      })

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/mock',
      })

      const result = await createCheckoutSessionService('supabase-user-1')

      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          userId: 'user-1',
          supabaseUserId: 'supabase-user-1',
        },
      })

      expect(mockSubscriptionUpsert).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
        update: {
          stripeCustomerId: 'cus_new',
        },
        create: {
          userId: 'user-1',
          stripeCustomerId: 'cus_new',
          status: 'CANCELED',
        },
      })

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
        mode: 'subscription',
        customer: 'cus_new',
        client_reference_id: 'user-1',
        metadata: {
          userId: 'user-1',
          supabaseUserId: 'supabase-user-1',
        },
        line_items: [
          {
            price: 'price_mock',
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3000/payment/complete',
        cancel_url: 'http://localhost:3000/plans',
      })

      expect(result).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/mock',
      })
    })

    it('既存のstripeCustomerIdがある場合、Customerを新規作成せずCheckout Sessionを作成する', async () => {
      const { createCheckoutSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: {
          status: 'CANCELED',
          stripeCustomerId: 'cus_existing',
        },
      })

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/existing',
      })

      const result = await createCheckoutSessionService('supabase-user-1')

      expect(mockCustomersCreate).not.toHaveBeenCalled()
      expect(mockSubscriptionUpsert).not.toHaveBeenCalled()

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
          client_reference_id: 'user-1',
        })
      )

      expect(result).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/existing',
      })
    })
  })

  describe('createCustomerPortalSessionService', () => {
    it('ユーザーが存在しない場合はUSER_NOT_FOUNDを投げる', async () => {
      const { createCustomerPortalSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue(null)

      await expect(
        createCustomerPortalSessionService('supabase-user-1')
      ).rejects.toThrow('USER_NOT_FOUND')
    })

    it('ACTIVEでない場合はPREMIUM_REQUIREDを投げる', async () => {
      const { createCustomerPortalSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: {
          status: 'CANCELED',
          stripeCustomerId: 'cus_existing',
        },
      })

      await expect(
        createCustomerPortalSessionService('supabase-user-1')
      ).rejects.toThrow('PREMIUM_REQUIRED')
    })

    it('stripeCustomerIdがない場合はPREMIUM_REQUIREDを投げる', async () => {
      const { createCustomerPortalSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: {
          status: 'ACTIVE',
          stripeCustomerId: null,
        },
      })

      await expect(
        createCustomerPortalSessionService('supabase-user-1')
      ).rejects.toThrow('PREMIUM_REQUIRED')
    })

    it('ACTIVEかつstripeCustomerIdがある場合、Customer Portal SessionのURLを返す', async () => {
      const { createCustomerPortalSessionService } = await import(
        '../services/paymentService'
      )

      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        supabaseUserId: 'supabase-user-1',
        subscription: {
          status: 'ACTIVE',
          stripeCustomerId: 'cus_existing',
        },
      })

      mockBillingPortalSessionsCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/mock',
      })

      const result = await createCustomerPortalSessionService('supabase-user-1')

      expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith({
        customer: 'cus_existing',
        return_url: 'http://localhost:3000/mypage',
      })

      expect(result).toEqual({
        portalUrl: 'https://billing.stripe.com/mock',
      })
    })
  })

  describe('handleStripeWebhookService', () => {
    it('signatureがない場合はINVALID_SIGNATUREを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), undefined)
      ).rejects.toThrow('INVALID_SIGNATURE')
    })

    it('signatureが配列の場合はINVALID_SIGNATUREを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), ['sig_mock'])
      ).rejects.toThrow('INVALID_SIGNATURE')
    })

    it('STRIPE_WEBHOOK_SECRETが未設定の場合はSTRIPE_WEBHOOK_SECRET_NOT_SETを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      delete process.env.STRIPE_WEBHOOK_SECRET

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')
      ).rejects.toThrow('STRIPE_WEBHOOK_SECRET_NOT_SET')
    })

    it('checkout.session.completedでsubscriptionをACTIVEに更新する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'user-1',
            customer: 'cus_1',
            subscription: 'sub_1',
          },
        },
      })

      mockSubscriptionsRetrieve.mockResolvedValue({
        id: 'sub_1',
        status: 'active',
        current_period_end: 1893456000,
      })

      const event = await handleStripeWebhookService(
        Buffer.from('{}'),
        'sig_mock'
      )

      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_1')

      expect(mockSubscriptionUpsert).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
        update: {
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(1893456000 * 1000),
          endedAt: null,
        },
        create: {
          userId: 'user-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(1893456000 * 1000),
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'PAID',
        },
      })

      expect(mockTransaction).toHaveBeenCalled()
      expect(event.type).toBe('checkout.session.completed')
    })

    it('checkout.session.completedで必要な値が不足している場合はエラーを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: null,
            customer: 'cus_1',
            subscription: 'sub_1',
          },
        },
      })

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')
      ).rejects.toThrow('CHECKOUT_SESSION_MISSING_REQUIRED_DATA')
    })

    it('customer.subscription.updatedでACTIVEの場合、planTypeをPAIDに更新する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_1',
            status: 'active',
            current_period_end: 1893456000,
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_1',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_1',
        },
        data: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(1893456000 * 1000),
          endedAt: null,
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'PAID',
        },
      })

      expect(mockTransaction).toHaveBeenCalled()
    })

    it('customer.subscription.updatedでcanceledの場合、planTypeをFREEに更新する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_1',
            status: 'canceled',
            current_period_end: 1893456000,
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_1',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_1',
        },
        data: {
          status: 'CANCELED',
          currentPeriodEnd: new Date(1893456000 * 1000),
          endedAt: expect.any(Date),
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'FREE',
        },
      })

      expect(mockTransaction).toHaveBeenCalled()
    })

    it('customer.subscription.updatedでsubscriptionが存在しない場合はSUBSCRIPTION_NOT_FOUNDを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_missing',
            status: 'active',
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue(null)

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')
      ).rejects.toThrow('SUBSCRIPTION_NOT_FOUND')
    })

    it('customer.subscription.deletedでsubscriptionをCANCELEDにし、planTypeをFREEに更新する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_1',
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_1',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_1',
        },
        data: {
          status: 'CANCELED',
          endedAt: expect.any(Date),
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'FREE',
        },
      })

      expect(mockTransaction).toHaveBeenCalled()
    })

    it('invoice.payment_succeededでStripe Subscriptionを取得して状態を同期する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            subscription: 'sub_1',
          },
        },
      })

      mockSubscriptionsRetrieve.mockResolvedValue({
        id: 'sub_1',
        status: 'active',
        current_period_end: 1893456000,
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_1',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_1')

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_1',
        },
        data: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(1893456000 * 1000),
          endedAt: null,
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'PAID',
        },
      })
    })

    it('invoice.payment_succeededでsubscription IDがない場合はINVOICE_MISSING_SUBSCRIPTION_IDを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: {
          object: {},
        },
      })

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')
      ).rejects.toThrow('INVOICE_MISSING_SUBSCRIPTION_ID')
    })

    it('invoice.payment_failedでsubscriptionをEXPIREDにし、planTypeをFREEに更新する', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_1',
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_1',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_1',
        },
        data: {
          status: 'EXPIRED',
        },
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          planType: 'FREE',
        },
      })

      expect(mockTransaction).toHaveBeenCalled()
    })

    it('invoice.payment_failedでparent配下のsubscription IDを使える', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: {
          object: {
            parent: {
              subscription_details: {
                subscription: 'sub_parent',
              },
            },
          },
        },
      })

      mockSubscriptionFindUnique.mockResolvedValue({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_parent',
      })

      await handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')

      expect(mockSubscriptionFindUnique).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_parent',
        },
      })

      expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
        where: {
          stripeSubscriptionId: 'sub_parent',
        },
        data: {
          status: 'EXPIRED',
        },
      })
    })

    it('invoice.payment_failedでsubscription IDがない場合はINVOICE_MISSING_SUBSCRIPTION_IDを投げる', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: {
          object: {},
        },
      })

      await expect(
        handleStripeWebhookService(Buffer.from('{}'), 'sig_mock')
      ).rejects.toThrow('INVOICE_MISSING_SUBSCRIPTION_ID')
    })

    it('未対応イベントの場合はDB更新せずeventを返す', async () => {
      const { handleStripeWebhookService } = await import(
        '../services/paymentService'
      )

      mockConstructEvent.mockReturnValue({
        type: 'customer.created',
        data: {
          object: {},
        },
      })

      const event = await handleStripeWebhookService(
        Buffer.from('{}'),
        'sig_mock'
      )

      expect(mockSubscriptionUpsert).not.toHaveBeenCalled()
      expect(mockSubscriptionUpdate).not.toHaveBeenCalled()
      expect(mockUserUpdate).not.toHaveBeenCalled()
      expect(mockTransaction).not.toHaveBeenCalled()
      expect(event.type).toBe('customer.created')
    })
  })
})