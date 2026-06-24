import Stripe from 'stripe'
import { prisma } from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
