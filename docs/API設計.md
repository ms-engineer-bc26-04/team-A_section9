# ENKATSU API設計書

## 1. API概要

本ドキュメントは、ENKATSU のMVPで使用するAPI仕様を整理したAPI設計書です。

ENKATSUは、共働き家庭・仕事復帰を控えた保護者向けに、保育園・こども園の「復職後の保護者負担」を検索・比較できるWebアプリケーションです。

本API設計書では、以下の画面・機能を実現するためのAPIを定義します。

* 園一覧・検索
* 園詳細
* ログインユーザー情報取得
* ユーザープロフィール情報の保存・取得
* ユーザー希望条件の保存・取得
* 郵便番号による住所検索
* お気に入り登録・解除
* お気に入り一覧
* 園比較
* Stripe Checkout
* Stripe Customer Portal
* Stripe Webhook
* Redisキャッシュを利用した園一覧・検索結果・おすすめ表示の高速化

---

## 2. 前提

本API設計書は、以下のドキュメントをもとに作成しています。

* 要件定義書
* 画面設計書
* DB設計書
* 画面遷移図

DB設計書の確定に伴い、以下の方針を反映します。

* `users.id` はアプリ内ユーザーIDとして UUID を使用する
* `users.supabase_user_id` は Supabase Auth User ID と紐づける
* `users.name` / `users.postal_code` / `users.address` は、マイページのプロフィール情報として扱う
* `users.postal_code` はハイフンなし7桁で保存する
* `schools.id` は `bigint` とする
* `favorites.id` は `bigint` とする
* `subscriptions.id` は `bigint` とする
* DBカラム名は `snake_case` とする
* APIレスポンスはフロントエンドで扱いやすいように `camelCase` とする
* Prisma Enum の値はAPI上でも基本的に `UPPER_SNAKE_CASE` で扱う
* プレミアム判定は `subscriptions.status = ACTIVE` を正とする
* `users.plan_type` は画面表示用の補助情報として扱う
* 会員登録後は一般ユーザーとして扱う
* アプリ側の `users` レコードは、`GET /users/me` 実行時に必要に応じて自動作成する
* ユーザープロフィール情報は `PUT /users/me` で保存・更新する
* 郵便番号から住所を取得する処理は `GET /address/search?zipcode=1234567` で行う
* 住所検索APIは住所自動入力用であり、DB保存は行わない
* ユーザー希望条件は `user_preferences` テーブルで管理する
* ユーザー希望条件は `PATCH /users/me/preferences` で保存・更新する
* 希望条件が未設定の場合、`GET /users/me` では `preference: null` を返す
* 比較対象の選択は `/mypage/favorites` で行う
* MVPでは比較リスト保存APIは作成しない
* MVPでは比較履歴保存は行わない
* MVPではチャート表示専用API・詳細比較レポートAPIは作成しない
* 園一覧・検索結果・おすすめ表示ではRedisキャッシュを利用する

---

## 3. API基本方針

### 3-1. ベースURL

開発環境では以下を想定します。

```txt
http://localhost:4000/api/v1
```

---

### 3-2. データ形式

リクエスト・レスポンスは原則JSON形式とします。

```http
Content-Type: application/json
```

---

### 3-3. 認証方式

認証は Supabase Auth を使用します。

ログインが必要なAPIでは、フロントエンドから送信されたアクセストークンを検証します。

```http
Authorization: Bearer <supabase_access_token>
```

---

### 3-4. 命名方針

DBでは `snake_case` を使用します。

例：

```txt
phone_number
school_type
life_burden_level
created_at
```

APIレスポンスでは、フロントエンドで扱いやすいように `camelCase` を使用します。

例：

```txt
phoneNumber
schoolType
lifeBurdenLevel
createdAt
```

---

### 3-5. 表示用テキスト項目の方針

園詳細API・比較APIでは、画面表示で使いやすいように、一部項目について表示用テキスト項目を返します。

MVPでは、Enum値に対して `xxxText` / `xxxLabel` のような別項目を追加するのではなく、DB上に用意している表示用テキストカラムをそのままAPIレスポンスに含めます。

主な表示用テキスト項目は以下です。

| 項目 | 内容 |
| --- | --- |
| `itemBurdenDetail` | 持ち物負担の具体的な表示用テキスト |
| `weekdayEvents` | 平日行事の具体的な表示用テキスト |
| `parentAssociationFrequency` | 保護者会頻度の表示用テキスト |

園詳細APIでは、Enum値も返したうえで、上記の表示用テキスト項目を追加して返します。

比較APIでは、比較画面でそのまま表示できるように、`itemBurdenLevel` / `weekdayEventsLevel` / `parentAssociationLevel` ではなく、`itemBurdenDetail` / `weekdayEvents` / `parentAssociationFrequency` を返します。

---

### 3-6. APIレスポンス形式

正常系レスポンスは、原則として以下の形式に統一します。

```json
{
  "data": {}
}
```

一覧取得の場合は、以下の形式を基本とします。

