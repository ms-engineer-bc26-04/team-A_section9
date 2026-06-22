# ENKATSU API設計書

## 1. API概要

本ドキュメントは、ENKATSU のMVPで使用するAPI仕様を整理したAPI設計書です。

ENKATSUは、共働き家庭・仕事復帰を控えた保護者向けに、保育園・こども園の「復職後の保護者負担」を検索・比較できるWebアプリケーションです。

本API設計書では、以下の画面・機能を実現するためのAPIを定義します。

* 園一覧・検索
* 園詳細
* ログインユーザー情報取得
* プロフィール編集
* お気に入り登録・解除
* お気に入り一覧
* 園比較
* Stripe Checkout
* Stripe Customer Portal
* Stripe Webhook

---

## 2. 前提

本API設計書は、以下のドキュメントをもとに作成しています。

* 要件定義書
* 画面設計書 v0.5
* DB設計書
* 画面遷移図

DB設計書の確定に伴い、以下の方針を反映します。

* `users.id` は Supabase Auth User ID と同じ `uuid` とする
* `schools.id` は `bigint` とする
* `favorites.id` は `bigint` とする
* `subscriptions.id` は `bigint` とする
* DBカラム名は `snake_case` とする
* APIレスポンスはフロントエンドで扱いやすいように `camelCase` とする
* プレミアム判定は `subscriptions.status = active` を正とする
* `users.plan_type` は画面表示用の補助情報として扱う
* 比較対象の選択は `/mypage/favorites` で行う
* MVPでは比較リスト保存APIは作成しない
* MVPではチャート表示専用API・詳細比較レポートAPIは作成しない

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

### 3-5. APIレスポンス形式

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

| ステータス | 用途          |
| ----- | ----------- |
| 200   | 取得・更新・削除成功  |
| 201   | 作成成功        |
| 400   | リクエスト内容不正   |
| 401   | 未認証         |
| 403   | 権限不足        |
| 404   | 対象データが存在しない |
| 409   | 重複登録などの競合   |
| 422   | バリデーションエラー  |
| 500   | サーバーエラー     |

---

## 5. エラーコード一覧

| code                      | 内容              |
| ------------------------- | --------------- |
| `UNAUTHORIZED`            | ログインが必要         |
| `FORBIDDEN`               | 操作権限がない         |
| `NOT_FOUND`               | 対象データが存在しない     |
| `VALIDATION_ERROR`        | 入力値が不正          |
| `FAVORITE_LIMIT_EXCEEDED` | お気に入り登録上限に達している |
| `ALREADY_FAVORITED`       | すでにお気に入り登録済み    |
| `COMPARE_LIMIT_EXCEEDED`  | 比較可能数を超えている     |
| `PREMIUM_REQUIRED`        | プレミアム登録が必要      |
| `PAYMENT_ERROR`           | 決済処理に失敗         |
| `INTERNAL_SERVER_ERROR`   | サーバー内部エラー       |

---

## 6. 認証・認可方針

### 6-1. ユーザー区分

ENKATSUでは以下の3区分を扱います。

| 区分        | 内容            | DB上の扱い                          |
| --------- | ------------- | ------------------------------- |
| 未登録ユーザー   | ログインしていないユーザー | users レコードなし                    |
| 一般ユーザー    | ログイン済みの無料ユーザー | `users.plan_type = free`        |
| プレミアムユーザー | 月額課金済みの有料ユーザー | `subscriptions.status = active` |

---

### 6-2. プレミアム判定

プレミアム会員の判定は、`subscriptions.status = active` を正とします。

`users.plan_type` は画面表示や簡易的な会員種別表示のための補助情報として扱います。

Stripe Webhookで決済状態が変更された場合は、`subscriptions.status` を更新します。
必要に応じて `users.plan_type` も同期します。

---

### 6-3. 認可ルール

