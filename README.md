# ENKATSU

〜園活を円滑に〜

## 概要

ENKATSU は、共働き家庭・仕事復帰を控えた保護者向けに、保育園・こども園の「復職後の保護者負担」を検索・比較できる Web アプリケーションです。

園そのものの良し悪しではなく、保護者が復職後に感じる **生活負担**・**時間負担** に焦点を当てて、家庭に合う園を比較できるようにします。

また、保護者向けの検索・比較機能に加えて、園情報を管理するための **園管理画面** も実装しています。園管理者は、園情報や園に紐づく詳細情報を管理できるため、利用者向け画面に表示する情報を保育園側から更新できる構成にしています。

---

## MVP範囲

### 未登録ユーザー

- ホーム画面の閲覧
- 園一覧・検索結果の閲覧
- 園詳細の閲覧
- 保育園名・住所検索
- 条件検索
- プラン・料金画面の閲覧

### 一般ユーザー

- 会員登録・ログイン・ログアウト
- お気に入り登録・解除
- お気に入り3件まで登録
- 2園比較
- マイページ閲覧
- プロフィール編集
- 希望条件の保存

### プレミアムユーザー

- お気に入り無制限
- 3園比較
- 希望条件との一致表示
- サポート情報の閲覧
- Stripe Checkout によるプレミアム登録
- Stripe Customer Portal によるプラン変更

### 園管理者

- 園管理画面へのログイン
- 園情報の閲覧
- 園情報の編集
- 園に紐づく詳細情報の管理

---

## 技術スタック

| 分類       | 技術                                                      |
| ---------- | --------------------------------------------------------- |
| Frontend   | Next.js / TypeScript / Tailwind CSS                       |
| Backend    | Express.js / TypeScript                                   |
| Database   | Supabase Postgres                                         |
| ORM        | Prisma                                                    |
| Auth       | Supabase Auth                                             |
| Cache      | Redis / Upstash Redis                                     |
| Payment    | Stripe Checkout / Stripe Customer Portal / Stripe Webhook |
| Validation | Zod                                                       |
| Logging    | Pino                                                      |
| Security   | Helmet / CORS / Rate Limit                                |
| Test       | Vitest / Supertest / Playwright                           |
| CI         | GitHub Actions                                            |
| Deploy     | Render（Backend） / Vercel（Frontend）                    |
| Container  | Docker / Docker Compose                                   |

---

## アーキテクチャ概要

```txt
User
  ↓
Frontend（Next.js）
  ↓
Backend API（Express.js）
  ↓
Prisma
  ↓
Supabase Postgres

Backend API
  ├─ Supabase Auth：認証
  ├─ Redis：園一覧・検索結果のキャッシュ
  └─ Stripe：プレミアム登録・解約・Webhook
```

---

## ディレクトリ構成

```txt
.
├── .github/                # GitHub Actions などの設定
├── .vscode/                # VS Code 設定
├── backend/                # バックエンドアプリケーション
├── frontend/               # フロントエンドアプリケーション
├── docs/                   # 企画・要件・各種設計ドキュメント
│   ├── context/            # 補足資料・背景情報
│   ├── diagrams/           # 図・画像資料
│   ├── 画面遷移図/         # 画面遷移図
│   ├── API設計.md
│   ├── DB設計.md
│   ├── GitHub運用.md
│   ├── PRD.md
│   ├── ペルソナ案(最終版).md
│   ├── セキュリティ設計.md
│   ├── デプロイ.md
│   ├── デプロイ確認.md
│   ├── テスト設計書.md
│   ├── ログ設計.md
│   ├── 性能設計.md
│   ├── 画面設計.md
│   ├── 要件定義.md
│   └── 運用設計.md
├── docker-compose.yml
└── README.md
```

---

## ドキュメント

### 企画・要件

| ドキュメント                                | 内容                                          |
| ------------------------------------------- | --------------------------------------------- |
| [PRD](docs/PRD.md)                          | プロダクトの目的・背景・価値を整理            |
| [ペルソナ案](<docs/ペルソナ案(最終版).md>) | MVPで想定する利用者像・課題・利用シーンを整理 |
| [要件定義](docs/要件定義.md)                | MVPの機能要件・非機能要件・ユーザー区分を整理 |