```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

エラー系レスポンスは、以下の形式に統一します。

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

---

## 4. HTTPステータス方針

| ステータス | 用途 |
| --- | --- |
| 200 | 取得・更新・削除成功 |
| 201 | 作成成功 |
| 400 | リクエスト内容不正 |
| 401 | 未認証 |
| 403 | 権限不足 |
| 404 | 対象データが存在しない |
| 409 | 重複登録などの競合 |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |

---

## 5. エラーコード一覧

| code | 内容 |
| --- | --- |
| `UNAUTHORIZED` | ログインが必要 |
| `FORBIDDEN` | 操作権限がない |
| `NOT_FOUND` | 対象データが存在しない |
| `VALIDATION_ERROR` | 入力値が不正 |
| `FAVORITE_LIMIT_EXCEEDED` | お気に入り登録上限に達している |
| `ALREADY_FAVORITED` | すでにお気に入り登録済み |
| `COMPARE_LIMIT_EXCEEDED` | 比較可能数を超えている |
| `PREMIUM_REQUIRED` | プレミアム登録が必要 |
| `PAYMENT_ERROR` | 決済処理に失敗 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

---

## 6. 認証・認可方針

### 6-1. ユーザー区分

ENKATSUでは以下の3区分を扱います。

| 区分 | 内容 | DB上の扱い |
| --- | --- | --- |
| 未登録ユーザー | ログインしていないユーザー | users レコードなし |
| 一般ユーザー | ユーザー登録済みの無料ユーザー | `users.plan_type = FREE` |
| プレミアムユーザー | 月額課金済みの有料ユーザー | `subscriptions.status = ACTIVE` |

ENKATSUにおける会員登録は、無料のユーザー登録を指します。

プレミアムユーザーになるには、会員登録後にStripe Checkoutで決済を完了する必要があります。

---

### 6-2. プレミアム判定

プレミアム会員の判定は、`subscriptions.status = ACTIVE` を正とします。

`users.plan_type` は画面表示や簡易的な会員種別表示のための補助情報として扱います。

Stripe Webhookで決済状態が変更された場合は、`subscriptions.status` を更新します。

必要に応じて `users.plan_type` も同期します。

---

### 6-3. 会員登録後のユーザー作成方針

Supabase Auth の会員登録後、ユーザーはまず一般ユーザーとして扱います。

MVPでは、アプリ側の `users` レコードは `GET /users/me` 実行時に作成します。

ログイン済みユーザーが `GET /users/me` を実行した際に、Supabase Auth 上のユーザーは存在するが、アプリ側 `users` レコードが存在しない場合、バックエンド側で一般ユーザーとして自動作成します。

作成時の初期値は以下とします。

| DBカラム | 値 |
| --- | --- |
| `id` | UUIDを自動生成 |
| `supabase_user_id` | Supabase Auth User ID |
| `email` | Supabase Auth のメールアドレス |
| `name` | `null` |
| `postal_code` | `null` |
| `address` | `null` |
| `plan_type` | `FREE` |
| `created_at` | 作成日時 |
| `updated_at` | 作成日時 |

この方針により、フロントエンド側で会員登録直後に別途ユーザー作成APIを呼び出す必要はありません。

---

### 6-4. 認可ルール

| 機能 | 未登録ユーザー | 一般ユーザー | プレミアムユーザー |
| --- | --- | --- | --- |
| 園一覧取得 | ○ | ○ | ○ |
| 園詳細取得 | ○ | ○ | ○ |
| お気に入り登録 | × | 5件まで | 無制限 |
| お気に入り一覧取得 | × | ○ | ○ |
| 2園比較 | × | ○ | ○ |
| 3園比較 | × | × | ○ |
| サポート情報の内容閲覧 | × | × | ○ |
| 希望条件との一致表示 | × | × | ○ |
| ユーザープロフィール情報の保存・更新 | × | ○ | ○ |
| ユーザー希望条件の保存・更新 | × | ○ | ○ |
| Stripe Checkout | × | ○ | × |
| Stripe Customer Portal | × | × | ○ |

---

## 7. エンドポイント一覧

| 分類 | メソッド | エンドポイント | 認証 | 概要 |
| --- | --- | --- | --- | --- |
| 園 | GET | `/schools` | 任意 | 園一覧・検索結果取得 |
| 園 | GET | `/schools/:id` | 任意 | 園詳細取得 |
| 園 | GET | `/schools/compare` | 必須 | 比較対象園取得 |
| ユーザー | GET | `/users/me` | 必須 | ログインユーザー情報取得。必要に応じて `users` レコードを自動作成 |
| ユーザー | PUT | `/users/me` | 必須 | ログインユーザーのプロフィール情報を保存・更新 |
| ユーザー | PATCH | `/users/me/preferences` | 必須 | ログインユーザーの希望条件を保存・更新 |
| 住所 | GET | `/address/search` | 不要 | 郵便番号から住所を検索 |
| お気に入り | GET | `/users/me/favorites` | 必須 | お気に入り一覧取得 |
| お気に入り | POST | `/users/me/favorites` | 必須 | お気に入り登録 |
| お気に入り | DELETE | `/users/me/favorites/:schoolId` | 必須 | お気に入り解除 |
| 決済 | POST | `/payment/checkout` | 必須 | Stripe Checkout Session作成 |
| 決済 | POST | `/payment/customer-portal` | 必須 | Stripe Customer Portal URL作成 |
| 決済 | POST | `/payment/webhook` | 不要 | Stripe Webhook受信 |

---

# 8. 園API

## 8-1. 園一覧・検索結果取得

### 概要

園一覧、検索結果、ホーム画面のおすすめ表示に使用する園データを取得します。

未ログインでも取得可能です。

ログイン済みの場合は、お気に入り登録済みかどうかを `isFavorited` に含めます。

MVPでは、園一覧・検索結果・おすすめ表示のDBアクセスを減らすため、Redisキャッシュを利用します。

---

### メソッド・URL

```http
GET /api/v1/schools
```

---

### 認証

任意。

---

### クエリパラメータ

| パラメータ | 型 | 必須 | 内容 |
| --- | --- | --- | --- |
| `keyword` | string | 任意 | 園名・住所・エリア検索 |
| `q` | string | 任意 | 園名・住所・エリア検索。`keyword` と同用途 |
| `area` | string | 任意 | エリア・市区町村 |
| `mealType` | string | 任意 | 給食・弁当 |
| `diaperSupport` | string | 任意 | おむつ対応。チェックボックス条件では `true` を送信 |
| `futonSupport` | string | 任意 | 布団対応。チェックボックス条件では `true` を送信 |
| `extendedCareHours` | string | 任意 | 延長保育利用時間 |
| `extendedCareUsage` | string | 任意 | 延長保育利用者数。チェックボックス条件では `true` を送信 |
| `itemBurdenLevel` | string | 任意 | 持ち物負担 |
| `weekdayEventsLevel` | string | 任意 | 平日行事の多さ |
| `parentAssociationLevel` | string | 任意 | 保護者会の負担 |
| `lessons` | string | 任意 | 園内習い事あり。チェックボックス条件では `true` を送信 |
| `allergySupport` | string | 任意 | アレルギー対応あり。チェックボックス条件では `true` を送信 |
| `sort` | string | 任意 | 並び順 |

---

### 条件検索の基準

MVPでは、条件検索の「多い・少ない」はユーザーごとの主観ではなく、アプリ内の検索基準として定義します。

フロントエンド側では、検索画面のチェックボックス条件を以下のquery paramsとして送信します。

| 画面表示 | query params | バックエンド側の検索条件 |
| --- | --- | --- |
| 毎日給食 | `mealType=SCHOOL_LUNCH` | `mealType = SCHOOL_LUNCH` |
| おむつ園処理あり | `diaperSupport=true` | `diaperSupport = "園で廃棄"` |
| 布団負担少なめ | `futonSupport=true` | `futonSupport = "園で管理"` |
| 保護者会少なめ | `parentAssociationLevel=LOW` | `parentAssociationLevel = LOW` |
| 延長保育利用者が多い | `extendedCareUsage=true` | `extendedCareUsage = "20人以上"` |
| 園内習い事あり | `lessons=true` | `lessons IS NOT NULL` |
| アレルギー対応あり | `allergySupport=true` | `allergySupport IS NOT NULL` |
| 平日行事少なめ | `weekdayEventsLevel=LOW` | `weekdayEventsLevel = LOW` |

`true` はそのまま文字列検索せず、バックエンド側で検索基準に変換して絞り込みます。

日本語を含む `keyword` / `q` / `area` を送信する場合は、フロントエンド側でURLエンコードされたquery paramsとして送信します。

---

### sort

| 値 | 内容 |
| --- | --- |
| `id_asc` | ID昇順 |
| `recommended` | おすすめ順 |

---

### おすすめ表示について

`sort=recommended` が指定され、ログイン済みユーザーの場合は、ユーザー住所・お気に入り傾向・希望条件をもとにおすすめ順で返します。

プロフィール情報として保存された `address` や、希望条件として保存された `user_preferences` の内容を参照します。

MVPでは高度なレコメンド機能は作成せず、シンプルな条件一致数で並び替えます。

---

### Redisキャッシュ方針

`GET /schools` ではRedisキャッシュを利用します。

キャッシュ対象は、主に以下です。

* 園一覧の元データ
* キーワード検索結果
* 条件検索結果
* おすすめ表示の元データ

キャッシュキーは、検索条件・並び順をもとに生成します。

例：

```txt
schools:list:keyword=sakura:mealType=SCHOOL_LUNCH:sort=id_asc
schools:list:diaperSupport=true:futonSupport=true:extendedCareUsage=true
schools:recommended:userId=<user_id>
```

ただし、`isFavorited` や `preference` などログインユーザーごとに変わる情報は、キャッシュ対象の園データとは分けて付与します。

| 項目 | 方針 |
| --- | --- |
| キャッシュ対象 | 園一覧・検索結果・おすすめ表示の元データ |
| キャッシュ対象外 | `isFavorited`、ユーザーの会員状態、ユーザー固有の情報、`preference` |
| キャッシュ削除 | seedデータ更新時、または必要に応じて手動削除 |
| TTL | MVPでは任意。設定する場合は短時間から開始する |

---

### レスポンス項目

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `id` | string | 園ID |
| `name` | string | 園名 |
| `area` | string | エリア・市区町村 |
| `address` | string | 住所 |
| `schoolType` | string | 園種別 |
| `lifeBurdenLevel` | string | 生活負担 |
| `timeBurdenLevel` | string | 時間負担 |
| `mealType` | string | 給食・弁当 |
| `itemBurdenLevel` | string | 持ち物負担 |
| `diaperSupport` | string / null | おむつ対応 |
| `futonSupport` | string / null | 布団対応 |
| `extendedCareHours` | string / null | 延長保育利用時間 |
| `extendedCareUsage` | string / null | 延長保育利用者の目安 |
| `weekdayEventsLevel` | string | 平日行事の多さ |
| `parentAssociationLevel` | string | 保護者会の負担 |
| `tags` | string[] | 特徴タグ |
| `isFavorited` | boolean | お気に入り登録済みかどうか |

---

### リクエスト例

```http
GET /api/v1/schools?mealType=SCHOOL_LUNCH&lessons=true&allergySupport=true
```

```http
GET /api/v1/schools?diaperSupport=true&futonSupport=true&extendedCareUsage=true
```

```http
GET /api/v1/schools?area=%E4%B8%96%E7%94%B0%E8%B0%B7%E5%8C%BA
```

---

### レスポンス例

```json
{
  "data": [
    {
      "id": "1",
      "name": "さくら保育園",
      "area": "渋谷区",
      "address": "東京都渋谷区さくら1-1-1",
      "schoolType": "NURSERY",
      "lifeBurdenLevel": "LOW",
      "timeBurdenLevel": "LOW",
      "mealType": "SCHOOL_LUNCH",
      "itemBurdenLevel": "LOW",
      "diaperSupport": "園で廃棄",
      "futonSupport": "園で管理",
      "extendedCareHours": "18:00〜20:00",
      "extendedCareUsage": "20人以上",
      "weekdayEventsLevel": "LOW",
      "parentAssociationLevel": "LOW",
      "tags": ["保育園", "毎日給食", "おむつ園処理"],
      "isFavorited": false
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "検索条件が不正です"
  }
}
```

---

## 8-2. 園詳細取得

### 概要

指定した園の詳細情報を取得します。

未登録ユーザー・一般ユーザーの場合、サポート情報の項目名とロック表示用の情報のみ返します。

プレミアムユーザーの場合、サポート情報の内容まで返します。

園詳細APIでは、Enum値に加えて、画面表示でそのまま使える表示用テキスト項目として `itemBurdenDetail` / `weekdayEvents` / `parentAssociationFrequency` を返します。

---

### メソッド・URL

```http
GET /api/v1/schools/:id
```

---

### 認証

任意。

ログイン状態・会員区分によってレスポンス内容を出し分けます。

---

### パスパラメータ

| パラメータ | 型 | 内容 |
| --- | --- | --- |
| `id` | number | 園ID |

---

### リクエスト例

```http
GET /api/v1/schools/1
```

---

### レスポンス項目

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `id` | string | 園ID |
| `name` | string | 園名 |
| `area` | string | エリア・市区町村 |
| `address` | string | 住所 |
| `schoolType` | string | 園種別 |
| `lifeBurdenLevel` | string | 生活負担 |
| `timeBurdenLevel` | string | 時間負担 |
| `mealType` | string | 給食・弁当 |
| `itemBurdenLevel` | string | 持ち物負担レベル |
| `itemBurdenDetail` | string / null | 持ち物負担の表示用テキスト |
| `diaperSupport` | string / null | おむつ対応 |
| `futonSupport` | string / null | 布団対応 |
| `extendedCareHours` | string / null | 延長保育利用時間 |
| `extendedCareUsage` | string / null | 延長保育利用者の目安 |
| `weekdayEventsLevel` | string | 平日行事の多さ |
| `weekdayEvents` | string / null | 平日行事の表示用テキスト |
| `parentAssociationLevel` | string | 保護者会の負担 |
| `parentAssociationFrequency` | string / null | 保護者会頻度の表示用テキスト |
| `description` | string / null | 園説明 |
| `tags` | string[] | 特徴タグ |
| `isFavorited` | boolean | お気に入り登録済みかどうか |
| `supportInfo` | object | プレミアム限定のサポート情報 |

---

### レスポンス例：未登録・一般ユーザー

```json
{
  "data": {
    "id": "1",
    "name": "さくら保育園",
    "area": "渋谷区",
    "address": "東京都渋谷区さくら1-1-1",
    "schoolType": "NURSERY",
    "lifeBurdenLevel": "LOW",
    "timeBurdenLevel": "LOW",
    "mealType": "SCHOOL_LUNCH",
    "itemBurdenLevel": "LOW",
    "itemBurdenDetail": "着替え・上履き程度",
    "diaperSupport": "園で廃棄",
    "futonSupport": "園で管理",
    "extendedCareHours": "18:00〜20:00",
    "extendedCareUsage": "20人以上",
    "weekdayEventsLevel": "LOW",
    "weekdayEvents": "平日行事は少なめ",
    "parentAssociationLevel": "LOW",
    "parentAssociationFrequency": "年に1回程度",
    "description": "駅から近く、延長保育の利用者が多い園です。",
    "tags": ["保育園", "毎日給食", "おむつ園処理"],
    "isFavorited": false,
    "supportInfo": {
      "isLocked": true,
      "contactBookType": null,
      "absenceContactMethod": null,
      "lessons": null,
      "allergySupport": null
    }
  }
}
```

---

### レスポンス例：プレミアムユーザー

```json
{
  "data": {
    "id": "1",
    "name": "さくら保育園",
    "area": "渋谷区",
    "address": "東京都渋谷区さくら1-1-1",
    "schoolType": "NURSERY",
    "lifeBurdenLevel": "LOW",
    "timeBurdenLevel": "LOW",
    "mealType": "SCHOOL_LUNCH",
    "itemBurdenLevel": "LOW",
    "itemBurdenDetail": "着替え・上履き程度",
    "diaperSupport": "園で廃棄",
    "futonSupport": "園で管理",
    "extendedCareHours": "18:00〜20:00",
    "extendedCareUsage": "20人以上",
    "weekdayEventsLevel": "LOW",
    "weekdayEvents": "平日行事は少なめ",
    "parentAssociationLevel": "LOW",
    "parentAssociationFrequency": "年に1回程度",
    "description": "駅から近く、延長保育の利用者が多い園です。",
    "tags": ["保育園", "毎日給食", "おむつ園処理"],
    "isFavorited": true,
    "supportInfo": {
      "isLocked": false,
      "contactBookType": "APP",
      "absenceContactMethod": "APP",
      "lessons": "体操教室",
      "allergySupport": "個別相談可"
    }
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定された園が見つかりません"
  }
}
```

---

## 8-3. 比較対象園取得

### 概要

比較画面で使用する園情報を取得します。

比較対象の園IDはクエリパラメータで指定します。

比較APIでは、比較画面でそのまま表示しやすいように、一部のEnum項目は返さず、DBの表示用テキスト項目を返します。

具体的には、`itemBurdenLevel` / `weekdayEventsLevel` / `parentAssociationLevel` ではなく、`itemBurdenDetail` / `weekdayEvents` / `parentAssociationFrequency` を返します。

後続Issueでは、プレミアムユーザー向けに `user_preferences` の希望条件を参照し、園情報との一致判定結果を `matchHighlights` として返します。

希望条件が未設定の場合、`matchHighlights` は `null` とします。

---

### メソッド・URL

```http
GET /api/v1/schools/compare
```

---

### 認証

必須。

---

### クエリパラメータ

| パラメータ | 型 | 必須 | 内容 |
| --- | --- | --- | --- |
| `ids` | string | 必須 | カンマ区切りの園ID |

---

### 制限

| ユーザー区分 | 比較可能数 |
| --- | --- |
| 一般ユーザー | 2園まで |
| プレミアムユーザー | 3園まで |

---

### リクエスト例

```http
GET /api/v1/schools/compare?ids=1,2
```

```http
GET /api/v1/schools/compare?ids=1,2,3
```

---

### レスポンス例：一般ユーザー

```json
{
  "data": {
    "schools": [
      {
        "id": "1",
        "name": "さくら保育園",
        "area": "渋谷区",
        "schoolType": "NURSERY",
        "lifeBurden": {
          "mealType": "SCHOOL_LUNCH",
          "itemBurdenDetail": "着替え・上履き程度",
          "diaperSupport": "園で廃棄",
          "futonSupport": "園で管理"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜20:00",
          "extendedCareUsage": "20人以上",
          "weekdayEvents": "平日行事は少なめ",
          "parentAssociationFrequency": "年に1回程度"
        }
      },
      {
        "id": "2",
        "name": "みらいこども園",
        "area": "新宿区",
        "schoolType": "CERTIFIED_CHILDCARE_CENTER",
        "lifeBurden": {
          "mealType": "SCHOOL_LUNCH",
          "itemBurdenDetail": "通園バッグ・着替え・上履き程度",
          "diaperSupport": "サブスク対応",
          "futonSupport": "園で管理"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜20:30",
          "extendedCareUsage": "20人以上",
          "weekdayEvents": "月1回程度あり",
          "parentAssociationFrequency": "年に1〜2回程度"
        }
      }
    ],
    "matchHighlights": null
  }
}
```

---

### レスポンス例：プレミアムユーザー

```json
{
  "data": {
    "schools": [
      {
        "id": "1",
        "name": "さくら保育園",
        "area": "渋谷区",
        "schoolType": "NURSERY",
        "lifeBurden": {
          "mealType": "SCHOOL_LUNCH",
          "itemBurdenDetail": "着替え・上履き程度",
          "diaperSupport": "園で廃棄",
          "futonSupport": "園で管理"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜20:00",
          "extendedCareUsage": "20人以上",
          "weekdayEvents": "平日行事は少なめ",
          "parentAssociationFrequency": "年に1回程度"
        }
      }
    ],
    "matchHighlights": null
  }
}
```

---

### エラー例：未ログイン

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

### エラー例：比較数超過

```json
{
  "error": {
    "code": "COMPARE_LIMIT_EXCEEDED",
    "message": "一般ユーザーは2園まで比較できます"
  }
}
```

---

# 9. ユーザーAPI

## 9-1. ログインユーザー情報取得

### 概要

マイページ、プロフィール編集画面、ヘッダー表示、会員区分判定に使用するログインユーザー情報を取得します。

Supabase Auth 上のユーザーは存在するが、アプリ側 `users` レコードが存在しない場合、このAPI実行時に一般ユーザーとして自動作成します。

プロフィール情報が登録済みの場合は、`name` / `postalCode` / `address` に保存済みの値を返します。

プロフィール情報が未登録の場合は、`name` / `postalCode` / `address` に `null` を返します。

ユーザー希望条件が登録済みの場合は `preference` に希望条件を返します。

希望条件が未設定の場合は `preference: null` を返します。

---

### メソッド・URL

```http
GET /api/v1/users/me
```

---

### 認証

必須。

---

### users レコード自動作成

`GET /users/me` 実行時、以下の条件を満たす場合は、バックエンド側で `users` レコードを自動作成します。

| 条件 | 内容 |
| --- | --- |
| Supabase Auth | アクセストークンが有効で、Supabase Auth User ID を取得できる |
| users テーブル | 該当する `supabase_user_id` のレコードが存在しない |

自動作成時の初期値は以下とします。

| DBカラム | 値 |
| --- | --- |
| `id` | UUIDを自動生成 |
| `supabase_user_id` | Supabase Auth User ID |
| `email` | Supabase Auth のメールアドレス |
| `name` | `null` |
| `postal_code` | `null` |
| `address` | `null` |
| `plan_type` | `FREE` |
| `created_at` | 作成日時 |
| `updated_at` | 作成日時 |

作成直後は、プロフィール情報・希望条件は未設定でもよいものとします。

プロフィール情報が未設定の場合、`name` / `postalCode` / `address` に `null` を返します。

希望条件が未設定の場合、`preference: null` を返します。

---

### レスポンス項目

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `id` | string | アプリ内ユーザーID |
| `email` | string | メールアドレス |
| `name` | string / null | ユーザーの表示名・お名前 |
| `postalCode` | string / null | ユーザー住所の郵便番号。ハイフンなし7桁 |
| `address` | string / null | ユーザー住所 |
| `membershipType` | string | 会員種別。`FREE` / `PAID` |
| `subscriptionStatus` | string / null | 課金状態。未登録の場合は `null` |
| `currentPeriodEnd` | string / null | プレミアム機能の利用期限 |
| `preference` | object / null | ユーザー希望条件。未設定の場合は `null` |

#### preference

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `preferredMealType` | string / null | 希望する給食・弁当区分 |
| `preferredItemBurdenLevel` | string / null | 希望する持ち物負担レベル |
| `preferredDiaperSupport` | string / null | 希望するおむつ対応 |
| `preferredFutonSupport` | string / null | 希望する布団対応 |
| `preferredExtendedCare` | string / null | 希望する延長保育条件 |
| `preferredLessons` | boolean / null | 園内習い事ありを希望するか |
| `preferredAllergySupport` | boolean / null | アレルギー対応ありを希望するか |
| `preferredWeekdayEventsLevel` | string / null | 希望する平日行事負担レベル |
| `preferredParentAssociationLevel` | string / null | 希望する保護者会負担レベル |

---

### レスポンス例：プロフィール情報・希望条件未設定

```json
{
  "data": {
    "id": "8a230a51-3319-4c49-ba51-70d52ce9f4fa",
    "email": "user@example.com",
    "name": null,
    "postalCode": null,
    "address": null,
    "membershipType": "FREE",
    "subscriptionStatus": null,
    "currentPeriodEnd": null,
    "preference": null
  }
}
```

---

### レスポンス例：プロフィール情報・希望条件登録済み

```json
{
  "data": {
    "id": "8a230a51-3319-4c49-ba51-70d52ce9f4fa",
    "email": "user@example.com",
    "name": "テスト 太郎",
    "postalCode": "1000001",
    "address": "東京都千代田区千代田",
    "membershipType": "FREE",
    "subscriptionStatus": "ACTIVE",
    "currentPeriodEnd": "2026-07-25T00:00:00.000Z",
    "preference": {
      "preferredMealType": "SCHOOL_LUNCH",
      "preferredItemBurdenLevel": "LOW",
      "preferredDiaperSupport": "園で廃棄",
      "preferredFutonSupport": "園で管理",
      "preferredExtendedCare": "20人以上",
      "preferredLessons": true,
      "preferredAllergySupport": true,
      "preferredWeekdayEventsLevel": "LOW",
      "preferredParentAssociationLevel": "LOW"
    }
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

## 9-2. ログインユーザープロフィール情報更新

### 概要

プロフィール編集画面で、ログインユーザーのお名前・郵便番号・住所を保存・更新します。

プロフィール情報は `users` テーブルに保存します。

郵便番号はハイフンなし7桁で保存します。

---

### メソッド・URL

```http
PUT /api/v1/users/me
```

---

### 認証

必須。

---

### リクエストボディ

```json
{
  "name": "テスト 太郎",
  "postalCode": "1000001",
  "address": "東京都千代田区千代田"
}
```

---

### リクエスト項目

| 項目 | 型 | 必須 | 内容 |
| --- | --- | --- | --- |
| `name` | string | 必須 | ユーザーの表示名・お名前 |
| `postalCode` | string | 必須 | ユーザー住所の郵便番号。ハイフンなし7桁 |
| `address` | string | 必須 | ユーザー住所 |

---

### バリデーション

| 項目 | 条件 |
| --- | --- |
| `name` | 1文字以上100文字以内 |
| `postalCode` | ハイフンなし7桁の数字 |
| `address` | 1文字以上255文字以内 |

---

### レスポンス例

```json
{
  "data": {
    "id": "8a230a51-3319-4c49-ba51-70d52ce9f4fa",
    "email": "user@example.com",
    "name": "テスト 太郎",
    "postalCode": "1000001",
    "address": "東京都千代田区千代田",
    "membershipType": "FREE"
  }
}
```

---

### エラー例：未ログイン

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

### エラー例：郵便番号が不正

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "郵便番号は7桁の数字で入力してください"
  }
}
```

---

### エラー例：お名前未入力

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "お名前を入力してください"
  }
}
```

---

### エラー例：住所未入力

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "住所を入力してください"
  }
}
```

---

## 9-3. ログインユーザー希望条件更新

### 概要

プロフィール編集画面で、ログインユーザーの希望条件を保存・更新します。

希望条件は `user_preferences` テーブルに保存します。

未作成の場合は作成し、作成済みの場合は更新します。

このAPIで保存された希望条件は、後続の比較APIにおける `matchHighlights` 判定、およびおすすめ順ロジックで利用します。

---

### メソッド・URL

```http
PATCH /api/v1/users/me/preferences
```

---

### 認証

必須。

---

### リクエストボディ

```json
{
  "preferredMealType": "SCHOOL_LUNCH",
  "preferredItemBurdenLevel": "LOW",
  "preferredDiaperSupport": "園で廃棄",
  "preferredFutonSupport": "園で管理",
  "preferredExtendedCare": "20人以上",
  "preferredLessons": true,
  "preferredAllergySupport": true,
  "preferredWeekdayEventsLevel": "LOW",
  "preferredParentAssociationLevel": "LOW"
}
```

---

### リクエスト項目

| 項目 | 型 | 必須 | 内容 |
| --- | --- | --- | --- |
| `preferredMealType` | string / null | 任意 | 希望する給食・弁当区分 |
| `preferredItemBurdenLevel` | string / null | 任意 | 希望する持ち物負担レベル |
| `preferredDiaperSupport` | string / null | 任意 | 希望するおむつ対応 |
| `preferredFutonSupport` | string / null | 任意 | 希望する布団対応 |
| `preferredExtendedCare` | string / null | 任意 | 希望する延長保育条件 |
| `preferredLessons` | boolean / null | 任意 | 園内習い事ありを希望するか |
| `preferredAllergySupport` | boolean / null | 任意 | アレルギー対応ありを希望するか |
| `preferredWeekdayEventsLevel` | string / null | 任意 | 希望する平日行事負担レベル |
| `preferredParentAssociationLevel` | string / null | 任意 | 希望する保護者会負担レベル |

---

### バリデーション

| 項目 | 条件 |
| --- | --- |
| `preferredMealType` | 任意。指定する場合は `SCHOOL_LUNCH` / `LUNCH_BOX` / `BOTH` のいずれか |
| `preferredItemBurdenLevel` | 任意。指定する場合は `LOW` / `MEDIUM` / `HIGH` のいずれか |
| `preferredDiaperSupport` | 任意 |
| `preferredFutonSupport` | 任意 |
| `preferredExtendedCare` | 任意 |
| `preferredLessons` | 任意。boolean または null |
| `preferredAllergySupport` | 任意。boolean または null |
| `preferredWeekdayEventsLevel` | 任意。指定する場合は `LOW` / `MEDIUM` / `HIGH` のいずれか |
| `preferredParentAssociationLevel` | 任意。指定する場合は `LOW` / `MEDIUM` / `HIGH` のいずれか |

---

### レスポンス例

```json
{
  "data": {
    "preference": {
      "preferredMealType": "SCHOOL_LUNCH",
      "preferredItemBurdenLevel": "LOW",
      "preferredDiaperSupport": "園で廃棄",
      "preferredFutonSupport": "園で管理",
      "preferredExtendedCare": "20人以上",
      "preferredLessons": true,
      "preferredAllergySupport": true,
      "preferredWeekdayEventsLevel": "LOW",
      "preferredParentAssociationLevel": "LOW"
    }
  }
}
```

---

### エラー例：未ログイン

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

### エラー例：バリデーションエラー

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "希望条件の値が不正です"
  }
}
```

