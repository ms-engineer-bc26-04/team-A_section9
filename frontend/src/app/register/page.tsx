// 会員登録画面
// メール・パスワードでSupabase signUpを使って新規登録する

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
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

    // Supabase Auth で会員登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMessage('会員登録に失敗しました。もう一度お試しください')
      setIsLoading(false)
      return
    }

    // バックエンドのusersテーブルにユーザーを作成する
    if (data.session) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        })
      } catch (err) {
        console.error('ユーザー作成に失敗しました', err)
      }
    }

    // 登録成功時はログイン画面へ遷移
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* タイトル */}
        <h1 className="text-2xl font-bold text-center mb-2">新規会員登録</h1>

        {/* 人物アイコン */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/icon20.png"
            alt="会員登録"
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

        {/* 登録ボタン */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
        >
          {isLoading ? '登録中...' : '登録'}
        </button>

        {/* 区切り線 */}
        <hr className="my-6" />

        {/* ログインリンク */}
        <p className="text-center text-sm text-gray-500 mb-2">
          アカウントを作成済みの方
        </p>
        <Link href="/login">
          <button className="w-full border border-[#A0CD83] text-[#A0CD83] rounded-full py-3 font-bold text-sm">
            ログインはこちら
          </button>
        </Link>
      </div>
    </div>
  )
}
