import type { User as SupabaseUser } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'

export const getOrCreateCurrentUser = async (authUser: SupabaseUser) => {
  const email = authUser.email

  if (!email) {
    throw new Error('Supabaseユーザーのメールアドレスが取得できません')
  }

  const user = await prisma.user.upsert({
    where: {
      supabaseUserId: authUser.id,
    },
    update: {
      email,
    },
    create: {
      supabaseUserId: authUser.id,
      email,
      planType: 'FREE',
    },
    include: {
      subscription: true,
    },
  })

  return user
}
