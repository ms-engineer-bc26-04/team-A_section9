import { Prisma } from '@prisma/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'

export const getOrCreateCurrentUser = async (authUser: SupabaseUser) => {
  const email = authUser.email

  if (!email) {
    throw new Error('Supabaseユーザーのメールアドレスが取得できません')
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existingUserBySupabaseId = await tx.user.findUnique({
        where: {
          supabaseUserId: authUser.id,
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      if (existingUserBySupabaseId) {
        return existingUserBySupabaseId
      }

      const existingUserByEmail = await tx.user.findUnique({
        where: {
          email,
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      if (existingUserByEmail) {
        if (
          existingUserByEmail.supabaseUserId &&
          existingUserByEmail.supabaseUserId !== authUser.id
        ) {
          throw new Error('既存ユーザーのSupabaseユーザーIDが一致しません')
        }

        return await tx.user.update({
          where: {
            id: existingUserByEmail.id,
          },
          data: {
            supabaseUserId: authUser.id,
          },
          include: {
            subscription: true,
            preference: true,
          },
        })
      }

      return await tx.user.create({
        data: {
          supabaseUserId: authUser.id,
          email,
          planType: 'FREE',
        },
        include: {
          subscription: true,
          preference: true,
        },
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ supabaseUserId: authUser.id }, { email }],
        },
        include: {
          subscription: true,
          preference: true,
        },
      })

      if (user) {
        return user
      }
    }

    throw error
  }
}

type UserPreferenceInput = {
  preferredMealType?: 'SCHOOL_LUNCH' | 'LUNCH_BOX' | 'BOTH' | null
  preferredItemBurdenLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
  preferredDiaperSupport?: string | null
  preferredFutonSupport?: string | null
  preferredExtendedCare?: string | null
  preferredWeekdayEventsLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
  preferredParentAssociationLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
}

export const upsertUserPreference = async (
  userId: string,
  input: UserPreferenceInput
) => {
  return await prisma.userPreference.upsert({
    where: {
      userId,
    },
    update: {
      preferredMealType: input.preferredMealType ?? null,
      preferredItemBurdenLevel: input.preferredItemBurdenLevel ?? null,
      preferredDiaperSupport: input.preferredDiaperSupport ?? null,
      preferredFutonSupport: input.preferredFutonSupport ?? null,
      preferredExtendedCare: input.preferredExtendedCare ?? null,
      preferredWeekdayEventsLevel: input.preferredWeekdayEventsLevel ?? null,
      preferredParentAssociationLevel:
        input.preferredParentAssociationLevel ?? null,
    },
    create: {
      userId,
      preferredMealType: input.preferredMealType ?? null,
      preferredItemBurdenLevel: input.preferredItemBurdenLevel ?? null,
      preferredDiaperSupport: input.preferredDiaperSupport ?? null,
      preferredFutonSupport: input.preferredFutonSupport ?? null,
      preferredExtendedCare: input.preferredExtendedCare ?? null,
      preferredWeekdayEventsLevel: input.preferredWeekdayEventsLevel ?? null,
      preferredParentAssociationLevel:
        input.preferredParentAssociationLevel ?? null,
    },
  })
}
