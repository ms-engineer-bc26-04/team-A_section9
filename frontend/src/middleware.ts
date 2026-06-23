// middleware.ts
// 認証・認可による画面制御
// 未ログインユーザーの認証必須画面へのアクセス制限と
// ログイン済みユーザーの /login・/register へのアクセス制限を行う

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 未ログインユーザーがアクセスできない画面
const protectedRoutes = [
  '/mypage',
  '/mypage/edit',
  '/mypage/favorites',
  '/compare',
  '/payment/complete',
  '/payment/cancel-complete',
]

// ログイン済みユーザーがアクセスできない画面
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログインユーザーが認証必須画面にアクセスした場合は /login へ遷移する
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ログイン済みユーザーが /login・/register にアクセスした場合は / へ遷移する
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/mypage/:path*',
    '/compare/:path*',
    '/payment/:path*',
    '/login',
    '/register',
  ],
}
