import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";

export const getOrCreateCurrentUser = async (authUser: SupabaseUser) => {
  const email = authUser.email;

  if (!email) {
    throw new Error("Supabaseユーザーのメールアドレスが取得できません");
  }

  const existingUserBySupabaseId = await prisma.user.findUnique({
    where: {
      supabaseUserId: authUser.id,
    },
    include: {
      subscription: true,
    },
  });

  if (existingUserBySupabaseId) {
    return await prisma.user.update({
      where: {
        id: existingUserBySupabaseId.id,
      },
      data: {
        email,
      },
      include: {
        subscription: true,
      },
    });
  }

  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      subscription: true,
    },
  });

  if (existingUserByEmail) {
    return await prisma.user.update({
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

  return await prisma.user.create({
    data: {
      supabaseUserId: authUser.id,
      email,
      planType: "FREE",
    },
    include: {
      subscription: true,
    },
  });
};