# DB 設計書：ENKATSU 〜園活を円滑に〜

> 本 DB 設計書は、ENKATSU の MVP 実装に必要なデータ構造を整理する。
>
> 園情報は MVP では seed データで管理し、管理画面 CRUD は MVP 対象外とする。
>
> ER 図は drawSQL 等で作成し、リポジトリ内（例：`docs/diagrams/erd.jpg`）で管理することを推奨。

---

## 1. 設計方針

* 採用 DBMS：Supabase Postgres（PostgreSQL）
* ORM：Prisma
* 認証：Supabase Auth
* 決済：Stripe Checkout / Stripe Customer Portal
* キャッシュ：Redis
* 命名規則

  * テーブル名：複数形
  * カラム名：snake_case
  * 主キー：id
  * 外部キー：`xxx_id`
* APIレスポンスでは、フロントエンドで扱いやすいように `camelCase` へ変換する
* 園情報は MVP では seed データで管理する
* 管理画面 CRUD は MVP 対象外
* お気に入りは一般ユーザーも利用可能とし、一般ユーザーは最大5件、プレミアムユーザーは無制限とする
* 比較は一般ユーザーは2園、プレミアムユーザーは3園までとする
* プロフィール編集画面で登録する住所・希望条件は、ホーム画面のおすすめ表示とプレミアム比較画面の一致表示に利用する
* DB上は `postal_code`、`address` を NULL 許可とするが、プロフィール編集画面ではおすすめ表示に利用するため、郵便番号・住所を必須入力とする
* プレミアム判定は `subscriptions.status = ACTIVE` を正とし、`users.plan_type` は画面表示用の補助情報として扱う
* 会員登録後は一般ユーザーとして扱う
* アプリ側の `users` レコードは、`GET /users/me` 実行時に必要に応じて自動作成する
* `compare_lists` はMVPではAPIから利用しないが、将来拡張用としてテーブルのみ作成する
* RedisキャッシュはMVPで利用する
* 物理削除 / 論理削除

  * MVP では基本的に物理削除とする
  * 園情報は seed データのため削除機能は MVP 対象外
* マイグレーション運用方針

  * Prisma Migrate を利用する
  * スキーマ変更時は migration ファイルを作成し、チームで共有する

---

## 2. ER 図

![ERD](./diagrams/erd.jpg)

---

## 3. テーブル一覧

| テーブル名         | 役割                                          |
| ------------- | ------------------------------------------- |
| users         | Supabase Auth と紐づくアプリ内ユーザー情報・会員状態・希望条件を管理する |
| schools       | 園の基本情報・生活負担・時間負担・サポート情報を管理する                |
| favorites     | ユーザーがお気に入り登録した園を管理する                        |
| compare_lists | 後続拡張用。MVPではAPIから利用しないが、将来拡張用としてテーブルのみ作成する   |
| subscriptions | Stripe の課金状態・プレミアム状態を管理する                   |

---

## 4. テーブル定義

### 4.1 users

Supabase Auth のユーザー情報と、アプリ内で利用するプロフィール・会員状態・希望条件を管理する。

ENKATSUにおける会員登録は、無料のユーザー登録を指す。

会員登録後は一般ユーザーとして扱い、`plan_type` の初期値は `FREE` とする。

MVPでは、Supabase Auth 上のユーザーは存在するがアプリ側 `users` レコードが存在しない場合、`GET /users/me` 実行時にバックエンド側で `users` レコードを自動作成する。

