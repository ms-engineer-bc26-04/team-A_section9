# DB 設計書：ENKATSU 〜園活を円滑に〜

> 本 DB 設計書は、画面設計書 v0.5 を最新版として優先し、MVP 実装に必要なデータ構造を整理する。
>
> ER 図は drawSQL で作成し、リポジトリ内（例：`docs/diagrams/erd.jpg`）で管理することを推奨。
>
> - drawSQL: https://drawsql.app/
> - VSCode Extension: Draw.io Integration

---

## 1. 設計方針

- 採用 DBMS：Supabase Postgres（PostgreSQL）
- ORM：Prisma
- 認証：Supabase Auth
- 決済：Stripe Checkout / Stripe Customer Portal
- 命名規則
  - テーブル名：複数形
  - カラム名：snake_case
  - 主キー：id
  - 外部キー：`xxx_id`
- 画面設計書 v0.5 を最新版として優先する
- 園情報は MVP では seed データで管理する
- 管理画面 CRUD は MVP 対象外
- お気に入りは一般ユーザーも利用可能とし、一般ユーザーは最大5件、プレミアムユーザーは無制限とする
- 比較は一般ユーザーは2園、プレミアムユーザーは3園までとする
- プロフィール編集画面で登録する住所・希望条件は、ホーム画面のおすすめ表示とプレミアム比較画面の一致表示に利用する
- プレミアム判定は `subscriptions.status` を正とし、`users.plan_type` は画面表示用の補助情報として扱う
- 物理削除 / 論理削除
  - MVP では基本的に物理削除とする
  - 園情報は seed データのため削除機能は MVP 対象外
- マイグレーション運用方針
  - Prisma Migrate を利用する
  - スキーマ変更時は migration ファイルを作成し、チームで共有する

---

## 2. ER 図

![ERD](./diagrams/erd.jpg)

---

## 3. テーブル一覧

| テーブル名    | 役割                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| users         | Supabase Auth と紐づくアプリ内ユーザー情報・会員状態・希望条件を管理する |
| schools       | 園の基本情報・生活負担・時間負担・サポート情報を管理する                 |
| favorites     | ユーザーがお気に入り登録した園を管理する                                 |
| compare_lists | 後続拡張用。MVPでは比較対象をDB保存しないため未使用                      |
| subscriptions | Stripe の課金状態・プレミアム状態を管理する                              |

---

## 4. テーブル定義

### 4.1 users

Supabase Auth のユーザー情報と、アプリ内で利用するプロフィール・会員状態・希望条件を管理する。

| カラム名                     | 型           | NULL | デフォルト | 説明                               |
| ---------------------------- | ------------ | ---- | ---------- | ---------------------------------- |
| id                           | uuid         | NO   | -          | 主キー（Supabase Auth User ID）    |
| email                        | varchar(255) | NO   | -          | メールアドレス                     |
| name                         | varchar(100) | YES  | -          | 表示名                             |
| avatar_url                   | text         | YES  | -          | アバター画像URL                    |
| postal_code                  | varchar(7)   | YES  | -          | 郵便番号                           |
| address                      | varchar(255) | YES  | -          | 住所                               |
| plan_type                    | varchar(20)  | NO   | free       | 表示用の会員種別（free / premium） |
| preferred_meal_type          | varchar(50)  | YES  | -          | 希望条件：給食・弁当               |
| preferred_item_burden        | varchar(20)  | YES  | -          | 希望条件：持ち物負担               |
| preferred_diaper_support     | varchar(50)  | YES  | -          | 希望条件：おむつ対応               |
| preferred_futon_support      | varchar(50)  | YES  | -          | 希望条件：布団対応                 |
| preferred_extended_care      | boolean      | NO   | false      | 希望条件：延長保育を利用したい     |
| preferred_weekday_events     | varchar(20)  | YES  | -          | 希望条件：平日行事の少なさ         |
| preferred_parent_association | varchar(20)  | YES  | -          | 希望条件：保護者会の少なさ         |
| created_at                   | timestamp    | NO   | now()      | 作成日時                           |
| updated_at                   | timestamp    | NO   | now()      | 更新日時                           |

---

### 4.2 schools

園（保育園・こども園等）の基本情報・生活負担・時間負担・サポート情報を管理する。

MVP では seed データとして登録し、管理画面からの CRUD は対象外とする。

