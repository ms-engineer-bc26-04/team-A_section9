import Stripe from 'stripe'
import { prisma } from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// FIX: Stripeの型は named import せず、stripeインスタンスの戻り値から取得する
type StripeSubscription = Awaited<
  ReturnType<typeof stripe.subscriptions.retrieve>
>

type StripeCheckoutSession = Awaited<
  ReturnType<typeof stripe.checkout.sessions.retrieve>
>

type StripeInvoice = Awaited<ReturnType<typeof stripe.invoices.retrieve>>

export const createCheckoutSessionService = async (supabaseUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId,
    },
    include: {
      subscription: true,
    },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  if (user.subscription?.status === 'ACTIVE') {
    throw new Error('ALREADY_PREMIUM')
  }

  let customerId = user.subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        supabaseUserId: user.supabaseUserId ?? '',
      },
    })

    customerId = customer.id

    await prisma.subscription.upsert({
      where: {
        userId: user.id,
      },
      update: {
        stripeCustomerId: customerId,
      },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        status: 'CANCELED',
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    metadata: {
      userId: user.id,
      supabaseUserId: user.supabaseUserId ?? '',
    },
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment/complete`,
    cancel_url: `${process.env.FRONTEND_URL}/plans`,
  })

  return {
    checkoutUrl: session.url,
  }
}

const updateSubscriptionToActive = async (
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  currentPeriodEnd?: Date
) => {
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: {
        userId,
      },
      update: {
        stripeCustomerId,
        stripeSubscriptionId,
        status: 'ACTIVE',
        currentPeriodEnd,
        endedAt: null,
      },
      create: {
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: 'ACTIVE',
        currentPeriodEnd,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        planType: 'PAID',
      },
    }),
  ])
}

const updateSubscriptionToCanceled = async (stripeSubscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId,
    },
  })

  if (!subscription) {
    throw new Error('SUBSCRIPTION_NOT_FOUND')
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: {
        stripeSubscriptionId,
      },
      data: {
        status: 'CANCELED',
        endedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: {
        id: subscription.userId,
      },
      data: {
        planType: 'FREE',
      },
    }),
  ])
}

const updateSubscriptionToExpired = async (stripeSubscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId,
    },
  })

  if (!subscription) {
    throw new Error('SUBSCRIPTION_NOT_FOUND')
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: {
        stripeSubscriptionId,
      },
      data: {
        status: 'EXPIRED',
      },
    }),
    prisma.user.update({
      where: {
        id: subscription.userId,
      },
      data: {
        planType: 'FREE',
      },
    }),
  ])
}

const getCurrentPeriodEnd = (subscription: StripeSubscription) => {
  const currentPeriodEnd = (
    subscription as StripeSubscription & { current_period_end?: number }
  ).current_period_end

  return currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined
}

const syncSubscriptionStatus = async (
  stripeSubscription: StripeSubscription
) => {
  const stripeSubscriptionId = stripeSubscription.id
  const currentPeriodEnd = getCurrentPeriodEnd(stripeSubscription)

  const status =
    stripeSubscription.status === 'active' ||
    stripeSubscription.status === 'trialing'
      ? 'ACTIVE'
      : stripeSubscription.status === 'canceled'
        ? 'CANCELED'
        : 'EXPIRED'

  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId,
    },
  })

  if (!subscription) {
    throw new Error('SUBSCRIPTION_NOT_FOUND')
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: {
        stripeSubscriptionId,
      },
      data: {
        status,
        currentPeriodEnd,
        endedAt: status === 'CANCELED' ? new Date() : null,
      },
    }),
    prisma.user.update({
      where: {
        id: subscription.userId,
      },
      data: {
        planType: status === 'ACTIVE' ? 'PAID' : 'FREE',
      },
    }),
  ])
}

export const handleStripeWebhookService = async (
  body: Buffer | string,
  signature: string | string[] | undefined
) => {
  if (!signature || Array.isArray(signature)) {
    throw new Error('INVALID_SIGNATURE')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET_NOT_SET')
  }

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

  console.log('Stripe webhook received:', event.type)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as StripeCheckoutSession

      const userId = session.client_reference_id
      const stripeCustomerId = session.customer as string
      const stripeSubscriptionId = session.subscription as string

      if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        throw new Error('CHECKOUT_SESSION_MISSING_REQUIRED_DATA')
      }

      await updateSubscriptionToActive(
        userId,
        stripeCustomerId,
        stripeSubscriptionId
      )

      console.log('checkout.session.completed processed')
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as StripeSubscription

      await syncSubscriptionStatus(subscription)

      console.log('customer.subscription.updated processed')
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as StripeSubscription

      await updateSubscriptionToCanceled(subscription.id)

      console.log('customer.subscription.deleted processed')
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as StripeInvoice & {
        subscription?: string
        parent?: {
          subscription_details?: {
            subscription?: string
          }
        }
      }

      const stripeSubscriptionId =
        invoice.subscription ??
        invoice.parent?.subscription_details?.subscription

      if (!stripeSubscriptionId) {
        throw new Error('INVOICE_MISSING_SUBSCRIPTION_ID')
      }

      const subscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId)

      await syncSubscriptionStatus(subscription)

      console.log('invoice.payment_succeeded processed')
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as StripeInvoice & {
        subscription?: string
        parent?: {
          subscription_details?: {
            subscription?: string
          }
        }
      }

      const stripeSubscriptionId =
        invoice.subscription ??
        invoice.parent?.subscription_details?.subscription

      if (!stripeSubscriptionId) {
        throw new Error('INVOICE_MISSING_SUBSCRIPTION_ID')
      }

      await updateSubscriptionToExpired(stripeSubscriptionId)

      console.log('invoice.payment_failed processed')
      break
    }

    default:
      console.log('Unhandled Stripe event:', event.type)
      break
  }

  return event
}