| 機能                     | 未登録ユーザー | 一般ユーザー | プレミアムユーザー |
| ---------------------- | ------- | ------ | --------- |
| 園一覧取得                  | ○       | ○      | ○         |
| 園詳細取得                  | ○       | ○      | ○         |
| お気に入り登録                | ×       | 5件まで   | 無制限       |
| お気に入り一覧取得              | ×       | ○      | ○         |
| 2園比較                   | ×       | ○      | ○         |
| 3園比較                   | ×       | ×      | ○         |
| サポート情報の内容閲覧            | ×       | ×      | ○         |
| 希望条件との一致表示             | ×       | ×      | ○         |
| プロフィール編集               | ×       | ○      | ○         |
| Stripe Checkout        | ×       | ○      | ×         |
| Stripe Customer Portal | ×       | ×      | ○         |

---

## 7. エンドポイント一覧

| 分類    | メソッド   | エンドポイント                         | 認証 | 概要                           |
| ----- | ------ | ------------------------------- | -- | ---------------------------- |
| 園     | GET    | `/schools`                      | 任意 | 園一覧・検索結果取得                   |
| 園     | GET    | `/schools/:id`                  | 任意 | 園詳細取得                        |
| 園     | GET    | `/schools/compare`              | 必須 | 比較対象園取得                      |
| ユーザー  | GET    | `/users/me`                     | 必須 | ログインユーザー情報取得                 |
| ユーザー  | PUT    | `/users/me`                     | 必須 | ログインユーザー情報更新                 |
| お気に入り | GET    | `/users/me/favorites`           | 必須 | お気に入り一覧取得                    |
| お気に入り | POST   | `/users/me/favorites`           | 必須 | お気に入り登録                      |
| お気に入り | DELETE | `/users/me/favorites/:schoolId` | 必須 | お気に入り解除                      |
| 決済    | POST   | `/payment/checkout`             | 必須 | Stripe Checkout Session作成    |
| 決済    | POST   | `/payment/customer-portal`      | 必須 | Stripe Customer Portal URL作成 |
| 決済    | POST   | `/payment/webhook`              | 不要 | Stripe Webhook受信             |

---

# 8. 園API

## 8-1. 園一覧・検索結果取得

### 概要

園一覧、検索結果、ホーム画面のおすすめ表示に使用する園データを取得します。

未ログインでも取得可能です。
ログイン済みの場合は、お気に入り登録済みかどうかを `isFavorited` に含めます。

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

| パラメータ                    | 型       | 必須 | 内容        |
| ------------------------ | ------- | -- | --------- |
| `keyword`                | string  | 任意 | 保育園名・住所検索 |
| `area`                   | string  | 任意 | エリア・市区町村  |
| `mealType`               | string  | 任意 | 給食・弁当     |
| `diaperSupport`          | string  | 任意 | おむつ対応     |
| `futonSupport`           | string  | 任意 | 布団対応      |
| `extendedCareTime`       | string  | 任意 | 延長保育利用時間  |
| `weekdayEventsLevel`     | string  | 任意 | 平日行事の多さ   |
| `parentAssociationLevel` | string  | 任意 | 保護者会の負担   |
| `lessons`                | boolean | 任意 | 園内習い事あり   |
| `allergySupport`         | boolean | 任意 | アレルギー対応あり |
| `sort`                   | string  | 任意 | 並び順       |
| `limit`                  | number  | 任意 | 取得件数      |
| `offset`                 | number  | 任意 | 取得開始位置    |

---

### sort

| 値               | 内容    |
| --------------- | ----- |
| `recommended`   | おすすめ順 |
| `createdAtDesc` | 新着順   |

---

### おすすめ表示について

`sort=recommended` が指定され、ログイン済みユーザーの場合は、ユーザーの住所・希望条件をもとにおすすめ順で返します。

おすすめ表示では、以下の順で表示します。

1. ユーザーの住所と同じエリアの園を優先する
2. 希望条件が設定されている場合は、一致度が高い順に表示する
3. エリア該当がない場合は、希望条件のみで並び替える
4. 希望条件も設定されていない場合は、全件表示する

MVPでは高度なレコメンド機能は作成せず、シンプルな条件一致数で並び替えます。

---

### レスポンス項目