| カラム名                         | 型            | NULL | デフォルト | 説明                               |
| ---------------------------- | ------------ | ---- | ----- | -------------------------------- |
| id                           | uuid         | NO   | -     | 主キー（Supabase Auth User ID）       |
| email                        | varchar(255) | NO   | -     | メールアドレス                          |
| name                         | varchar(100) | YES  | -     | 表示名                              |
| avatar_url                   | text         | YES  | -     | アバター画像URL                        |
| postal_code                  | varchar(7)   | YES  | -     | 郵便番号。DB上はNULL許可だが、プロフィール編集画面では必須 |
| address                      | varchar(255) | YES  | -     | 住所。DB上はNULL許可だが、プロフィール編集画面では必須   |
| plan_type                    | varchar(20)  | NO   | FREE  | 表示用の会員種別（FREE / PAID）            |
| preferred_meal_type          | varchar(50)  | YES  | -     | 希望条件：給食・弁当                       |
| preferred_item_burden        | varchar(20)  | YES  | -     | 希望条件：持ち物負担                       |
| preferred_diaper_support     | varchar(50)  | YES  | -     | 希望条件：おむつ対応                       |
| preferred_futon_support      | varchar(50)  | YES  | -     | 希望条件：布団対応                        |
| preferred_extended_care      | boolean      | NO   | false | 希望条件：延長保育を利用したい                  |
| preferred_weekday_events     | varchar(20)  | YES  | -     | 希望条件：平日行事の少なさ                    |
| preferred_parent_association | varchar(20)  | YES  | -     | 希望条件：保護者会の少なさ                    |
| created_at                   | timestamp    | NO   | now() | 作成日時                             |
| updated_at                   | timestamp    | NO   | now() | 更新日時                             |

#### users レコード自動作成時の初期値

| カラム名                    | 初期値                    |
| ----------------------- | ---------------------- |
| id                      | Supabase Auth User ID  |
| email                   | Supabase Auth のメールアドレス |
| plan_type               | FREE                   |
| preferred_extended_care | false                  |
| created_at              | 作成日時                   |
| updated_at              | 作成日時                   |

`name`、`postal_code`、`address`、各希望条件は、会員登録直後は未設定でもよい。

プロフィール編集画面から更新する場合は、`name`、`postal_code`、`address` を必須入力とする。

---

### 4.2 schools

園（保育園・こども園等）の基本情報・生活負担・時間負担・サポート情報を管理する。

MVP では seed データとして登録し、管理画面からの CRUD は対象外とする。

| カラム名                         | 型            | NULL | デフォルト         | 説明                           |
| ---------------------------- | ------------ | ---- | ------------- | ---------------------------- |
| id                           | bigint       | NO   | autoincrement | 主キー                          |
| name                         | varchar(255) | NO   | -             | 園名                           |
| area                         | varchar(100) | NO   | -             | エリア・市区町村                     |
| address                      | varchar(255) | NO   | -             | 住所                           |
| school_type                  | varchar(50)  | NO   | -             | 園種別                          |
| life_burden_level            | varchar(20)  | NO   | -             | 生活負担（LOW / MEDIUM / HIGH）    |
| time_burden_level            | varchar(20)  | NO   | -             | 時間負担（LOW / MEDIUM / HIGH）    |
| meal_type                    | varchar(50)  | NO   | -             | 給食・弁当                        |
| item_burden_level            | varchar(20)  | NO   | -             | 持ち物負担（LOW / MEDIUM / HIGH）   |
| item_burden_detail           | varchar(255) | YES  | -             | 持ち物負担の具体的な表示用テキスト            |
| diaper_support               | varchar(50)  | YES  | -             | おむつ対応                        |
| futon_support                | varchar(50)  | YES  | -             | 布団対応                         |
| extended_care_hours          | varchar(50)  | YES  | -             | 延長保育利用時間                     |
| extended_care_usage          | varchar(50)  | YES  | -             | 延長保育利用者の目安・多さ                |
| weekday_events_level         | varchar(20)  | NO   | -             | 平日行事の多さ（LOW / MEDIUM / HIGH） |
| weekday_events               | varchar(255) | YES  | -             | 平日行事の具体的な表示用テキスト             |
| parent_association_level     | varchar(20)  | NO   | -             | 保護者会の負担（LOW / MEDIUM / HIGH） |
| parent_association_frequency | varchar(255) | YES  | -             | 保護者会頻度の表示用テキスト               |
| contact_book_type            | varchar(50)  | YES  | -             | 連絡帳                          |
| absence_contact_method       | varchar(50)  | YES  | -             | 欠席連絡方法                       |
| lessons                      | varchar(255) | YES  | -             | 園内習い事。ない場合は NULL             |
| allergy_support              | varchar(255) | YES  | -             | アレルギー対応。ない場合は NULL           |
| description                  | text         | YES  | -             | 園の特徴・補足説明                    |
| created_at                   | timestamp    | NO   | now()         | 作成日時                         |
| updated_at                   | timestamp    | NO   | now()         | 更新日時                         |

