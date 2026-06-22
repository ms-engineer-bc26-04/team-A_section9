# ENKATSU

〜園活を円滑に〜

## 概要

ENKATSU は、共働き家庭・仕事復帰を控えた保護者向けに、保育園・こども園の「復職後の保護者負担」を検索・比較できる Web アプリケーションです。

既存の園検索サービスでは、所在地・定員・開園時間などの制度情報は確認できますが、実際に通わせるうえで重要な「毎日の準備負担」「平日行事」「延長保育の利用実態」「連絡帳や欠席連絡のしやすさ」などは分かりにくい課題があります。

ENKATSU では、園そのものの良し悪しではなく、保護者が復職後に感じる **生活負担**・**時間負担** に焦点を当てて、家庭に合う園を比較できるようにします。

---

## 企画

### Issue

| 項目                | 内容                              |
| ----------------- | ------------------------------- |
| 誰の課題？             | 共働き家庭・仕事復帰を控えた保護者               |
| なにに困っている？         | 園の制度情報だけでは、復職後に生活が回るか判断しづらい     |
| 本来はどうあるべき？        | 保護者負担や実際の通園後の生活をイメージしながら園を比較できる |
| 既存のソリューションは？      | 自治体の園一覧、園検索サイト、口コミサイト、園見学       |
| その課題が解決されたらいくら払う？ | 500円 / 月                        |

### Solution

| 項目                           | 内容                                                   |
| ---------------------------- | ---------------------------------------------------- |
| どうやって解決する？                   | 園情報を生活負担・時間負担・サポート情報に整理し、検索・お気に入り・比較できるようにする         |
| 実現できたら実際に解決できる？              | 園見学前の比較負担を減らし、復職後の生活を想像しやすくなる                        |
| 優位性は？                        | 制度情報や口コミではなく、保護者の生活負担に絞って比較できる                       |
| デメリットや副作用はある？                | MVPでは実在園データではなく seed データを利用するため、実サービスとして使うにはデータ収集が必要 |
| デメリットと天秤にかけてもこのソリューションを使うべき？ | Yes。MVPでは課題仮説と機能価値の検証を優先する                           |

---

## MVP範囲

### 未登録ユーザー

* ホーム画面の閲覧
* 園一覧・検索結果の閲覧
* 園詳細の閲覧
* 保育園名・住所検索
* 条件検索
* プラン・料金画面の閲覧

### 一般ユーザー

* 会員登録・ログイン・ログアウト
* お気に入り登録・解除
* お気に入り5件まで登録
* 2園比較
* マイページ閲覧
* プロフィール編集
* 希望条件の保存

### プレミアムユーザー

* お気に入り無制限
* 3園比較
* 希望条件との一致表示
* サポート情報の閲覧
* Stripe Checkout によるプレミアム登録
* Stripe Customer Portal によるプラン変更

---

## 技術スタック

| 分類         | 技術                                                        |
| ---------- | --------------------------------------------------------- |
| Frontend   | Next.js / TypeScript / Tailwind CSS                       |
| Backend    | Express.js / TypeScript                                   |
| Database   | Supabase Postgres                                         |
| ORM        | Prisma                                                    |
| Auth       | Supabase Auth                                             |
| Cache      | Redis                                                     |
| Payment    | Stripe Checkout / Stripe Customer Portal / Stripe Webhook |
| Validation | Zod                                                       |
| Logging    | Pino                                                      |
| Security   | Helmet / CORS / Rate Limit                                |
| Test       | Vitest / Supertest                                        |
| CI         | GitHub Actions                                            |
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
  ├─ Redis：園一覧・検索結果・おすすめ表示のキャッシュ
  └─ Stripe：プレミアム登録・解約・Webhook
