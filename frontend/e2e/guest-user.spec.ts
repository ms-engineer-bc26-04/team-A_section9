// frontend/e2e/guest-user.spec.ts
import { test, expect } from '@playwright/test'

test.describe('未登録ユーザーの主要導線', () => {
  test('FE-001: ホーム画面が表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(
      page.getByText('復職後の生活が無理なく回る園を見つけよう')
    ).toBeVisible()
  })

  test('FE-002: 園検索ができる', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder('園の名前か住所で検索')
    await searchInput.fill('さくら')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/\/schools\/search\?keyword=/)
  })

  test('FE-003: 園詳細画面へ遷移できる', async ({ page }) => {
    await page.goto('/schools/search?keyword=保育園')

    // SchoolCard.tsx: FavoriteButton が absolute で重なっているため、
    // ハートボタンと被らない左側（画像・テキスト部分）をクリックする
    const firstSchoolLink = page.locator('a[href^="/schools/"]').first()
    await firstSchoolLink.scrollIntoViewIfNeeded()
    await firstSchoolLink.click({ position: { x: 10, y: 10 } })

    await expect(page).toHaveURL(/\/schools\/\d+$/)
  })

  test('FE-004: サポート情報がロック表示される', async ({ page }) => {
    await page.goto('/schools/1')

    // SchoolDetailSections.tsx: 未ログイン・一般ユーザーは isLocked のロックボタンが表示される
    await expect(page.getByText('プレミアムユーザーに')).toBeVisible()

    // 未登録ユーザーがロックボタンを押すと会員登録モーダルが開く（onShowRegisterModal）
    await page.getByText('プレミアムユーザーに').click()
    await expect(
      page.getByRole('heading', { name: '会員登録が必要です' })
    ).toBeVisible()
  })

  test('FE-005: お気に入り押下時にログイン誘導される', async ({ page }) => {
    await page.goto('/schools/search?keyword=保育園')

    // FavoriteButton.tsx の aria-label="お気に入り登録" を利用
    const favoriteButton = page
      .getByRole('button', { name: /お気に入り登録|お気に入り解除/ })
      .first()
    await favoriteButton.click()

    // 未ログイン時はModal経由で「ログインが必要です」が表示される実装
    await expect(
      page.getByRole('heading', { name: 'ログインが必要です' })
    ).toBeVisible()

    // ログインボタン押下で /login へ遷移することも確認
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('FE-006: プラン・料金画面へ遷移できる', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'メニューを開く' }).click()

    const plansLink = page.getByRole('link', { name: 'プラン・料金確認' })
    await expect(plansLink).toBeVisible()

    await plansLink.click({ force: true })
    await page.waitForURL('/plans', { timeout: 5000 })

    await expect(page).toHaveURL('/plans')
  })
})