#### 表示用テキストカラムについて

園詳細API・比較APIでは、画面表示でそのまま使いやすいように、以下の表示用テキストカラムを利用する。

| カラム名                         | 用途                   |
| ---------------------------- | -------------------- |
| item_burden_detail           | 持ち物負担の具体的な説明として利用する  |
| weekday_events               | 平日行事の頻度・内容の説明として利用する |
| parent_association_frequency | 保護者会頻度の説明として利用する     |

比較APIでは、比較画面でそのまま表示しやすいように、`item_burden_level` / `weekday_events_level` / `parent_association_level` ではなく、上記の表示用テキストカラムを返す。

#### lessons / allergy_support の NULL 運用

`lessons` と `allergy_support` は、条件検索で「あり / なし」を判定するため、以下のルールで運用する。

| カラム             | ありの場合              | なしの場合 |
| --------------- | ------------------ | ----- |
| lessons         | 園内習い事の内容を文字列で登録する  | NULL  |
| allergy_support | アレルギー対応内容を文字列で登録する | NULL  |

条件検索では、以下のように扱う。

| 検索条件      | DB上の判定                        |
| --------- | ----------------------------- |
| 園内習い事あり   | `lessons IS NOT NULL`         |
| アレルギー対応あり | `allergy_support IS NOT NULL` |

---

### 4.3 favorites

ユーザーがお気に入り登録した園を管理する。

一般ユーザーは5件まで、プレミアムユーザーは無制限で登録できる。

お気に入り登録上限は DB 制約ではなく、API 側で制御する。

| カラム名       | 型         | NULL | デフォルト         | 説明         |
| ---------- | --------- | ---- | ------------- | ---------- |
| id         | bigint    | NO   | autoincrement | 主キー        |
| user_id    | uuid      | NO   | -             | users.id   |
| school_id  | bigint    | NO   | -             | schools.id |
| created_at | timestamp | NO   | now()         | 作成日時       |

---

### 4.4 compare_lists

ユーザーが比較対象として選択した園を保存するためのテーブル。

ただし、MVPでは比較対象の保存APIは実装しない。

比較対象は `/mypage/favorites` 画面上で選択し、`GET /api/v1/schools/compare?ids=1,2` のように school_id をクエリで渡して比較情報を取得する。

そのため、`compare_lists` はMVPではAPIから利用しない。

ただし、後続で比較リスト保存機能を拡張できるように、将来拡張用としてテーブルのみ作成する。

| カラム名       | 型         | NULL | デフォルト         | 説明         |
| ---------- | --------- | ---- | ------------- | ---------- |
| id         | bigint    | NO   | autoincrement | 主キー        |
| user_id    | uuid      | NO   | -             | users.id   |
| school_id  | bigint    | NO   | -             | schools.id |
| created_at | timestamp | NO   | now()         | 作成日時       |

---

### 4.5 subscriptions

ユーザーのプレミアム課金状態を管理する。

プレミアム判定は `subscriptions.status = ACTIVE` を正とする。

`users.plan_type` は画面表示や簡易的な会員種別表示のための補助情報として扱う。

| カラム名                   | 型            | NULL | デフォルト         | 説明                           |
| ---------------------- | ------------ | ---- | ------------- | ---------------------------- |
| id                     | bigint       | NO   | autoincrement | 主キー                          |
| user_id                | uuid         | NO   | -             | users.id                     |
| stripe_customer_id     | varchar(255) | YES  | -             | Stripe 顧客ID                  |
| stripe_subscription_id | varchar(255) | YES  | -             | Stripe Subscription ID       |
| status                 | varchar(50)  | NO   | -             | ACTIVE / CANCELED / PAST_DUE |
| current_period_end     | timestamp    | YES  | -             | 現在の契約期間終了日時                  |
| created_at             | timestamp    | NO   | now()         | 作成日時                         |
| updated_at             | timestamp    | NO   | now()         | 更新日時                         |

---

## 5. インデックス・制約

### 5.1 users

* 主キー：`id`
* `email` にユニーク制約を設定する

