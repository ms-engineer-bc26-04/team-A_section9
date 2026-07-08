// ログインを1回だけ実行し、認証状態を保存します。
// frontend/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const generalUserAuthFile = path.join(
  __dirname,
  '../playwright/.auth/general-user.json'
)
const premiumUserAuthFile = path.join(
  __dirname,
  '../playwright/.auth/premium-user.json'
)
const adminUserAuthFile = path.join(
  __dirname,
  '../playwright/.auth/admin-user.json'
)

setup('一般ユーザーとしてログインする', async ({ page }) => {
  const email = process.env.E2E_GENERAL_USER_EMAIL
  const password = process.env.E2E_GENERAL_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'E2E_GENERAL_USER_EMAIL / E2E_GENERAL_USER_PASSWORD が設定されていません'
    )
  }

  await page.goto('/login')
  await page.getByPlaceholder('例）example@mail.com').fill(email)
  await page.getByPlaceholder('半角英数字8文字以上').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: generalUserAuthFile })
})

setup('プレミアムユーザーとしてログインする', async ({ page }) => {
  const email = process.env.E2E_PREMIUM_USER_EMAIL
  const password = process.env.E2E_PREMIUM_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'E2E_PREMIUM_USER_EMAIL / E2E_PREMIUM_USER_PASSWORD が設定されていません'
    )
  }

  await page.goto('/login')
  await page.getByPlaceholder('例）example@mail.com').fill(email)
  await page.getByPlaceholder('半角英数字8文字以上').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: premiumUserAuthFile })
})

setup('保育園管理者としてログインする', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD が設定されていません')
  }

  await page.goto('/admin/login')
  await page.getByPlaceholder('例) example@enkatsu.local').fill(email)
  await page.getByPlaceholder('半角英数字6文字以上').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL('/admin')

  await page.context().storageState({ path: adminUserAuthFile })
})
