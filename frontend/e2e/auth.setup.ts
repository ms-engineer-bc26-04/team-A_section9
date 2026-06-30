// ログインを1回だけ実行し、認証状態を保存します。
// frontend/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('一般ユーザーとしてログインする', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL / E2E_USER_PASSWORD が設定されていません。.env.test.local を確認してください'
    )
  }

  await page.goto('/login')
  await page.getByPlaceholder('例）example@mail.com').fill(email)
  await page.getByPlaceholder('半角英数字8文字以上').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  // LoginPage.tsx: ログイン成功時は / へ遷移する実装
  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: authFile })
})