### 設計

| ドキュメント                                 | 内容                                                  |
| -------------------------------------------- | ----------------------------------------------------- |
| [画面設計](docs/画面設計.md)                 | 画面一覧・表示項目・操作内容を整理                    |
| [画面遷移図](docs/画面遷移図/)               | 画面間の遷移・ユーザー区分ごとの導線を整理            |
| [DB設計](docs/DB設計.md)                     | テーブル定義・リレーション・制約を整理                |
| [API設計](docs/API設計.md)                   | エンドポイント・リクエスト・レスポンスを整理          |
| [性能設計](docs/性能設計.md)                 | Redisキャッシュ対象API・TTL・キャッシュキー方針を整理 |
| [セキュリティ設計](docs/セキュリティ設計.md) | Helmet / CORS / Rate Limit / 認証確認を整理           |
| [ログ設計](docs/ログ設計.md)                 | Pinoログ・cache hit / cache miss の確認方法を整理     |
| [テスト設計書](docs/テスト設計書.md)         | MVP主要機能・API・デモ前確認のテスト観点を整理        |

### 開発・運用

| ドキュメント                         | 内容                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| [GitHub運用](docs/GitHub運用.md)     | ブランチ・Issue・PR・レビュー・マージ運用を整理                       |
| [運用設計](docs/運用設計.md)         | Redisキャッシュ・ログ・セキュリティ設定を含む運用確認手順を整理       |
| [デプロイ](docs/デプロイ.md)         | デプロイ構成・デプロイURL・Redis確認方法を整理                        |
| [デプロイ確認](docs/デプロイ確認.md) | MVPデモ用デプロイURL・主要導線確認手順・外部サービス設定の注意点を整理 |

### 補足資料

| ドキュメント・ディレクトリ     | 内容                       |
| ------------------------------ | -------------------------- |
| [context](docs/context/)       | 要件や設計の補足資料を管理 |
| [ER図](docs/diagrams/ER図.jpg) | データベース構成図         |

---

## デプロイ構成

MVPデモ用のデプロイ環境は以下です。

| 項目          | 内容                                 |
| ------------- | ------------------------------------ |
| Frontend      | Vercel                               |
| Backend       | Render                               |
| Database      | Supabase PostgreSQL                  |
| Auth          | Supabase Auth                        |
| Cache         | Upstash Redis                        |
| Payment       | Stripe Test Mode                     |
| Deploy Branch | staging                              |
| Frontend URL  | https://enkatsu-frontend.vercel.app  |
| Backend URL   | https://enkatsu-backend-sg.onrender.com |

### デプロイ確認・主要導線確認

デプロイ環境での確認手順、Supabase Auth / Stripe Webhook / Redis / CORS などの注意点は、以下に整理しています。

- [デプロイ](docs/デプロイ.md)
- [デプロイ確認](docs/デプロイ確認.md)

### 注意点

- デモ確認は `https://enkatsu-frontend.vercel.app` を利用します。
- Vercel の Production Branch は `staging` です。
- Render の Backend デプロイ対象ブランチも `staging` です。
- シークレット情報の実値は README / docs / GitHub Issue / PR本文には記載しません。

---

## 開発の始め方

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd team-A_section9
```

---

### 2. backend の環境変数を作成

Git Bash / macOS の場合：

```bash
cp backend/.env.example backend/.env
```

Windows コマンドプロンプトの場合：

```bash
copy backend\.env.example backend\.env
```

`backend/.env` を開いて、担当者から共有された値を設定してください。

| キー                    | 内容                              |
| ----------------------- | --------------------------------- |
| `DATABASE_URL`          | Supabase接続URL（Pooler）         |
| `DIRECT_URL`            | Supabase接続URL（Direct）         |
| `SUPABASE_URL`          | SupabaseプロジェクトURL           |
| `SUPABASE_SERVICE_KEY`  | Supabase service_roleキー         |
| `REDIS_URL`             | ローカルでは `redis://redis:6379` |
| `LOG_LEVEL`             | Pinoログの出力レベル              |
| `STRIPE_SECRET_KEY`     | Stripeシークレットキー            |
| `STRIPE_PRICE_ID`       | Stripe Price ID                   |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret             |
| `FRONTEND_URL`          | `http://localhost:3000`           |
| `PORT`                  | `4000`                            |

