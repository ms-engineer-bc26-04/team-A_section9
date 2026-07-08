// 管理者ログイン画面のE2Eテスト（未認証状態で毎回操作する）
// frontend/e2e/admin-login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('管理者ログイン画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
  })

  test('アカウントID・パスワード未入力でログインするとエラーメッセージを表示する', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('アカウントIDとパスワードを入力してください')
    ).toBeVisible()
    await expect(page).toHaveURL('/admin/login')
  })

  test('パスワードが6文字未満の場合はエラーメッセージを表示する', async ({
    page,
  }) => {
    await page
      .getByPlaceholder('例) example@enkatsu.local')
      .fill('school-admin@example.com')
    await page.getByPlaceholder('半角英数字6文字以上').fill('abc12')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('パスワードは半角英数字6文字以上で入力してください')
    ).toBeVisible()
    await expect(page).toHaveURL('/admin/login')
  })

  test('誤ったパスワードでログインするとエラーメッセージを表示する', async ({
    page,
  }) => {
    await page
      .getByPlaceholder('例) example@enkatsu.local')
      .fill('school-admin@example.com')
    await page
      .getByPlaceholder('半角英数字6文字以上')
      .fill('wrong-password-123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('アカウントIDまたはパスワードが正しくありません')
    ).toBeVisible()
    await expect(page).toHaveURL('/admin/login')
  })

  test('「ENKATSUホーム画面に戻る」ボタンでトップページに遷移する', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'ENKATSUホーム画面に戻る' }).click()

    await expect(page).toHaveURL('/')
  })

  test('正しいアカウントID・パスワードでログインすると管理者ホームに遷移する', async ({
    page,
  }) => {
    const email = process.env.E2E_ADMIN_EMAIL
    const password = process.env.E2E_ADMIN_PASSWORD

    if (!email || !password) {
      throw new Error(
        'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD が設定されていません'
      )
    }

    await page.getByPlaceholder('例) example@enkatsu.local').fill(email)
    await page.getByPlaceholder('半角英数字6文字以上').fill(password)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL('/admin')
  })
})