```sql
UNIQUE(email)
```

---

### 5.2 schools

* 主キー：`id`
* 検索で利用する `area` にインデックスを設定する
* 園名・住所検索で利用する `name`、`address` にインデックスを設定する
* 条件検索で利用する項目は、必要に応じて後続でインデックス追加を検討する

```sql
INDEX(area)
INDEX(name)
INDEX(address)
```

条件検索で利用する主なカラムは以下。

* `meal_type`
* `diaper_support`
* `futon_support`
* `extended_care_usage`
* `weekday_events_level`
* `parent_association_level`
* `lessons`
* `allergy_support`

MVPでは seed データ件数が少ないため、上記へのインデックス追加は必須ではない。

データ件数が増えた場合に追加を検討する。

---

### 5.3 favorites

* 主キー：`id`
* `user_id` は `users.id` を参照する
* `school_id` は `schools.id` を参照する
* 同じユーザーが同じ園を重複してお気に入り登録できないように複合ユニーク制約を設定する

```sql
UNIQUE(user_id, school_id)
```

お気に入り登録件数は DB 制約ではなく API 側で制御する。

* 未登録ユーザー：利用不可
* 一般ユーザー：最大5件
* プレミアムユーザー：無制限

---

### 5.4 compare_lists

* 主キー：`id`
* `user_id` は `users.id` を参照する
* `school_id` は `schools.id` を参照する
* 同じユーザーが同じ園を比較対象に重複登録できないように複合ユニーク制約を設定する

```sql
UNIQUE(user_id, school_id)
```

MVPでは `compare_lists` はAPIから利用しない。

ただし、将来拡張用としてテーブルのみ作成する。

MVPの比較対象の最大件数制御は、比較取得API側で行う。

* 一般ユーザー：最大2園
* プレミアムユーザー：最大3園

後続で比較リスト保存機能を実装する場合は、`compare_lists` への登録時にも上記の最大件数をAPI側で制御する。

---

### 5.5 subscriptions

* 主キー：`id`
* `user_id` は `users.id` を参照する
* `stripe_customer_id` にユニーク制約を設定する
* `stripe_subscription_id` にユニーク制約を設定する

```sql
UNIQUE(stripe_customer_id)
UNIQUE(stripe_subscription_id)
```

---

## 6. データ保持・整合性ルール

* 園情報は MVP では seed データとして登録する
* お気に入りはユーザーごとに DB 保存する
* MVP では比較対象は DB 保存しない
* `/mypage/favorites` 画面で選択した school_id を `/compare` に渡し、比較情報を取得する
* `compare_lists` はMVPではAPIから利用しないが、将来拡張用としてテーブルのみ作成する
* お気に入りの重複登録は DB 側の複合ユニーク制約で防止する
* お気に入り登録上限は API 側で制御する
* 比較数の上限は比較取得API側で制御する
* 未ログインユーザーは `favorites`、`compare_lists`、`users` 更新系 API を利用できない
* 一般ユーザーがプレミアム限定情報を取得しようとした場合は、バックエンド側でも認可チェックを行う
* ユーザー退会機能は MVP 対象外とする
* 会員登録後、Supabase Auth 上のユーザーは存在するが `users` レコードが存在しない場合は、`GET /users/me` 実行時に一般ユーザーとして自動作成する
* `lessons` / `allergy_support` は「あり / なし」の判定に使用するため、なしの場合は空文字ではなく NULL として管理する

---

## 7. プレミアム判定方針

* プレミアム会員の判定は `subscriptions.status = ACTIVE` を正とする
* `users.plan_type` は画面表示や簡易的な会員種別判定のための補助情報として保持する
* プレミアム機能の利用可否は `subscriptions.status = ACTIVE` をもとに判定する
* Stripe の決済状態が変更された場合は、Webhook で `subscriptions.status` を更新する
* 必要に応じて `users.plan_type` と同期する

---

## 8. Redisキャッシュ方針

MVPでは、園一覧・検索結果・おすすめ表示でRedisキャッシュを利用する。

RedisはDBテーブルではないが、園データ取得時のパフォーマンス改善のために利用する。

### 8.1 キャッシュ対象

