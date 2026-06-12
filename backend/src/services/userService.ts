import { Prisma } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";

export const getOrCreateCurrentUser = async (authUser: SupabaseUser) => {
  const email = authUser.email;

  if (!email) {
    throw new Error("Supabaseユーザーのメールアドレスが取得できません");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existingUserBySupabaseId = await tx.user.findUnique({
        where: {
          supabaseUserId: authUser.id,
        },
        include: {
          subscription: true,
        },
      });

      if (existingUserBySupabaseId) {
        return existingUserBySupabaseId;
      }

      const existingUserByEmail = await tx.user.findUnique({
        where: {
          email,
        },
        include: {
          subscription: true,
        },
      });

      if (existingUserByEmail) {
        if (
          existingUserByEmail.supabaseUserId &&
          existingUserByEmail.supabaseUserId !== authUser.id
        ) {
          throw new Error("既存ユーザーのSupabaseユーザーIDが一致しません");
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
          },
        });
      }

      return await tx.user.create({
        data: {
          supabaseUserId: authUser.id,
          email,
          planType: "FREE",
        },
        include: {
          subscription: true,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ supabaseUserId: authUser.id }, { email }],
        },
        include: {
          subscription: true,
        },
      });

      if (user) {
        return user;
      }
    }

    throw error;
  }
};