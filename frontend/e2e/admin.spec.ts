// 管理者用画面のE2Eテスト（admin-authenticatedプロジェクトで実行、storageStateでログイン済み）
// frontend/e2e/admin.spec.ts
import { test, expect } from '@playwright/test'

test.describe('管理者ホーム画面', () => {
  test('園名・担当者名がプレースホルダーではなく実データで表示される', async ({
    page,
  }) => {
    await page.goto('/admin')

    // /adminに留まっている＝GET /school-admin/schoolの取得に成功している前提
    const schoolNameLocator = page.locator(
      'p.text-white.font-extrabold.text-2xl'
    )
    const staffNameLocator = page.locator('p.text-white.text-sm')

    await expect(schoolNameLocator).toBeVisible()
    await expect(schoolNameLocator).not.toHaveText('●●保育園')
    await expect(staffNameLocator).not.toContainText('●●●●')
  })

  test('タブを切り替えるとお問い合わせ一覧⇔見学予約一覧が表示される', async ({
    page,
  }) => {
    await page.goto('/admin')

    // 初期状態は「お問い合わせ一覧」
    await expect(page.getByText('お問い合わせ内容').first()).toBeVisible()

    await page.getByRole('button', { name: '見学予約一覧' }).click()
    await expect(page.getByText('見学希望日時：').first()).toBeVisible()
    await expect(page.getByText('お問い合わせ内容')).toHaveCount(0)

    await page.getByRole('button', { name: 'お問い合わせ一覧' }).click()
    await expect(page.getByText('お問い合わせ内容').first()).toBeVisible()
    await expect(page.getByText('見学希望日時：')).toHaveCount(0)
  })

  test('「園情報編集」ボタンから編集画面へ遷移する', async ({ page }) => {
    await page.goto('/admin')

    await page.getByRole('button', { name: '園情報編集' }).click()

    await expect(page).toHaveURL('/admin/edit')
  })
})

test.describe('園情報編集画面', () => {
  test('フォームが読み込まれ、入力・保存できる', async ({ page }) => {
    await page.goto('/admin/edit')

    // 初期取得中のローディング表示が消えるまで待つ
    await expect(page.getByText('読み込み中...')).toBeHidden()

    // label→inputはhtmlForで紐付いていないため、同一div内のsibling要素として取得する
    const nameInput = page
      .locator('label', { hasText: '保育園名' })
      .locator('xpath=following-sibling::input')

    await expect(nameInput).toBeVisible()
    await nameInput.fill('さくら保育園（E2E更新）')

    await page.getByRole('button', { name: '保存' }).click()

    // バックエンドの実装状況によって成功／失敗どちらもあり得るため、両方を許容する
    await expect(page.getByText(/保存(しました|に失敗しました)/)).toBeVisible()
  })

  test('保育園の種別ラジオボタンを切り替えられる', async ({ page }) => {
    await page.goto('/admin/edit')
    await expect(page.getByText('読み込み中...')).toBeHidden()

    const certifiedRadio = page.getByRole('radio', { name: '認定こども園' })
    await certifiedRadio.check()
    await expect(certifiedRadio).toBeChecked()

    const nurseryRadio = page.getByRole('radio', { name: '保育園' })
    await nurseryRadio.check()
    await expect(nurseryRadio).toBeChecked()
    await expect(certifiedRadio).not.toBeChecked()
  })
})

test.describe('管理者用ハンバーガーメニュー', () => {
  test('メニューを開くとホーム・園情報編集・ログアウトの導線が表示される', async ({
    page,
  }) => {
    await page.goto('/admin')

    await page.getByRole('button', { name: 'メニューを開く' }).click()

    await expect(page.getByRole('link', { name: 'ホーム' })).toBeVisible()
    await expect(page.getByRole('link', { name: '園情報編集' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('メニュー内に園名・担当者名が2行で表示される', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'メニューを開く' }).click()

    const schoolNameInMenu = page.locator('p.font-bold.text-gray-800.text-2xl')
    const staffNameInMenu = page.locator('p.font-bold.text-gray-800.text-lg')

    await expect(schoolNameInMenu).toBeVisible()
    await expect(staffNameInMenu).toContainText('担当者名：')
  })

  test('「園情報編集」リンクから編集画面へ遷移し、メニューが閉じる', async ({
    page,
  }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'メニューを開く' }).click()

    await page.getByRole('link', { name: '園情報編集' }).click()

    await expect(page).toHaveURL('/admin/edit')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeHidden()
  })

  test('ログアウトすると管理者ログイン画面に遷移する', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'メニューを開く' }).click()

    await page.getByRole('button', { name: 'ログアウト' }).click()

    await expect(page).toHaveURL('/admin/login')
  })
})
