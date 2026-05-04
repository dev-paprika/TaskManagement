# DB設計書 — Trello風タスク管理アプリ

**バージョン**: 1.1  
**作成日**: 2026-04-29  
**更新日**: 2026-05-04

---

## 1. ER図（概念）

```
users
    │
    │ 1:N
    ▼
columns
    │
    │ 1:N
    ▼
cards
    │
    │ 1:N
    ▼
card_tags
```

---

## 2. テーブル定義

### `users` テーブル

| カラム名 | 型 | 説明 |
|----------|----|------|
| id | uuid (PK) | ユーザーの一意ID |
| email | text (UNIQUE NOT NULL) | メールアドレス（ログインID） |
| password_hash | text (NOT NULL) | bcrypt でハッシュ化されたパスワード |
| created_at | timestamptz | 作成日時 |

### `columns` テーブル

| カラム名 | 型 | 説明 |
|----------|----|------|
| id | uuid (PK) | カラムの一意ID |
| user_id | uuid (FK → users.id) | 所有ユーザーのID |
| name | text | カラム名（例: "Todo"） |
| position | int | 表示順（0始まり） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 最終更新日時 |

### `cards` テーブル

| カラム名 | 型 | 説明 |
|----------|----|------|
| id | uuid (PK) | カードの一意ID |
| column_id | uuid (FK → columns.id) | 所属するカラムのID |
| title | text | タスクのタイトル |
| due_date | date (nullable) | 期限日。未設定の場合は NULL |
| position | int | カラム内の表示順（0始まり） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 最終更新日時 |

### `card_tags` テーブル

| カラム名 | 型 | 説明 |
|----------|----|------|
| id | uuid (PK) | タグの一意ID |
| card_id | uuid (FK → cards.id) | 紐づくカードのID |
| name | text | タグ名（例: "バグ", "重要"） |
| color | text | タグの表示色（例: "#ef4444"）。省略可 |
| created_at | timestamptz | 作成日時 |

---

## 3. 制約・セキュリティ

**削除の連鎖:**
- `users` 削除時、紐づく `columns` は `ON DELETE CASCADE` で自動削除
- `columns` 削除時、紐づく `cards` は `ON DELETE CASCADE` で自動削除
- `cards` 削除時、紐づく `card_tags` も `ON DELETE CASCADE` で自動削除

**認可（Spring Security）:**
- 全 API エンドポイントは JWT による認証を必須とする
- バックエンドの Service 層で `user_id` を JWT から取得し、自分のデータのみ操作できることを検証する
- 他ユーザーのリソースへのアクセスは `403 Forbidden` を返す
