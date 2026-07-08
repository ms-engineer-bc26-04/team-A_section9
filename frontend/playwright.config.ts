// frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.test.local') })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [
        /general-user\.spec\.ts/,
        /premium-user\.spec\.ts/,
        /admin\.spec\.ts/,
      ],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: [
        /general-user\.spec\.ts/,
        /premium-user\.spec\.ts/,
        /admin\.spec\.ts/,
      ],
    },
    {
      name: 'general-user-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/general-user.json',
      },
      testMatch: /general-user\.spec\.ts/,
      dependencies: ['setup'],
    },
    {
      name: 'premium-user-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/premium-user.json',
      },
      testMatch: /premium-user\.spec\.ts/,
      dependencies: ['setup'],
    },
    {
      name: 'admin-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin-user.json',
      },
      testMatch: /^admin\.spec\.ts$/,
      dependencies: ['setup'],
    },
  ],
})
