// Supabase Clientの設定
// フロントエンド全体でSupabaseと通信するための窓口
// ログイン処理でCookieにセッションを保存する設定を追加しました

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
