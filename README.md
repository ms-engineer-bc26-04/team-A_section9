# team-A_section9

## セットアップ手順

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

`backend/.env` を開いて以下の値を担当者から受け取った情報で埋めてください。

| キー                     | 内容                          |
| ---------------------- | --------------------------- |
| `DATABASE_URL`         | Supabase接続URL（Pooler）       |
| `DIRECT_URL`           | Supabase接続URL（Direct）       |
| `SUPABASE_URL`         | SupabaseプロジェクトURL           |
| `SUPABASE_SERVICE_KEY` | Supabase service_roleキー     |
| `REDIS_URL`            | `redis://redis:6379`（固定）    |
| `STRIPE_SECRET_KEY`    | Stripeシークレットキー（後で設定）        |
| `FRONTEND_URL`         | `http://localhost:3000`（固定） |
| `PORT`                 | `4000`（固定）                  |

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

`frontend/.env.local` を開いて以下の値を埋めてください。

| キー                              | 内容                          |
| ------------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:4000`（固定） |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonキー             |

---

### 4. Docker Compose で起動

```bash
# 初回（ビルドあり）
docker compose up --build

# 2回目以降
docker compose up
```

---

### 5. 動作確認

| サービス     | URL                   | 確認方法                                |
| -------- | --------------------- | ----------------------------------- |
| Frontend | http://localhost:3000 | ブラウザでアクセス                           |
| Backend  | http://localhost:4000 | `curl http://localhost:4000/health` |
| Redis    | localhost:6379        | 自動接続                                |

```bash
# Backend ヘルスチェック
curl http://localhost:4000/health
# → {"status":"ok"}

# Prisma DB接続確認
docker compose exec backend npx prisma db pull
# → DB接続結果が表示されればOK
```

---

## よく使うコマンド

### Docker

```bash
docker compose up             # 起動
docker compose down           # 停止
docker compose ps             # 状態確認
docker compose logs backend   # backendログ確認
docker compose logs frontend  # frontendログ確認
docker compose up --build     # 再ビルドして起動
```

### Frontend

```bash
cd frontend
npm run dev          # 開発サーバー起動（Docker未使用時）
npm run lint         # Lint確認
npm run lint:fix     # Lint自動修正
npm run format       # フォーマット自動修正
npm run format:check # フォーマット確認
```

### Backend

```bash
cd backend
npm run dev          # 開発サーバー起動（Docker未使用時）
npm run lint         # Lint確認
npm run lint:fix     # Lint自動修正
npm run format       # フォーマット自動修正
npm run format:check # フォーマット確認
npm run test         # テスト実行
```

### Prisma

```bash
# コンテナ内で実行
docker compose exec backend npx prisma migrate dev --name <マイグレーション名>
docker compose exec backend npx prisma generate
docker compose exec backend npx prisma studio
```

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
