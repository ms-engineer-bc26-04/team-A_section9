// ログイン画面
// メール・パスワードでSupabase signInWithPasswordを使ってログインする

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    // バリデーション
    if (!email) {
      setErrorMessage('メールアドレスを入力してください')
      return
    }
    if (!password) {
      setErrorMessage('パスワードを入力してください')
      return
    }
    if (password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('メールアドレスまたはパスワードが正しくありません')
      setIsLoading(false)
      return
    }

    // ログイン成功時はホームへ遷移
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* タイトル */}
        <h1 className="text-2xl font-bold text-center mb-2">ログイン</h1>

        {/* 鍵アイコン */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/icon19.png"
            alt="ログイン"
            width={80}
            height={80}
          />
        </div>

        {/* エラーメッセージ */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {errorMessage}
          </p>
        )}

        {/* メールアドレス */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            placeholder="例）example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {/* パスワード */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input
            type="password"
            placeholder="半角英数字8文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>

        {/* パスワードをお忘れの方（表示のみ） */}
        <p className="text-center text-[#A0CD83] text-sm mt-4">
          パスワードをお忘れの方
        </p>

        {/* 区切り線 */}
        <hr className="my-4" />

        {/* 会員登録リンク */}
        <p className="text-center text-sm text-gray-500 mb-2">
          アカウントをお持ちでない方
        </p>
        <Link href="/register">
          <button className="w-full border border-[#A0CD83] text-[#A0CD83] rounded-full py-3 font-bold text-sm">
            新規会員登録はこちら
          </button>
        </Link>
      </div>
    </div>
  )
}