| 項目                       | 型             | 内容            |
| ------------------------ | ------------- | ------------- |
| `id`                     | number        | 園ID           |
| `name`                   | string        | 園名            |
| `area`                   | string        | エリア・市区町村      |
| `address`                | string        | 住所            |
| `phoneNumber`            | string | null | 電話番号          |
| `imageUrl`               | string | null | 園画像URL        |
| `schoolType`             | string        | 園種別           |
| `lifeBurdenLevel`        | string        | 生活負担          |
| `timeBurdenLevel`        | string        | 時間負担          |
| `mealType`               | string        | 給食・弁当         |
| `itemBurdenLevel`        | string        | 持ち物負担         |
| `diaperSupport`          | string | null | おむつ対応         |
| `futonSupport`           | string | null | 布団対応          |
| `extendedCareTime`       | string | null | 延長保育利用時間      |
| `extendedCareUsage`      | string        | 延長保育利用者の目安    |
| `weekdayEventsLevel`     | string        | 平日行事の多さ       |
| `parentAssociationLevel` | string        | 保護者会の負担       |
| `tags`                   | string[]      | 特徴タグ          |
| `isFavorited`            | boolean       | お気に入り登録済みかどうか |

---

### リクエスト例

```http
GET /api/v1/schools?keyword=さくら&mealType=school_lunch&sort=recommended
```

---

### レスポンス例