| カラム名                 | 型           | NULL | デフォルト    | 説明                              |
| ------------------------ | ------------ | ---- | ------------- | --------------------------------- |
| id                       | bigint       | NO   | autoincrement | 主キー                            |
| name                     | varchar(255) | NO   | -             | 園名                              |
| area                     | varchar(100) | NO   | -             | エリア・市区町村                  |
| address                  | varchar(255) | NO   | -             | 住所                              |
| phone_number             | varchar(30)  | YES  | -             | 電話番号                          |
| image_url                | text         | YES  | -             | 園画像URL                         |
| school_type              | varchar(50)  | NO   | -             | 園種別                            |
| life_burden_level        | varchar(20)  | NO   | -             | 生活負担（low / middle / high）   |
| time_burden_level        | varchar(20)  | NO   | -             | 時間負担（low / middle / high）   |
| meal_type                | varchar(50)  | NO   | -             | 給食・弁当                        |
| item_burden_level        | varchar(20)  | NO   | -             | 持ち物負担（low / middle / high） |
| diaper_support           | varchar(50)  | YES  | -             | おむつ対応                        |
| futon_support            | varchar(50)  | YES  | -             | 布団対応                          |
| extended_care_time       | varchar(50)  | YES  | -             | 延長保育利用時間                  |
| extended_care_usage      | varchar(20)  | NO   | -             | 延長保育利用者の目安・多さ        |
| weekday_events_level     | varchar(20)  | NO   | -             | 平日行事の多さ                    |
| parent_association_level | varchar(20)  | NO   | -             | 保護者会の負担                    |
| contact_book_type        | varchar(50)  | YES  | -             | 連絡帳                            |
| absence_contact_method   | varchar(50)  | YES  | -             | 欠席連絡方法                      |
| lessons                  | varchar(255) | YES  | -             | 園内習い事                        |
| allergy_support          | varchar(255) | YES  | -             | アレルギー対応                    |
| description              | text         | YES  | -             | 園の特徴・補足説明                |
| created_at               | timestamp    | NO   | now()         | 作成日時                          |
| updated_at               | timestamp    | NO   | now()         | 更新日時                          |

---

### 4.3 favorites

ユーザーがお気に入り登録した園
一般ユーザーは5件まで
プレミアムユーザーは無制限

| カラム名   | 型        | NULL | デフォルト    | 説明       |
| ---------- | --------- | ---- | ------------- | ---------- |
| id         | bigint    | NO   | autoincrement | 主キー     |
| user_id    | uuid      | NO   | -             | users.id   |
| school_id  | bigint    | NO   | -             | schools.id |
| created_at | timestamp | NO   | now()         | 作成日時   |

---

### 4.4 compare_lists

ユーザーが比較対象として選択した園を保存するためのテーブル。

ただし、MVPでは比較対象の保存APIは実装せず、
比較対象は `/mypage/favorites` 画面上で選択し、
`GET /api/v1/schools/compare?ids=1,2` のように school_id をクエリで渡して比較情報を取得する。

そのため、compare_lists は後続拡張用テーブルとして残す。
MVPでは未使用とする。

| カラム名   | 型        | NULL | デフォルト    | 説明       |
| ---------- | --------- | ---- | ------------- | ---------- |
| id         | bigint    | NO   | autoincrement | 主キー     |
| user_id    | uuid      | NO   | -             | users.id   |
| school_id  | bigint    | NO   | -             | schools.id |
| created_at | timestamp | NO   | now()         | 作成日時   |

---

### 4.5 subscriptions

ユーザーのプレミアム課金状態を管理する。

| カラム名               | 型           | NULL | デフォルト    | 説明                         |
| ---------------------- | ------------ | ---- | ------------- | ---------------------------- |
| id                     | bigint       | NO   | autoincrement | 主キー                       |
| user_id                | uuid         | NO   | -             | users.id                     |
| stripe_customer_id     | varchar(255) | YES  | -             | Stripe 顧客ID                |
| stripe_subscription_id | varchar(255) | YES  | -             | Stripe Subscription ID       |
| status                 | varchar(50)  | NO   | -             | active / canceled / past_due |
| current_period_end     | timestamp    | YES  | -             | 現在の契約期間終了日時       |
| created_at             | timestamp    | NO   | now()         | 作成日時                     |
| updated_at             | timestamp    | NO   | now()         | 更新日時                     |

---

## 5. インデックス・制約

### 5.1 users