```

---

## ディレクトリ構成

```txt
.
├── .github/          # GitHub Actions などの設定
├── .vscode/          # VS Code 設定
├── backend/          # バックエンドアプリケーション
├── frontend/         # フロントエンドアプリケーション
├── docs/             # 企画・要件・各種設計ドキュメント
│   ├── context/      # 補足資料・背景情報
│   ├── diagrams/     # 図・画像資料
│   ├── 画面遷移図/   # 画面遷移図
│   ├── API設計.md
│   ├── DB設計.md
│   ├── PRD.md
│   ├── 画面設計.md
│   ├── 開発運用設計.md
│   └── 要件定義.md
├── docker-compose.yml
└── README.md
```

---

## ドキュメント

### 企画・要件

| ドキュメント               | 内容                       |
| -------------------- | ------------------------ |
| [PRD](docs/PRD.md)   | プロダクトの目的・背景・価値を整理        |
| [要件定義](docs/要件定義.md) | MVPの機能要件・非機能要件・ユーザー区分を整理 |

### 設計

| ドキュメント                 | 内容                     |
| ---------------------- | ---------------------- |
| [画面設計](docs/画面設計.md)   | 画面一覧・表示項目・操作内容を整理      |
| [画面遷移図](docs/画面遷移図/)   | 画面間の遷移・ユーザー区分ごとの導線を整理  |
| [DB設計](docs/DB設計.md)   | テーブル定義・リレーション・制約を整理    |
| [API設計](docs/API設計.md) | エンドポイント・リクエスト・レスポンスを整理 |

### 開発・運用

| ドキュメント                   | 内容                          |
| ------------------------ | --------------------------- |
| [開発運用設計](docs/開発運用設計.md) | ブランチ運用・開発ルール・レビュー方針・運用方針を整理 |

### 補足資料

| ディレクトリ                     | 内容                |
| -------------------------- | ----------------- |
| [context](docs/context/)   | 要件や設計の補足資料を管理     |
| [diagrams](docs/diagrams/) | ER図・構成図などの画像資料を管理 |

---

## 開発の始め方

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd team-A_section9
```

---

### 2. backend の環境変数を作成

Git Bash の場合：

```bash
cp backend/.env.example backend/.env
```

Windows コマンドプロンプトの場合：

```bash
copy backend\.env.example backend\.env
```

`backend/.env` を開いて、担当者から共有された値を設定してください。

| キー                     | 内容                      |
| ---------------------- | ----------------------- |
| `DATABASE_URL`         | Supabase接続URL（Pooler）   |
| `DIRECT_URL`           | Supabase接続URL（Direct）   |
| `SUPABASE_URL`         | SupabaseプロジェクトURL       |
| `SUPABASE_SERVICE_KEY` | Supabase service_roleキー |
| `REDIS_URL`            | `redis://redis:6379`    |
| `STRIPE_SECRET_KEY`    | Stripeシークレットキー          |
| `FRONTEND_URL`         | `http://localhost:3000` |
| `PORT`                 | `4000`                  |

---

### 3. frontend の環境変数を作成

Git Bash の場合：

```bash
cp frontend/.env.example frontend/.env.local
```

Windows コマンドプロンプトの場合：

```bash
copy frontend\.env.example frontend\.env.local
```

`frontend/.env.local` を開いて、必要な値を設定してください。

| キー                              | 内容                      |
| ------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:4000` |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonキー         |

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

| サービス     | URL                   | 確認方法                                |
| -------- | --------------------- | ----------------------------------- |
| Frontend | http://localhost:3000 | ブラウザでアクセス                           |
| Backend  | http://localhost:4000 | `curl http://localhost:4000/health` |
| Redis    | localhost:6379        | Docker Compose 経由で接続                |

```bash
curl http://localhost:4000/health
```

正常な場合：

```json
{
  "status": "ok"
}
```

Prisma のDB接続確認：

```bash
docker compose exec backend npx prisma db pull
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

PR作成前、または develop へ反映する前に、必要に応じて以下を確認します。

### Frontend

```bash
cd frontend
npm run lint
npm run format:check
```

### Backend

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
feature/* # 機能・修正ごとの作業ブランチ
```

### 作業ブランチ作成例

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<issue-number>-<summary>
```

### developへ反映する場合

原則は Pull Request を作成して `develop` へマージします。

ドキュメントのみの軽微な修正など、チームで合意済みの場合は `develop` へ直接 push する場合があります。

---

## コントリビュート

* 実装前に関連 Issue を確認する
* 作業前に `develop` を最新化する
* 原則として `feature/*` ブランチで作業する
* PR作成時は対応Issue・実装内容・確認内容を記載する
* Lint / Format / Test を確認してからレビュー依頼する
* 設計変更が発生した場合は、該当する docs を更新する

---

## トラブルシューティング

### ポートが使用中のエラー

```bash
npx kill-port 3000
npx kill-port 4000
```

### コンテナが起動しない

```bash
docker compose logs backend
docker compose logs frontend
```

### Dockerを再ビルドしたい

```bash
docker compose down
docker compose up --build
```

### Prisma Client を再生成したい

```bash
docker compose exec backend npx prisma generate
```

---

## 補足

MVPでは、実在園データの大量登録や管理画面CRUDは対象外です。
園データは seed データとして登録し、検索・比較・お気に入り登録・プレミアム機能の動作確認に利用します。