| 対象     | 内容                              |
| ------ | ------------------------------- |
| 園一覧    | 全件または検索条件に一致する園一覧               |
| 検索結果   | キーワード・条件検索の結果                   |
| おすすめ表示 | ユーザー情報やお気に入り傾向をもとにしたおすすめ表示の元データ |

### 8.2 キャッシュ対象外

以下のようなログインユーザーごとに変わる情報は、キャッシュ対象から分けて扱う。

| 対象外             | 理由             |
| --------------- | -------------- |
| `isFavorited`   | ユーザーごとに異なるため   |
| `favoriteCount` | ユーザーごとに異なるため   |
| `favoriteLimit` | ユーザー区分ごとに異なるため |
| `isPremium`     | 課金状態により変わるため   |
| サポート情報の閲覧可否     | 会員区分により変わるため   |

### 8.3 キャッシュキー方針

検索条件・並び順をもとにキャッシュキーを作成する。

例：

```txt
schools:list:keyword=sakura:mealType=SCHOOL_LUNCH:sort=id_asc
schools:list:diaperSupport=true:futonSupport=true:extendedCareUsage=true
schools:recommended:userId=<user_id>
```

### 8.4 キャッシュ削除方針

MVPでは園情報は seed データで管理するため、頻繁な更新は想定しない。

キャッシュ削除は以下の場合に行う。

* seed データを更新した場合
* 園データの内容を変更した場合
* 開発中にキャッシュの不整合が発生した場合

TTLはMVPでは任意とする。

設定する場合は、短時間のTTLから開始する。

---

## 9. Enum 定義

Prisma では以下の enum 定義を使用する。

```prisma
enum MembershipType {
  FREE
  PAID
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

enum BurdenLevel {
  LOW
  MEDIUM
  HIGH
}

enum SchoolType {
  NURSERY
  KINDERGARTEN
  CERTIFIED_CHILDCARE_CENTER
}

enum MealType {
  SCHOOL_LUNCH
  LUNCH_BOX
  BOTH
}

enum ContactBookType {
  APP
  PAPER
  BOTH
}

enum AbsenceContactMethod {
  APP
  PHONE
  BOTH
}
```

MVPでは、以下の項目は自由記述のテキストとして扱う。

```txt
diaper_support
futon_support
extended_care_hours
extended_care_usage
item_burden_detail
weekday_events
parent_association_frequency
lessons
allergy_support
description
```

ただし、条件検索で使う値については、seed データ内で表記ゆれが出ないように運用ルールを定める。

---

## 10. MVP で持たないデータ

以下は MVP では DB 管理しない。

* 口コミ投稿
* 口コミ承認
* 人気ランキング
* AI レポート生成結果
* 地図情報
* 通知履歴
* PDF 出力履歴
* 請求履歴一覧
* 管理画面 CRUD 用の監査ログ
* 実在園データの大量登録

---

## 11. seed データ方針

MVP では `schools` に園データを seed で登録する。

#32 で検索・比較確認用に seed データを20件へ拡充している。

seed データには、画面表示・検索・比較に必要な以下の情報を含める。

* 園名
* エリア
* 住所
* 園種別
* 生活負担
* 時間負担
* 給食・弁当
* 持ち物負担
* 持ち物負担の表示用テキスト
* おむつ対応
* 布団対応
* 延長保育利用時間
* 延長保育利用者の目安
* 平日行事の多さ
* 平日行事の表示用テキスト
* 保護者会の負担
* 保護者会頻度の表示用テキスト
* 連絡帳
* 欠席連絡方法
* 園内習い事
* アレルギー対応
* 園の特徴・補足説明

### 11.1 条件検索で使用する seed データの基準

MVPの条件検索では、以下の値を検索基準として使用する。

| 検索条件       | DB上の値・判定                         |
| ---------- | -------------------------------- |
| 毎日給食       | `meal_type = SCHOOL_LUNCH`       |
| おむつ園処理あり   | `diaper_support = "園で廃棄"`        |
| 布団負担少なめ    | `futon_support = "園で管理"`         |
| 保護者会少なめ    | `parent_association_level = LOW` |
| 延長保育利用者が多い | `extended_care_usage = "20人以上"`  |
| 園内習い事あり    | `lessons IS NOT NULL`            |
| アレルギー対応あり  | `allergy_support IS NOT NULL`    |
| 平日行事少なめ    | `weekday_events_level = LOW`     |

