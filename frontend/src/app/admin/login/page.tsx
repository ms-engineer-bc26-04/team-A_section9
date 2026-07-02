// 保育園管理者ログイン画面
// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminHeader from '@/components/admin/AdminHeader'
import { supabase } from '@/lib/supabase'
import { getSchoolAdminMe } from '@/lib/api/schoolAdmin'

export default function AdminLoginPage() {
  const router = useRouter()
  const [accountId, setAccountId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!accountId.trim() || !password.trim()) {
      setError('アカウントIDとパスワードを入力してください')
      return
    }
    if (password.length < 6) {
      setError('パスワードは半角英数字6文字以上で入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: accountId,
        password,
      })

      if (authError) {
        setError('アカウントIDまたはパスワードが正しくありません')
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const accessToken = session?.access_token

      if (!accessToken) {
        setError('ログイン情報の取得に失敗しました')
        await supabase.auth.signOut()
        return
      }

      try {
        await getSchoolAdminMe(accessToken)
      } catch {
        setError('園管理者として登録されていません')
        await supabase.auth.signOut()
        return
      }

      router.push('/admin')
    } catch {
      setError('ログインに失敗しました。もう一度お試しください')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-white pt-15">
        <div className="max-w-2xl mx-auto px-4 pb-10">
          <div className="flex flex-col items-center mb-8 mt-4">
            <h1 className="text-2xl font-bold text-gray-500 text-center mb-6">
              保育園管理者サイト
              <br />
              ログイン
            </h1>
            <Image
              src="/images/icon28.png"
              alt="ログインアイコン"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col gap-5">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div>
              <label className="block text-base text-gray-800 mb-2">
                アカウントID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="例) example@enkatsu.local"
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#73c0ff]"
              />
            </div>

            <div>
              <label className="block text-base text-gray-800 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="半角英数字6文字以上"
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#73c0ff]"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#73c0ff] text-white font-extrabold rounded-full py-3 text-base hover:bg-[#5aabf0] active:bg-[#5aabf0] transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            {/* 追加：ENKATSUホーム画面に戻るボタン（Figma node-id=113-1200） */}
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white text-[#a0cd83] font-extrabold rounded-full py-3 text-base border-2 border-[#a0cd83] hover:bg-[#a0cd83]/10 active:bg-[#a0cd83]/10 transition-colors mt-2"
            >
              ENKATSUホーム画面に戻る
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
