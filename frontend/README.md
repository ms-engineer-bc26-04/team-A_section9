# ENKATSU Frontend

保育園・こども園の検索・比較Webアプリ「ENKATSU 〜園活を円滑に〜」のフロントエンドです。

デプロイ先：[enkatsu-frontend.vercel.app](https://enkatsu-frontend.vercel.app)

## 目次

- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [セットアップ](#セットアップ)
- [環境変数](#環境変数)
- [開発コマンド](#開発コマンド)
- [テスト](#テスト)
- [Lint・フォーマット](#lintフォーマット)
- [今後の課題](#今後の課題)

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | [Next.js](https://nextjs.org/) 16（App Router） |
| 言語 | TypeScript |
| UI | React / Tailwind CSS |
| アニメーション | Framer Motion |
| データ取得・キャッシュ | SWR |
| チャート | Recharts |
| 認証 | Supabase Auth（`@supabase/ssr` / `@supabase/supabase-js`） |
| 単体テスト | Vitest / React Testing Library |
| E2Eテスト | Playwright |
| Lint / Format | ESLint / Prettier |

## ディレクトリ構成

```
frontend/
├── e2e/                        Playwright E2Eテスト
│   ├── auth.setup.ts           一般・プレミアム・管理者アカウントのログイン状態を保存
│   ├── guest-user.spec.ts      未登録ユーザーの主要導線
│   ├── general-user.spec.ts    一般ユーザーの主要導線
│   ├── premium-user.spec.ts    プレミアムユーザーの主要導線
│   ├── admin-login.spec.ts     管理者ログイン画面（未認証）
│   └── admin.spec.ts           管理者ホーム・編集・ハンバーガーメニュー（認証済み）
├── src/
│   ├── app/                    Next.js App Router（ページ）
│   │   ├── page.tsx             ホーム画面
│   │   ├── globals.css          スタイリング
│   │   ├── layout.tsx           全画面共通の外枠
│   │   ├── loading.tsx          ページ遷移中に自動で表示されるローディング画面
│   │   ├── not-found.tsx        存在しないURLにアクセスした時の404画面
│   │   ├── admin/               管理者サイト（ログイン・ホーム・編集）
│   │   ├── mypage/               マイページ（プロフィール編集・お気に入り）
│   │   ├── schools/               園検索・園詳細
│   │   ├── compare/               比較・比較チャート
│   │   ├── payment/               プレミア登録完了・キャンセル画面
│   │   ├── plans/               　プラン・料金画面
│   │   ├── register/              新規登録
│   │   └── login/                 ログイン
│   ├── components/
│   │   ├── admin/                管理者用ヘッダー・ハンバーガーメニュー
│   │   ├── common/                Button・Modal・Toast・Skeleton等の共通部品
│   │   ├── compare/               比較テーブル・レーダーチャート
│   │   ├── mypage/                プロフィール・希望条件フォーム
│   │   └── school/                園カード・検索・お気に入り関連
│   ├── lib/
│   │   ├── api/                  バックエンドAPIクライアント
│   │   ├── hooks/                 useAuth・useFavorites等
│   │   └── supabase.ts            Supabaseクライアント初期化
│   ├── types/                    共通の型定義
│   └── __tests__/                 単体テスト（srcの構成に合わせて配置）
├── playwright.config.ts
└── package.json
```

## セットアップ

このリポジトリはルートの`docker-compose.yml`でfrontend・backend・redisをまとめて起動する構成です。

```powershell
# リポジトリルートで実行
cd team-A_section9
docker compose up
```

frontendのみをローカルで直接動かす場合：

```powershell
cd frontend
npm install
npm run dev
```

`http://localhost:3000`でアクセスできます。

## 環境変数

### `.env.local`（開発・ビルド用）

```
NEXT_PUBLIC_SUPABASE_URL=（SupabaseプロジェクトのURL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabaseのanon key）
NEXT_PUBLIC_API_URL=（バックエンドAPIのURL。例: http://localhost:4000）
```

### `.env.test.local`（E2Eテスト用・gitignore対象）

```
E2E_GENERAL_USER_EMAIL=（一般ユーザーのメールアドレス）
E2E_GENERAL_USER_PASSWORD=（一般ユーザーのパスワード）
E2E_PREMIUM_USER_EMAIL=（プレミアムユーザーのメールアドレス）
E2E_PREMIUM_USER_PASSWORD=（プレミアムユーザーのパスワード）
E2E_ADMIN_EMAIL=（保育園管理者アカウントのメールアドレス）
E2E_ADMIN_PASSWORD=（保育園管理者アカウントのパスワード）
```

> ⚠️ 現在のE2Eテストは、発表会用デモ環境として使用しているSupabaseプロジェクトに対して実行されます。テスト用のSupabaseプロジェクトが用意できるまでは、CI（GitHub Actions）でのE2E自動実行は行わない方針です。詳細は[E2Eテストシナリオドキュメント](./E2E_test_scenario.md)を参照してください。

## 開発コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番ビルドの起動 |
| `npm run lint` | ESLint実行 |
| `npm run lint:fix` | ESLint自動修正 |
| `npm run format` | Prettierでフォーマット |
| `npm run format:check` | フォーマットのチェックのみ |
| `npm run test:unit` | 単体テスト（Vitest）を一度だけ実行 |
| `npm run test:unit:watch` | 単体テストをwatchモードで実行 |
| `npm run test:unit:ui` | Vitest UIモードで実行 |
| `npm run test:unit:coverage` | カバレッジ計測付きで実行 |
| `npm run test:e2e` | E2Eテスト（Playwright）を実行 |
| `npm run test:e2e:ui` | Playwright UIモードで実行 |
| `npm run test:e2e:report` | 直近のHTMLレポートを表示 |

## テスト

### 単体テスト（Vitest）

`src/__tests__/`配下に、`src/`と同じディレクトリ構造で配置しています。

```powershell
npm run test:unit
npm run test:unit -- src/__tests__/components/school/SchoolCard.test.tsx
```

主な方針：
- `useAuth`・`useFavorites`・API呼び出し・子コンポーネントはモック化し、対象コンポーネント自体のロジックを検証する
- `vi.mock`は、内部で`@/lib/supabase`をimportしているモジュール（`useAuth`等）に対しては、ファクトリを渡さない自動モックだと実体が読み込まれてエラーになるため、明示的にファクトリを渡す

### E2Eテスト（Playwright）

`storageState`機能でログイン状態をファイルに保存し、テストごとの再ログインを省略しています。

```powershell
npm run test:e2e                              # 全テスト実行
npm run test:e2e -- -g "FE-013"               # 特定シナリオのみ
npm run test:e2e -- e2e/admin.spec.ts         # 特定ファイルのみ
npm run test:e2e -- e2e/admin.spec.ts --project=admin-authenticated  # プロジェクト指定
```

プロジェクト構成・シナリオ一覧の詳細は[`E2E_test_scenario.md`](./E2E_test_scenario.md)を参照してください。

## Lint・フォーマット

```powershell
npm run lint
npm run format
```

PowerShell環境では`grep`の代わりに`Select-String`を使用してください。また、`npm run test:unit`等に引数を渡す場合は`--`を挟む必要があります（例：`npm run test:unit -- src/__tests__/xxx`）。

## 今後の課題

- 画像最適化（`sizes`属性の全画像への指定、lazy loading、アップロード時のリサイズ・WebP変換）が未対応
- アクセシビリティは`aria-label`とコントラスト対応止まりで、キーボードナビゲーション・スクリーンリーダーの本格対応は未着手
