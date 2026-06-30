// frontend/e2e/general-user.spec.ts
import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

// お気に入りを全解除するヘルパー
async function clearAllFavorites(page: import('@playwright/test').Page) {
  await page.goto('/mypage/favorites')
  await page.waitForLoadState('networkidle')

  // 解除ボタンがなくなるまで繰り返しクリック
  while (true) {
    const removeButton = page.getByRole('button', { name: 'お気に入り解除' })
    const count = await removeButton.count()
    if (count === 0) break

    await removeButton.first().click()
    await page.waitForTimeout(500)
  }
}

// 指定件数のお気に入りを登録するヘルパー
async function registerFavorites(
  page: import('@playwright/test').Page,
  targetCount: number
) {
  await page.goto('/schools/search?keyword=保育園')

  for (let i = 0; i < targetCount; i++) {
    const button = page.getByRole('button', { name: 'お気に入り登録' }).first()
    await button.click()
    await page.waitForTimeout(500)
  }
}

test.describe('一般ユーザーの主要導線', () => {
  test('FE-010: プロフィールを保存できる', async ({ page }) => {
    await page.goto('/mypage/edit')

    await page.getByRole('button', { name: '保存' }).click()

    await expect(page.getByText('保存しました')).toBeVisible()
  })

  test('FE-011: お気に入り登録できる', async ({ page }) => {
    // 検索結果の件数に依存しないよう、先にお気に入りをリセットしておく
    await clearAllFavorites(page)

    await page.goto('/schools/search?keyword=保育園')

    const favoriteButton = page
      .getByRole('button', { name: 'お気に入り登録' })
      .first()
    await favoriteButton.click()

    await expect(
      page.getByRole('button', { name: 'お気に入り解除' }).first()
    ).toBeVisible({ timeout: 2000 })
  })

  test.describe('お気に入り登録済みの状態が必要なテスト', () => {
    test.beforeEach(async ({ page }) => {
      // 毎回リセットしてから2件登録することで、検索結果の在庫に依存しない状態を作る
      await clearAllFavorites(page)
      await registerFavorites(page, 2)

      await page.goto('/mypage/favorites')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('a[href^="/schools/"]').first()).toBeVisible({
        timeout: 10000,
      })
    })

    test('FE-012: お気に入り解除できる', async ({ page }) => {
      const initialCount = await page.locator('a[href^="/schools/"]').count()

      const removeButton = page
        .getByRole('button', { name: 'お気に入り解除' })
        .first()
      await removeButton.click()

      await expect(page.getByText('お気に入りを解除しました')).toBeVisible()
      await expect(page.locator('a[href^="/schools/"]')).toHaveCount(
        initialCount - 1
      )
    })

    test('FE-013: お気に入り上限が表示される', async ({ page }) => {
      await expect(page.getByText(/\/\s*5件登録中/)).toBeVisible()
    })

    test('FE-014: 2園比較できる', async ({ page }) => {
      const checkboxes = page.locator('.absolute.top-3.right-3')
      await checkboxes.nth(0).click()
      await checkboxes.nth(1).click()

      await page.getByRole('button', { name: '比較する' }).click()

      await expect(page).toHaveURL(/\/compare\?ids=/)
      await expect(page.getByText('2つの園で比較')).toBeVisible()
    })
  })

  test('FE-015: 3園比較は利用できない', async ({ page }) => {
    await clearAllFavorites(page)
    await registerFavorites(page, 3)

    await page.goto('/mypage/favorites')
    await page.waitForLoadState('networkidle')

    const checkboxes = page.locator('.absolute.top-3.right-3')
    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await checkboxes.nth(2).click()

    await expect(page.getByText('比較できるのは2園までです')).toBeVisible()
  })

  test('FE-016: サポート情報がロックされる', async ({ page }) => {
    await page.goto('/schools/search?keyword=保育園')
    await page
      .locator('a[href^="/schools/"]')
      .first()
      .click({
        position: { x: 10, y: 10 },
      })

    await expect(page.getByText('サポート情報')).toBeVisible()
    await expect(page.getByText('プレミアムユーザーに')).toBeVisible()
    await page.getByText('プレミアムユーザーに').click()
  })

  test('FE-017: Stripe Checkoutへ遷移できる', async ({ page }) => {
    await page.goto('/plans')
    // TODO: /plans 画面のコンポーネントが分かり次第、Checkoutボタンのセレクタを確定する
  })

  // ログアウトは全テストの最後に実行する
  test('FE-009: ログアウトできる', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'メニューを開く' }).click()
    await page.getByRole('button', { name: 'ログアウト' }).click()

    await expect(page).toHaveURL('/')
    await page.getByRole('button', { name: 'メニューを開く' }).click()
    await expect(
      page.getByRole('button', { name: '新規会員登録' })
    ).toBeVisible()
  })
})