### 11.2 seed データ登録時の注意

* `lessons` は、園内習い事がある場合のみ内容を登録する
* 園内習い事がない場合、`lessons` は NULL とする
* `lessons` には、年間行事・季節イベント・制作活動などは含めない
* `allergy_support` は、アレルギー対応がある場合のみ内容を登録する
* アレルギー対応がない場合、`allergy_support` は NULL とする
* `extended_care_usage` は、検索基準に合わせて `"20人以上"` / `"10〜20人程度"` / `"10人未満"` のように分類する
* `diaper_support` は、検索条件の「おむつ園処理あり」に該当する場合は `"園で廃棄"` と登録する
* `futon_support` は、検索条件の「布団負担少なめ」に該当する場合は `"園で管理"` と登録する
* 表示用テキストカラムは、比較画面・園詳細画面でそのまま読める文章として登録する

---

## 12. Prisma schema 作成時の補足

### 12.1 users

* `id` は Supabase Auth User ID を使用するため、アプリ側でUUIDを自動採番しない
* `email` はユニークにする
* `plan_type` の初期値は `FREE` とする
* `postal_code`、`address` はDB上はNULL許可とする
* プロフィール編集画面では `postal_code`、`address` を必須入力として扱う

### 12.2 schools

* `schools.id` は `bigint` とし、APIレスポンスでは文字列に変換して返す
* Enum値は Prisma Enum として管理する
* `item_burden_detail` / `weekday_events` / `parent_association_frequency` は、画面表示用のテキストカラムとして扱う
* `lessons` / `allergy_support` は NULL 許可とする
* `lessons` / `allergy_support` は、条件検索で `IS NOT NULL` 判定に使用するため、なしの場合は空文字ではなく NULL とする
* 園情報は seed データで登録する
* 管理画面 CRUD は MVP 対象外とする

### 12.3 favorites

* `user_id` と `school_id` に複合ユニーク制約を設定する
* お気に入り登録上限はDB制約ではなくAPI側で制御する

### 12.4 compare_lists

* MVPではAPIから利用しない
* ただし、将来拡張用としてテーブルのみ作成する
* `user_id` と `school_id` に複合ユニーク制約を設定する
* 後続で比較リスト保存機能を実装する場合、一般ユーザー2園・プレミアムユーザー3園の制限をAPI側で追加する

### 12.5 subscriptions

* プレミアム判定は `status = ACTIVE` を正とする
* `stripe_customer_id` と `stripe_subscription_id` はユニークにする
* Stripe Webhookで `status` と `current_period_end` を更新する
* 必要に応じて `users.plan_type` も同期する

### 12.6 Redis

* RedisはPrisma schemaには定義しない
* Docker Compose で Redis サービスを追加する
* 園一覧・検索結果・おすすめ表示のキャッシュに利用する
* ユーザー固有情報はキャッシュ対象と分けて扱う

---

## 13. 変更履歴

| バージョン | 日付         | 変更内容                                                                                                                                                                                                                  |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1  | 2026/06/22 | 画面設計書 v0.5 を最新版として優先し、一般ユーザーのお気に入り上限・プロフィール希望条件・Stripe 解約フローに合わせて修正                                                                                                                                                   |
| v0.2  | 2026/06/23 | 画面設計書 v0.7 を最新版として優先する記載に修正。`GET /users/me` 実行時の `users` レコード自動作成方針を追加。`compare_lists` はMVPではAPIから利用しないが将来拡張用としてテーブルのみ作成する方針に統一。RedisキャッシュをMVP必須として追加。DB上は `postal_code`、`address` をNULL許可とし、プロフィール編集画面では必須入力とする方針を明記 |
| v0.3  | 2026/06/25 | seedデータ拡充・条件検索基準・表示用テキストカラムに合わせて修正。`item_burden_detail` / `weekday_events` / `parent_association_frequency` を追加し、`lessons` / `allergy_support` の NULL 運用と条件検索で使用する値の基準を追記                                             |