```json
{
  "data": [
    {
      "id": 1,
      "name": "さくら保育園",
      "area": "渋谷区",
      "address": "東京都渋谷区さくら1-1-1",
      "phoneNumber": "03-0000-0000",
      "imageUrl": "/images/schools/sakura.jpg",
      "schoolType": "nursery",
      "lifeBurdenLevel": "low",
      "timeBurdenLevel": "low",
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental",
      "extendedCareTime": "18:00〜20:00",
      "extendedCareUsage": "5人程度",
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low",
      "tags": ["保育園", "毎日給食", "おむつ園処理"],
      "isFavorited": false
    }
  ],
  "meta": {
    "total": 1
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

| パラメータ | 型      | 内容  |
| ----- | ------ | --- |
| `id`  | number | 園ID |

---

### リクエスト例

```http
GET /api/v1/schools/1
```

---

### レスポンス例：未登録・一般ユーザー

```json
{
  "data": {
    "id": 1,
    "name": "さくら保育園",
    "area": "渋谷区",
    "address": "東京都渋谷区さくら1-1-1",
    "phoneNumber": "03-0000-0000",
    "imageUrl": "/images/schools/sakura.jpg",
    "schoolType": "nursery",
    "description": "駅から近く、延長保育の利用者が多い園です。",
    "lifeBurden": {
      "lifeBurdenLevel": "low",
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental"
    },
    "timeBurden": {
      "timeBurdenLevel": "low",
      "extendedCareTime": "18:00〜20:00",
      "extendedCareUsage": "5人程度",
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low"
    },
    "supportInfo": {
      "isLocked": true,
      "message": "プレミアムユーザーに登録すれば閲覧可能です",
      "items": [
        "連絡帳",
        "欠席連絡方法",
        "園内習い事",
        "アレルギー対応"
      ]
    },
    "isFavorited": false
  }
}
```

---

### レスポンス例：プレミアムユーザー

```json
{
  "data": {
    "id": 1,
    "name": "さくら保育園",
    "area": "渋谷区",
    "address": "東京都渋谷区さくら1-1-1",
    "phoneNumber": "03-0000-0000",
    "imageUrl": "/images/schools/sakura.jpg",
    "schoolType": "nursery",
    "description": "駅から近く、延長保育の利用者が多い園です。",
    "lifeBurden": {
      "lifeBurdenLevel": "low",
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental"
    },
    "timeBurden": {
      "timeBurdenLevel": "low",
      "extendedCareTime": "18:00〜20:00",
      "extendedCareUsage": "5人程度",
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low"
    },
    "supportInfo": {
      "isLocked": false,
      "contactBookType": "app",
      "absenceContactMethod": "app",
      "lessons": "体操教室あり",
      "allergySupport": "完全除去＋園で代替食"
    },
    "isFavorited": true
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

| パラメータ | 型      | 必須 | 内容         |
| ----- | ------ | -- | ---------- |
| `ids` | string | 必須 | カンマ区切りの園ID |

---

### 制限

| ユーザー区分    | 比較可能数 |
| --------- | ----- |
| 一般ユーザー    | 2園まで  |
| プレミアムユーザー | 3園まで  |

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
        "id": 1,
        "name": "さくら保育園",
        "lifeBurden": {
          "mealType": "school_lunch",
          "itemBurdenLevel": "low",
          "diaperSupport": "disposed_by_school",
          "futonSupport": "rental"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜20:00",
          "extendedCareUsage": "5人程度",
          "weekdayEventsLevel": "low",
          "parentAssociationLevel": "low"
        }
      },
      {
        "id": 2,
        "name": "みらいこども園",
        "lifeBurden": {
          "mealType": "mixed",
          "itemBurdenLevel": "middle",
          "diaperSupport": "take_home",
          "futonSupport": "take_home_weekly"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜19:00",
          "extendedCareUsage": "3人程度",
          "weekdayEventsLevel": "middle",
          "parentAssociationLevel": "middle"
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
        "id": 1,
        "name": "さくら保育園",
        "lifeBurden": {
          "mealType": "school_lunch",
          "itemBurdenLevel": "low",
          "diaperSupport": "disposed_by_school",
          "futonSupport": "rental"
        },
        "timeBurden": {
          "extendedCareTime": "18:00〜20:00",
          "extendedCareUsage": "5人程度",
          "weekdayEventsLevel": "low",
          "parentAssociationLevel": "low"
        }
      }
    ],
    "matchHighlights": {
      "1": {
        "mealType": true,
        "itemBurdenLevel": true,
        "diaperSupport": true,
        "futonSupport": false,
        "extendedCare": true,
        "weekdayEventsLevel": true,
        "parentAssociationLevel": false
      }
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

---

### メソッド・URL

```http
GET /api/v1/users/me
```

---

### 認証

必須。

---

### レスポンス例：一般ユーザー

```json
{
  "data": {
    "id": "d7f5b8a2-1111-4444-8888-123456789abc",
    "email": "user@example.com",
    "name": "佐藤 恵",
    "avatarUrl": null,
    "postalCode": "1500001",
    "address": "東京都渋谷区",
    "planType": "free",
    "isPremium": false,
    "favoriteCount": 3,
    "favoriteLimit": 5,
    "preferences": {
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental",
      "extendedCare": true,
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low"
    }
  }
}
```

---

### レスポンス例：プレミアムユーザー

```json
{
  "data": {
    "id": "d7f5b8a2-1111-4444-8888-123456789abc",
    "email": "user@example.com",
    "name": "佐藤 恵",
    "avatarUrl": null,
    "postalCode": "1500001",
    "address": "東京都渋谷区",
    "planType": "premium",
    "isPremium": true,
    "favoriteCount": 12,
    "favoriteLimit": null,
    "preferences": {
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental",
      "extendedCare": true,
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low"
    },
    "subscription": {
      "status": "active",
      "currentPeriodEnd": "2026-07-31T23:59:59.000Z"
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

## 9-2. ログインユーザー情報更新

### 概要

プロフィール編集画面で、ユーザー情報・希望条件を更新します。

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
  "name": "佐藤 恵",
  "postalCode": "1500001",
  "address": "東京都渋谷区",
  "preferences": {
    "mealType": "school_lunch",
    "itemBurdenLevel": "low",
    "diaperSupport": "disposed_by_school",
    "futonSupport": "rental",
    "extendedCare": true,
    "weekdayEventsLevel": "low",
    "parentAssociationLevel": "low"
  }
}
```

---

### バリデーション

| 項目                                   | 条件               |
| ------------------------------------ | ---------------- |
| `name`                               | 必須               |
| `postalCode`                         | 任意。指定する場合は半角数字7桁 |
| `address`                            | 任意               |
| `preferences`                        | 任意               |
| `preferences.mealType`               | 任意。定義済みの値のみ      |
| `preferences.itemBurdenLevel`        | 任意。定義済みの値のみ      |
| `preferences.diaperSupport`          | 任意。定義済みの値のみ      |
| `preferences.futonSupport`           | 任意。定義済みの値のみ      |
| `preferences.extendedCare`           | 任意。boolean       |
| `preferences.weekdayEventsLevel`     | 任意。定義済みの値のみ      |
| `preferences.parentAssociationLevel` | 任意。定義済みの値のみ      |

---

### レスポンス例

```json
{
  "data": {
    "id": "d7f5b8a2-1111-4444-8888-123456789abc",
    "email": "user@example.com",
    "name": "佐藤 恵",
    "avatarUrl": null,
    "postalCode": "1500001",
    "address": "東京都渋谷区",
    "planType": "free",
    "isPremium": false,
    "preferences": {
      "mealType": "school_lunch",
      "itemBurdenLevel": "low",
      "diaperSupport": "disposed_by_school",
      "futonSupport": "rental",
      "extendedCare": true,
      "weekdayEventsLevel": "low",
      "parentAssociationLevel": "low"
    }
  }
}
```

---

### エラー例

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "郵便番号は半角数字7桁で入力してください"
  }
}
```

---

# 10. お気に入りAPI

## 10-1. お気に入り一覧取得

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
      "id": 1,
      "school": {
        "id": 1,
        "name": "さくら保育園",
        "area": "渋谷区",
        "address": "東京都渋谷区さくら1-1-1",
        "phoneNumber": "03-0000-0000",
        "imageUrl": "/images/schools/sakura.jpg",
        "schoolType": "nursery",
        "tags": ["保育園", "毎日給食"]
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
      "id": 1,
      "school": {
        "id": 1,
        "name": "さくら保育園",
        "area": "渋谷区",
        "address": "東京都渋谷区さくら1-1-1",
        "phoneNumber": "03-0000-0000",
        "imageUrl": "/images/schools/sakura.jpg",
        "schoolType": "nursery",
        "tags": ["保育園", "毎日給食"]
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

## 10-2. お気に入り登録

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

| ユーザー区分    | 制限   |
| --------- | ---- |
| 一般ユーザー    | 5件まで |
| プレミアムユーザー | 無制限  |

---

### レスポンス例

```json
{
  "data": {
    "id": 1,
    "schoolId": 1,
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

## 10-3. お気に入り解除

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

| パラメータ      | 型      | 内容  |
| ---------- | ------ | --- |
| `schoolId` | number | 園ID |

---

### レスポンス例

```json
{
  "data": {
    "schoolId": 1,
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

# 11. 決済API

## 11-1. Stripe Checkout Session作成

### 概要

一般ユーザーがプレミアムプランへ登録するための Stripe Checkout Session を作成します。

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

| ユーザー区分    | 利用可否 |
| --------- | ---- |
| 未登録ユーザー   | 不可   |
| 一般ユーザー    | 可    |
| プレミアムユーザー | 不可   |

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

## 11-2. Stripe Customer Portal URL作成

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

| ユーザー区分    | 利用可否 |
| --------- | ---- |
| 未登録ユーザー   | 不可   |
| 一般ユーザー    | 不可   |
| プレミアムユーザー | 可    |

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

## 11-3. Stripe Webhook受信

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

| イベント                            | 処理                    |
| ------------------------------- | --------------------- |
| `checkout.session.completed`    | プレミアム登録               |
| `customer.subscription.updated` | subscription status更新 |
| `customer.subscription.deleted` | プレミアム停止               |
| `invoice.payment_succeeded`     | プレミアム継続               |
| `invoice.payment_failed`        | プレミアム停止または要確認状態に更新    |

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

# 12. Enum定義

DB設計書に合わせて、APIでも以下の値を基本とします。

## 12-1. planType

| 値         | 内容        |
| --------- | --------- |
| `free`    | 一般ユーザー    |
| `premium` | プレミアムユーザー |

---

## 12-2. subscriptionStatus

| 値          | 内容    |
| ---------- | ----- |
| `active`   | 有効    |
| `canceled` | 解約済み  |
| `past_due` | 支払い遅延 |

---

## 12-3. schoolType

| 値                            | 内容     |
| ---------------------------- | ------ |
| `nursery`                    | 保育園    |
| `certified_childcare_center` | 認定こども園 |
| `small_scale_nursery`        | 小規模保育  |

---

## 12-4. burdenLevel

| 値        | 内容  |
| -------- | --- |
| `low`    | 少ない |
| `middle` | 普通  |
| `high`   | 多い  |

---

## 12-5. mealType

| 値                    | 内容      |
| -------------------- | ------- |
| `school_lunch`       | 給食のみ    |
| `lunch_box_required` | 弁当あり    |
| `mixed`              | 給食・弁当併用 |

---

## 12-6. diaperSupport

| 値                    | 内容     |
| -------------------- | ------ |
| `disposed_by_school` | 園で処理   |
| `take_home`          | 持ち帰り   |
| `subscription`       | サブスク対応 |

---

## 12-7. futonSupport

| 値                   | 内容     |
| ------------------- | ------ |
| `rental`            | レンタルあり |
| `take_home_weekly`  | 毎週持ち帰り |
| `managed_by_school` | 園で管理   |

---

## 12-8. contactBookType

| 値       | 内容  |
| ------- | --- |
| `app`   | アプリ |
| `paper` | 手書き |
| `both`  | 併用  |

---

## 12-9. absenceContactMethod

| 値       | 内容     |
| ------- | ------ |
| `app`   | アプリ    |
| `phone` | 電話     |
| `both`  | アプリ・電話 |

---

# 13. バリデーション方針

## 13-1. 共通

* 必須項目が未入力の場合は `VALIDATION_ERROR`
* ID形式が不正な場合は `VALIDATION_ERROR`
* `schools.id` は number として扱う
* `users.id` は uuid として扱う
* 対象データが存在しない場合は `NOT_FOUND`
* 権限がない場合は `FORBIDDEN`
* 未ログインの場合は `UNAUTHORIZED`

---

## 13-2. 園一覧・検索

* `keyword` は任意
* `area` は任意
* `limit` は任意。指定する場合は正の整数
* `offset` は任意。指定する場合は0以上の整数
* Enum系の検索条件は定義済みの値のみ許可
* boolean系の検索条件は `true` / `false` のみ許可
* 不正な検索条件は `VALIDATION_ERROR`

---

## 13-3. 園詳細

* `id` は必須
* `id` は number
* 存在しない園IDの場合は `NOT_FOUND`

---

## 13-4. お気に入り登録

* `schoolId` は必須
* `schoolId` は number
* 存在しない園IDは登録不可
* 同一ユーザー・同一園の重複登録は不可
* 一般ユーザーは5件を超えて登録不可
* プレミアムユーザーは件数制限なし

---

## 13-5. 比較

* `ids` は必須
* `ids` はカンマ区切りの number として扱う
* 重複した園IDが含まれる場合はエラー
* 存在しない園IDが含まれる場合はエラー
* 一般ユーザーは2件まで
* プレミアムユーザーは3件まで

---

## 13-6. プロフィール更新

* `name` は必須
* `postalCode` は任意
* `postalCode` を指定する場合は半角数字7桁
* `address` は任意
* `preferences` は任意
* 希望条件の値は定義済みEnumのみ許可

---

# 14. MVP対象外API

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
* 請求履歴取得API
* 独自のプラン変更API

---

# 15. DB設計書との対応表

## 15-1. users

| DBカラム                          | API項目                                |
| ------------------------------ | ------------------------------------ |
| `id`                           | `id`                                 |
| `email`                        | `email`                              |
| `name`                         | `name`                               |
| `avatar_url`                   | `avatarUrl`                          |
| `postal_code`                  | `postalCode`                         |
| `address`                      | `address`                            |
| `plan_type`                    | `planType`                           |
| `preferred_meal_type`          | `preferences.mealType`               |
| `preferred_item_burden`        | `preferences.itemBurdenLevel`        |
| `preferred_diaper_support`     | `preferences.diaperSupport`          |
| `preferred_futon_support`      | `preferences.futonSupport`           |
| `preferred_extended_care`      | `preferences.extendedCare`           |
| `preferred_weekday_events`     | `preferences.weekdayEventsLevel`     |
| `preferred_parent_association` | `preferences.parentAssociationLevel` |
| `created_at`                   | `createdAt`                          |
| `updated_at`                   | `updatedAt`                          |

---

## 15-2. schools

| DBカラム                      | API項目                              |
| -------------------------- | ---------------------------------- |
| `id`                       | `id`                               |
| `name`                     | `name`                             |
| `area`                     | `area`                             |
| `address`                  | `address`                          |
| `phone_number`             | `phoneNumber`                      |
| `image_url`                | `imageUrl`                         |
| `school_type`              | `schoolType`                       |
| `life_burden_level`        | `lifeBurdenLevel`                  |
| `time_burden_level`        | `timeBurdenLevel`                  |
| `meal_type`                | `mealType`                         |
| `item_burden_level`        | `itemBurdenLevel`                  |
| `diaper_support`           | `diaperSupport`                    |
| `futon_support`            | `futonSupport`                     |
| `extended_care_time`       | `extendedCareTime`                 |
| `extended_care_usage`      | `extendedCareUsage`                |
| `weekday_events_level`     | `weekdayEventsLevel`               |
| `parent_association_level` | `parentAssociationLevel`           |
| `contact_book_type`        | `supportInfo.contactBookType`      |
| `absence_contact_method`   | `supportInfo.absenceContactMethod` |
| `lessons`                  | `supportInfo.lessons`              |
| `allergy_support`          | `supportInfo.allergySupport`       |
| `description`              | `description`                      |
| `created_at`               | `createdAt`                        |
| `updated_at`               | `updatedAt`                        |

---

## 15-3. favorites

| DBカラム        | API項目       |
| ------------ | ----------- |
| `id`         | `id`        |
| `user_id`    | 内部利用        |
| `school_id`  | `schoolId`  |
| `created_at` | `createdAt` |

---

## 15-4. subscriptions

| DBカラム                    | API項目                           |
| ------------------------ | ------------------------------- |
| `id`                     | 内部利用                            |
| `user_id`                | 内部利用                            |
| `stripe_customer_id`     | 内部利用                            |
| `stripe_subscription_id` | 内部利用                            |
| `status`                 | `subscription.status`           |
| `current_period_end`     | `subscription.currentPeriodEnd` |
| `created_at`             | `createdAt`                     |
| `updated_at`             | `updatedAt`                     |

---

# 16. 実装時の補足

## 16-1. 比較機能について

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

DB設計書に `compare_lists` テーブルが存在する場合でも、MVPのAPI設計では比較リスト保存APIは作成しません。

`compare_lists` を残す場合は、後続機能用または将来拡張用として扱います。

---

## 16-2. サポート情報について

サポート情報は、プレミアム限定情報として扱います。

対象項目：

* 連絡帳
* 欠席連絡方法
* 園内習い事
* アレルギー対応

未登録ユーザー・一般ユーザーには、項目名とロック表示用の情報のみ返します。
プレミアムユーザーには、実際の内容を返します。

---

## 16-3. おすすめ表示について

ホーム画面のおすすめ表示では、以下を考慮します。

* ユーザー住所と同じエリアの園を優先
* 希望条件が設定されている場合は一致度順
* エリア該当がない場合は希望条件のみで並び替え
* 希望条件も未設定の場合は全件表示

MVPでは高度なレコメンド機能は作成せず、シンプルな条件一致数で並び替える想定です。

---

## 16-4. プレミアム判定について

プレミアム判定は、`subscriptions.status = active` をもとに行います。

バックエンド側で必ず判定し、フロントエンド側の表示制御だけに依存しないようにします。

---

## 16-5. 園画像について

`schools.image_url` を利用して園画像を表示します。

MVPでは、seedデータに画像URLを登録するか、固定画像URLを登録する想定です。

---

# 17. 今後の確認事項

* DB設計書の `compare_lists` をMVPで本当に保持するか
* `compare_lists` を保持する場合、APIは作成しない方針でよいか
* `schoolType`、`mealType`、`diaperSupport`、`futonSupport` などを Prisma Enum にするか、文字列管理にするか
* `contactBookType`、`absenceContactMethod` もEnum化するか
* `tags` をDBに持たず、API側で生成する方針でよいか
* RedisキャッシュをMVPで実装するか、設計のみとするか
* Stripe Webhook後に `users.plan_type` を同期するか
* 園画像をURLで持つか、MVPでは固定画像にするか
