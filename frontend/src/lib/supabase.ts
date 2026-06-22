// src/lib/supabase.ts
//Supabaseに接続するクライアントを作成。アプリ全体でこの1つを使い回す

import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)