- 主キー：`id`
- `email` にユニーク制約を設定する

```sql
UNIQUE(email)
```

---

### 5.2 schools

- 主キー：`id`
- 検索で利用する `area` にインデックスを設定する
- 園名・住所検索で利用する `name`、`address` にインデックスを設定する

```sql
INDEX(area)
INDEX(name)
INDEX(address)
```

---

### 5.3 favorites

- 主キー：`id`
- `user_id` は `users.id` を参照する
- `school_id` は `schools.id` を参照する
- 同じユーザーが同じ園を重複してお気に入り登録できないように複合ユニーク制約を設定する

```sql
UNIQUE(user_id, school_id)
```

お気に入り登録件数は DB 制約ではなく API 側で制御する。

- 未登録ユーザー：利用不可
- 一般ユーザー：最大5件
- プレミアムユーザー：無制限

---

### 5.4 compare_lists

- 主キー：`id`
- `user_id` は `users.id` を参照する
- `school_id` は `schools.id` を参照する
- 同じユーザーが同じ園を比較対象に重複登録できないように複合ユニーク制約を設定する

```sql
UNIQUE(user_id, school_id)
```

MVPでは compare_lists は未使用のため、比較対象の最大件数制御は実装しない。
比較数の制御は、画面側または比較取得API側で行う。

後続で比較リスト保存機能を実装する場合は、
一般ユーザーは最大2園、プレミアムユーザーは最大3園をAPI側で制御する。

---

### 5.5 subscriptions

- 主キー：`id`
- `user_id` は `users.id` を参照する
- `stripe_customer_id` にユニーク制約を設定する
- `stripe_subscription_id` にユニーク制約を設定する

```sql
UNIQUE(stripe_customer_id)
UNIQUE(stripe_subscription_id)
```

---

## 6. データ保持・整合性ルール

- 園情報は MVP では seed データとして登録する
- お気に入りはユーザーごとに DB 保存する
- MVP では比較対象は DB 保存しない。
  `/mypage/favorites` 画面で選択した school_id を `/compare` に渡し、比較情報を取得する。
  compare_lists は後続拡張用として残す。
- お気に入りの重複登録は DB 側の複合ユニーク制約で防止する
- お気に入り登録上限は API 側で制御する
- 未ログインユーザーは `favorites`、`compare_lists`、`users` 更新系 API を利用できない
- 一般ユーザーがプレミアム限定情報を取得しようとした場合は、バックエンド側でも認可チェックを行う
- ユーザー退会機能は MVP 対象外とする

---

## 7. プレミアム判定方針

- プレミアム会員の判定は `subscriptions.status = active` を正とする
- `users.plan_type` は画面表示や簡易的な会員種別判定のための補助情報として保持する
- プレミアム機能の利用可否は `subscriptions.status = active` をもとに判定する
- Stripe の決済状態が変更された場合は、Webhook で `subscriptions.status` を更新する
- 必要に応じて `users.plan_type` と同期する

---

## 8. Enum 定義

Prisma では以下の enum 定義を推奨する。

```prisma
enum PlanType {
  free
  premium
}

enum SubscriptionStatus {
  active
  canceled
  past_due
}

enum BurdenLevel {
  low
  middle
  high
}
```

---

## 9. MVP で持たないデータ

以下は MVP では DB 管理しない。

- 口コミ投稿
- 口コミ承認
- 人気ランキング
- AI レポート生成結果
- 地図情報
- 通知履歴
- PDF 出力履歴
- 請求履歴一覧
- 管理画面 CRUD 用の監査ログ
- 実在園データの大量登録

---

## 10. seed データ方針

MVP では `schools` に園データを seed で登録する。

seed データには、画面表示・検索・比較に必要な以下の情報を含める。

- 園名
- エリア
- 住所
- 電話番号
- 園種別
- 園画像URL
- 生活負担
- 時間負担
- 給食・弁当
- 持ち物負担
- おむつ対応
- 布団対応
- 延長保育利用時間
- 延長保育利用者の目安
- 平日行事
- 保護者会
- 連絡帳
- 欠席連絡方法
- 園内習い事
- アレルギー対応
- 園の特徴・補足説明

---

## 11. 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                  |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| v0.1       | 2026/06/22 | 画面設計書 v0.5 を最新版として優先し、一般ユーザーのお気に入り上限・プロフィール希望条件・Stripe 解約フローに合わせて修正 |