---

# 10. 住所検索API

## 10-1. 郵便番号による住所検索

### 概要

プロフィール編集画面で、郵便番号7桁入力時に住所を自動入力するためのAPIです。

バックエンド側から zipcloud API を呼び出し、取得した住所情報をフロントエンドへ返します。

このAPIは住所自動入力用であり、DB保存は行いません。

住所の保存は `PUT /api/v1/users/me` で行います。

---

### メソッド・URL

```http
GET /api/v1/address/search
```

---

### 認証

不要。

---

### クエリパラメータ

| パラメータ | 型 | 必須 | 内容 |
| --- | --- | --- | --- |
| `zipcode` | string | 必須 | ハイフンなし7桁の郵便番号 |

---

### リクエスト例

```http
GET /api/v1/address/search?zipcode=1000001
```

---

### レスポンス例

```json
{
  "data": {
    "zipcode": "1000001",
    "prefecture": "東京都",
    "city": "千代田区",
    "town": "千代田",
    "address": "東京都千代田区千代田"
  }
}
```

---

### エラー例：郵便番号が不正

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "郵便番号は7桁の数字で入力してください"
  }
}
```

または実装上、以下の形式で返す場合があります。

```json
{
  "message": "郵便番号は7桁の数字で入力してください"
}
```

---

### エラー例：住所が見つからない

```json
{
  "message": "住所が見つかりません"
}
```

---

# 11. お気に入りAPI

## 11-1. お気に入り一覧取得

### 概要

ログインユーザーのお気に入り園一覧を取得します。

お気に入り一覧画面で使用します。

---

### メソッド・URL

```http
GET /api/v1/users/me/favorites
```

---

### 認証

必須。

---

### レスポンス例：一般ユーザー

```json
{
  "data": [
    {
      "id": "1",
      "school": {
        "id": "1",
        "name": "さくら保育園",
        "area": "渋谷区",
        "address": "東京都渋谷区さくら1-1-1",
        "schoolType": "NURSERY"
      },
      "createdAt": "2026-06-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "favoriteCount": 1,
    "favoriteLimit": 5
  }
}
```

---

### レスポンス例：プレミアムユーザー

```json
{
  "data": [
    {
      "id": "1",
      "school": {
        "id": "1",
        "name": "さくら保育園",
        "area": "渋谷区",
        "address": "東京都渋谷区さくら1-1-1",
        "schoolType": "NURSERY"
      },
      "createdAt": "2026-06-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "favoriteCount": 12,
    "favoriteLimit": null
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

## 11-2. お気に入り登録

### 概要

指定した園をログインユーザーのお気に入りに登録します。

一般ユーザーは5件まで登録できます。

プレミアムユーザーは無制限に登録できます。

---

### メソッド・URL

```http
POST /api/v1/users/me/favorites
```

---

### 認証

必須。

---

### リクエストボディ

```json
{
  "schoolId": 1
}
```

---

### 制限

| ユーザー区分 | 制限 |
| --- | --- |
| 一般ユーザー | 5件まで |
| プレミアムユーザー | 無制限 |

---

### レスポンス例

```json
{
  "data": {
    "id": "1",
    "schoolId": "1",
    "createdAt": "2026-06-14T10:00:00.000Z"
  }
}
```

---

### エラー例：未ログイン

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

### エラー例：上限到達

```json
{
  "error": {
    "code": "FAVORITE_LIMIT_EXCEEDED",
    "message": "お気に入りは5件まで登録できます。プレミアムで無制限に登録できます"
  }
}
```

---

### エラー例：重複登録

```json
{
  "error": {
    "code": "ALREADY_FAVORITED",
    "message": "すでにお気に入り登録済みです"
  }
}
```

---

## 11-3. お気に入り解除

### 概要

指定した園をログインユーザーのお気に入りから解除します。

---

### メソッド・URL

```http
DELETE /api/v1/users/me/favorites/:schoolId
```

---

### 認証

必須。

---

### パスパラメータ

| パラメータ | 型 | 内容 |
| --- | --- | --- |
| `schoolId` | number | 園ID |

---

### レスポンス例

```json
{
  "data": {
    "schoolId": "1",
    "deleted": true
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "お気に入り登録が見つかりません"
  }
}
```

---

# 12. 決済API

## 12-1. Stripe Checkout Session作成

### 概要

一般ユーザーがプレミアムプランへ登録するための Stripe Checkout Session を作成します。

未登録ユーザーはこのAPIを利用できません。

未登録ユーザーがプレミアム登録ボタンを押した場合は、まず会員登録画面 `/register` へ誘導します。

---

### メソッド・URL

```http
POST /api/v1/payment/checkout
```

---

### 認証

必須。

---

### リクエストボディ

```json
{
  "plan": "premium_monthly"
}
```

---

### 制限

| ユーザー区分 | 利用可否 |
| --- | --- |
| 未登録ユーザー | 不可 |
| 一般ユーザー | 可 |
| プレミアムユーザー | 不可 |

---

### レスポンス例

```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/session_id"
  }
}
```

---

### エラー例：未ログイン

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "ログインが必要です"
  }
}
```

---

### エラー例：すでにプレミアム

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "すでにプレミアムユーザーです"
  }
}
```

---

## 12-2. Stripe Customer Portal URL作成

### 概要

プレミアムユーザーが一般プランへ変更するため、Stripe Customer Portal へ遷移するURLを作成します。

---

### メソッド・URL

```http
POST /api/v1/payment/customer-portal
```

---

### 認証

必須。

---

### リクエストボディ

なし。

---

### 制限

| ユーザー区分 | 利用可否 |
| --- | --- |
| 未登録ユーザー | 不可 |
| 一般ユーザー | 不可 |
| プレミアムユーザー | 可 |

---

### レスポンス例

```json
{
  "data": {
    "portalUrl": "https://billing.stripe.com/session/session_id"
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "PREMIUM_REQUIRED",
    "message": "プレミアムユーザーのみ利用できます"
  }
}
```

---

## 12-3. Stripe Webhook受信

### 概要

StripeからのWebhookを受け取り、ユーザーのプレミアム状態を更新します。

---

### メソッド・URL

```http
POST /api/v1/payment/webhook
```

---

### 認証

不要。

ただし、Stripe署名検証を必ず行います。

---

### 対応イベント

| イベント | 処理 |
| --- | --- |
| `checkout.session.completed` | プレミアム登録 |
| `customer.subscription.updated` | subscription status更新 |
| `customer.subscription.deleted` | プレミアム停止 |
| `invoice.payment_succeeded` | プレミアム継続 |
| `invoice.payment_failed` | プレミアム停止または要確認状態に更新 |

---

### 更新対象

* `subscriptions.stripe_customer_id`
* `subscriptions.stripe_subscription_id`
* `subscriptions.status`
* `subscriptions.current_period_end`
* 必要に応じて `users.plan_type`

---

### レスポンス例

```json
{
  "received": true
}
```

---

### エラー例

```json
{
  "error": {
    "code": "PAYMENT_ERROR",
    "message": "Webhookの検証に失敗しました"
  }
}
```

---

# 13. Enum定義

APIで扱う主なEnum値は以下とします。

## 13-1. membershipType

| 値 | 内容 |
| --- | --- |
| `FREE` | 一般ユーザー |
| `PAID` | プレミアムユーザー |

---

## 13-2. subscriptionStatus

| 値 | 内容 |
| --- | --- |
| `ACTIVE` | 有効 |
| `CANCELED` | 解約済み |
| `EXPIRED` | 期限切れ |

---

## 13-3. schoolType

| 値 | 内容 |
| --- | --- |
| `NURSERY` | 保育園 |
| `KINDERGARTEN` | 幼稚園 |
| `CERTIFIED_CHILDCARE_CENTER` | 認定こども園 |

---

## 13-4. burdenLevel

| 値 | 内容 |
| --- | --- |
| `LOW` | 少なめ |
| `MEDIUM` | 普通 |
| `HIGH` | 多め |

---

## 13-5. mealType

| 値 | 内容 |
| --- | --- |
| `SCHOOL_LUNCH` | 毎日給食 |
| `LUNCH_BOX` | 毎日弁当 |
| `BOTH` | 給食・弁当 |

---

## 13-6. contactType

| 値 | 内容 |
| --- | --- |
| `APP` | アプリ |
| `PHONE` | 電話 |
| `PAPER` | 紙 |
| `OTHER` | その他 |

---

# 14. バリデーション方針

## 14-1. 共通

* 必須項目が未入力の場合は `VALIDATION_ERROR`
* ID形式が不正な場合は `VALIDATION_ERROR`
* `schools.id` は number または string として受け取り、内部では bigint として扱う
* `users.id` は uuid として扱う
* 対象データが存在しない場合は `NOT_FOUND`
* 権限がない場合は `FORBIDDEN`
* 未ログインの場合は `UNAUTHORIZED`

---

## 14-2. 園一覧・検索

* `keyword` は任意
* `q` は任意
* `area` は任意
* Enum系の検索条件は定義済みの値のみ許可
* チェックボックス系の検索条件は、フロントエンドから `true` を送信する
* `diaperSupport=true` は `diaperSupport = "園で廃棄"` として扱う
* `futonSupport=true` は `futonSupport = "園で管理"` として扱う
* `extendedCareUsage=true` は `extendedCareUsage = "20人以上"` として扱う
* `lessons=true` は `lessons IS NOT NULL` として扱う
* `allergySupport=true` は `allergySupport IS NOT NULL` として扱う
* 不正な検索条件は `VALIDATION_ERROR`
* 園一覧・検索結果・おすすめ表示ではRedisキャッシュを利用する
* `isFavorited` などユーザー固有の値はキャッシュ対象の園データとは分けて付与する

---

## 14-3. 園詳細

* `id` は必須
* `id` は number
* 存在しない園IDの場合は `NOT_FOUND`

---

## 14-4. お気に入り登録

* `schoolId` は必須
* `schoolId` は number
* 存在しない園IDは登録不可
* 同一ユーザー・同一園の重複登録は不可
* 一般ユーザーは5件を超えて登録不可
* プレミアムユーザーは件数制限なし

---

## 14-5. 比較

* `ids` は必須
* `ids` はカンマ区切りの number として扱う
* 重複した園IDが含まれる場合はエラー
* 存在しない園IDが含まれる場合はエラー
* 一般ユーザーは2件まで
* プレミアムユーザーは3件まで
* プレミアムユーザーの場合、希望条件が設定されていれば後続Issueで `matchHighlights` に一致判定結果を返す
* 希望条件が未設定の場合、`matchHighlights` は `null` とする

---

## 14-6. ユーザープロフィール情報更新

* `PUT /api/v1/users/me` は認証必須
* `name` は必須
* `name` は1文字以上100文字以内
* `postalCode` は必須
* `postalCode` はハイフンなし7桁の数字
* `address` は必須
* `address` は1文字以上255文字以内
* 未ログインの場合は `UNAUTHORIZED`
* 不正な値は `VALIDATION_ERROR` とする

---

## 14-7. ユーザー希望条件更新

* `PATCH /api/v1/users/me/preferences` は認証必須
* 希望条件はすべて任意
* 希望条件未設定の場合、`GET /api/v1/users/me` では `preference: null` を返す
* 保存済みの希望条件がある場合、`GET /api/v1/users/me` では `preference` に保存内容を返す
* `preferredMealType` は `SCHOOL_LUNCH` / `LUNCH_BOX` / `BOTH` のいずれか
* `preferredItemBurdenLevel` は `LOW` / `MEDIUM` / `HIGH` のいずれか
* `preferredWeekdayEventsLevel` は `LOW` / `MEDIUM` / `HIGH` のいずれか
* `preferredParentAssociationLevel` は `LOW` / `MEDIUM` / `HIGH` のいずれか
* `preferredDiaperSupport` / `preferredFutonSupport` / `preferredExtendedCare` は文字列または `null` とする
* `preferredLessons` / `preferredAllergySupport` は boolean または `null` とする
* 不正な値は `VALIDATION_ERROR` とする

---

## 14-8. 住所検索

* `GET /api/v1/address/search` は認証不要
* `zipcode` は必須
* `zipcode` はハイフンなし7桁の数字
* 郵便番号が不正な場合は400を返す
* 住所が見つからない場合は404を返す
* 住所検索APIはDB保存を行わない
* 住所保存は `PUT /api/v1/users/me` で行う

---

# 15. MVP対象外API

以下のAPIはMVPでは作成しません。

* 口コミ投稿API
* 口コミ承認API
* 人気ランキングAPI
* AIレポート生成API
* PDF出力API
* 通知API
* 管理画面CRUD API
* 詳細比較レポートAPI
* チャート表示専用API
* 比較リスト保存API
* 比較履歴保存API
* 請求履歴取得API
* 独自のプラン変更API

---

# 16. DB設計書との対応表

## 16-1. users

| DBカラム | API項目 |
| --- | --- |
| `id` | `id` |
| `supabase_user_id` | 内部利用 |
| `email` | `email` |
| `name` | `name` |
| `postal_code` | `postalCode` |
| `address` | `address` |
| `plan_type` | `membershipType` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

## 16-2. user_preferences

| DBカラム | API項目 |
| --- | --- |
| `id` | 内部利用 |
| `user_id` | 内部利用 |
| `preferred_meal_type` | `preference.preferredMealType` |
| `preferred_item_burden_level` | `preference.preferredItemBurdenLevel` |
| `preferred_diaper_support` | `preference.preferredDiaperSupport` |
| `preferred_futon_support` | `preference.preferredFutonSupport` |
| `preferred_extended_care` | `preference.preferredExtendedCare` |
| `preferred_lessons` | `preference.preferredLessons` |
| `preferred_allergy_support` | `preference.preferredAllergySupport` |
| `preferred_weekday_events_level` | `preference.preferredWeekdayEventsLevel` |
| `preferred_parent_association_level` | `preference.preferredParentAssociationLevel` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

## 16-3. schools

| DBカラム | API項目 |
| --- | --- |
| `id` | `id` |
| `name` | `name` |
| `area` | `area` |
| `address` | `address` |
| `school_type` | `schoolType` |
| `life_burden_level` | `lifeBurdenLevel` |
| `time_burden_level` | `timeBurdenLevel` |
| `meal_type` | `mealType` |
| `item_burden_level` | `itemBurdenLevel` |
| `item_burden_detail` | `itemBurdenDetail` |
| `diaper_support` | `diaperSupport` |
| `futon_support` | `futonSupport` |
| `extended_care_hours` | `extendedCareHours` |
| `extended_care_usage` | `extendedCareUsage` |
| `weekday_events_level` | `weekdayEventsLevel` |
| `weekday_events` | `weekdayEvents` |
| `parent_association_level` | `parentAssociationLevel` |
| `parent_association_frequency` | `parentAssociationFrequency` |
| `contact_book_type` | `supportInfo.contactBookType` |
| `absence_contact_method` | `supportInfo.absenceContactMethod` |
| `lessons` | `supportInfo.lessons` |
| `allergy_support` | `supportInfo.allergySupport` |
| `description` | `description` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

## 16-4. favorites

| DBカラム | API項目 |
| --- | --- |
| `id` | `id` |
| `user_id` | 内部利用 |
| `school_id` | `schoolId` |
| `created_at` | `createdAt` |

---

## 16-5. subscriptions

| DBカラム | API項目 |
| --- | --- |
| `id` | 内部利用 |
| `user_id` | 内部利用 |
| `stripe_customer_id` | 内部利用 |
| `stripe_subscription_id` | 内部利用 |
| `status` | `subscriptionStatus` |
| `current_period_end` | `currentPeriodEnd` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

# 17. 実装時の補足

## 17-1. 比較機能について

MVPでは、比較リスト専用画面や比較リスト保存APIは作成しません。

比較対象は、お気に入り一覧画面で選択し、比較画面へ園IDを渡す想定です。

そのため、比較APIでは以下のように園IDをクエリパラメータで受け取ります。

```http
GET /api/v1/schools/compare?ids=1,2
```

プレミアムユーザーの場合は3園まで許可します。

```http
GET /api/v1/schools/compare?ids=1,2,3
```

比較APIでは、プレミアムユーザー向けに `user_preferences` の希望条件を参照し、後続Issueで `matchHighlights` を返す想定です。

希望条件が未設定の場合、`matchHighlights` は `null` とします。

---

## 17-2. サポート情報について

サポート情報は、プレミアム限定情報として扱います。

対象項目：

* 連絡帳
* 欠席連絡方法
* 園内習い事
* アレルギー対応

未登録ユーザー・一般ユーザーには、項目名とロック表示用の情報のみ返します。

プレミアムユーザーには、実際の内容を返します。

---

## 17-3. おすすめ表示について

ホーム画面のおすすめ表示では、以下を考慮します。

* ユーザー住所と同じエリアの園を優先
* `user_preferences` に希望条件が設定されている場合は一致度順
* エリア該当がない場合は希望条件のみで並び替え
* 希望条件も未設定の場合は全件表示

MVPでは高度なレコメンド機能は作成せず、シンプルな条件一致数で並び替える想定です。

---

## 17-4. プレミアム判定について

プレミアム判定は、`subscriptions.status = ACTIVE` をもとに行います。

バックエンド側で必ず判定し、フロントエンド側の表示制御だけに依存しないようにします。

---

## 17-5. 園画像について

MVPでは、園画像は固定画像または将来拡張で対応する想定です。

---

## 17-6. Redisキャッシュについて

MVPでは、園一覧・検索結果・おすすめ表示でRedisキャッシュを利用します。

キャッシュ対象は、園データそのものや検索結果の元データとします。

ログインユーザーごとに変わる以下の情報は、キャッシュ対象から分けて扱います。

* `isFavorited`
* `isPremium`
* `favoriteCount`
* `favoriteLimit`
* `preference`
* `matchHighlights`

Redisキャッシュを導入することで、同一条件でのDBアクセスを減らし、検索結果表示のパフォーマンスを改善します。

---

## 17-7. seedデータと条件検索の関係

#32 で検索・比較確認用のseedデータを20件に拡充しています。

MVPの条件検索では、以下の値を検索基準として使用します。

* おむつ園処理あり：`diaperSupport = "園で廃棄"`
* 布団負担少なめ：`futonSupport = "園で管理"`
* 延長保育利用者が多い：`extendedCareUsage = "20人以上"`
* 園内習い事あり：`lessons IS NOT NULL`
* 園内習い事なし：`lessons = null`
* アレルギー対応あり：`allergySupport IS NOT NULL`
* アレルギー対応なし：`allergySupport = null`
* 保護者会少なめ：`parentAssociationLevel = LOW`
* 平日行事少なめ：`weekdayEventsLevel = LOW`

---

## 17-8. プロフィール情報と住所検索APIの関係

プロフィール編集画面では、郵便番号7桁入力時に `GET /api/v1/address/search?zipcode=1234567` を利用して住所を自動入力します。

この住所検索APIは、住所候補を取得してフロントエンドに返すためのAPIであり、DB保存は行いません。

お名前・郵便番号・住所の保存は、`PUT /api/v1/users/me` で行います。

---

# 18. 今後の確認事項

* `schoolType`、`mealType` などのEnum値と表示用テキストの対応をどこまで共通化するか
* `tags` をDBに持たず、API側で生成する方針でよいか
* RedisキャッシュのTTLを何分に設定するか
* Redisキャッシュの削除タイミングをどうするか
* Stripe Webhook後に `users.plan_type` を同期するか
* 園画像をURLで持つか、MVPでは固定画像にするか
* `user_preferences` の希望条件と比較APIの `matchHighlights` の対応項目をどこまで揃えるか

---

# 19. 変更履歴

| バージョン | 日付 | 変更内容 |
| --- | --- | --- |
| v0.1 | 2026/06/22 | MVPで使用するAPI仕様の初版を作成 |
| v0.2 | 2026/06/23 | 園検索条件、比較API、Redisキャッシュ方針、Stripe関連APIを整理 |
| v0.3 | 2026/06/24 | ユーザー希望条件を `user_preferences` で管理する方針に合わせ、`GET /users/me` のレスポンスと `PATCH /users/me/preferences` を追加 |
| v0.4 | 2026/06/25 | マイページのプロフィール情報保存API追加に伴い、`GET /users/me` に `name` / `postalCode` / `address` を追加し、`PUT /users/me` を追加。住所自動入力用の `GET /address/search` と、希望条件の `preferredLessons` / `preferredAllergySupport` も反映 |