---

### 3. frontend の環境変数を作成

Git Bash / macOS の場合：

```bash
cp frontend/.env.example frontend/.env.local
```

Windows コマンドプロンプトの場合：

```bash
copy frontend\.env.example frontend\.env.local
```

`frontend/.env.local` を開いて、必要な値を設定してください。

| キー                            | 内容                    |
| ------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:4000` |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonキー       |

---

### 4. Docker Compose で起動

初回：

```bash
docker compose up --build
```

2回目以降：

```bash
docker compose up
```

---

### 5. 動作確認

| サービス | URL                   | 確認方法                            |
| -------- | --------------------- | ----------------------------------- |
| Frontend | http://localhost:3000 | ブラウザでアクセス                  |
| Backend  | http://localhost:4000 | `curl http://localhost:4000/health` |
| Redis    | localhost:6379        | Docker Compose 経由で接続           |

```bash
curl http://localhost:4000/health
```

正常な場合：

```json
{
  "status": "ok"
}
```

園一覧API確認：

```bash
curl http://localhost:4000/api/v1/schools
```

---

## よく使うコマンド

### Docker

```bash
docker compose up
docker compose down
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose up --build
```

### Frontend

```bash
cd frontend
npm run dev
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Backend

```bash
cd backend
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
```

### Prisma

```bash
docker compose exec backend npx prisma migrate dev --name <マイグレーション名>
docker compose exec backend npx prisma generate
docker compose exec backend npx prisma studio
```

---

## 品質チェック

本プロジェクトでは、コード品質を保つために ESLint / Prettier を導入しています。

また、`develop` ブランチへの Pull Request 作成時に GitHub Actions が自動で実行され、Lint / Format チェックや Backend テストが行われます。

詳細な運用は [GitHub運用](docs/GitHub運用.md) を参照してください。

### ローカルで確認する場合

#### Frontend

```bash
cd frontend
npm run lint
npm run format:check
```

#### Backend

```bash
cd backend
npm run lint
npm run format:check
npm run test
```

---

## ブランチ運用

基本方針は以下です。

```txt
main      # 最終提出・安定版
develop   # 開発統合ブランチ
staging   # デモ・デプロイ確認用ブランチ
feature/* # 機能・修正ごとの作業ブランチ
docs/*    # ドキュメント修正用ブランチ
```

通常開発は `feature/*` または `docs/*` → `develop` の流れで行います。

Backend の Render デプロイ対象ブランチは `staging` です。  
Frontend の Vercel Production Branch も `staging` です。  
デモ環境へ反映したいタイミングで、`develop` の内容を `staging` に反映します。

詳細は [GitHub運用](docs/GitHub運用.md) を参照してください。

---

## Stripe Webhook のローカル確認方法

詳細な決済仕様は [API設計](docs/API設計.md) や [運用設計](docs/運用設計.md) を参照してください。

### Stripe CLI のインストール

```bash
brew install stripe/stripe-cli/stripe
```

### Stripe CLI にログイン

```bash
stripe login
```

### Webhook をローカルへ転送

```bash
stripe listen --forward-to localhost:4000/api/v1/payment/webhook
```

表示された `whsec_...` を `.env` の `STRIPE_WEBHOOK_SECRET` に設定し、バックエンドを再起動します。

```bash
npm run dev
```

### Webhook 動作確認

別ターミナルで以下を実行します。

```bash
stripe trigger checkout.session.completed
```

---

## 補足

MVPでは、実在園データの大量登録は対象外です。

園データは seed データとして登録し、検索・比較・お気に入り登録・プレミアム機能の動作確認に利用します。