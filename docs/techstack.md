# 技術スタック — Trello風タスク管理アプリ

**バージョン**: 1.0  
**作成日**: 2026-05-04

---

## 1. 全体アーキテクチャ

フロントエンドとバックエンドを分離した **SPA + REST API** 構成。

```
┌─────────────────────┐        REST API (JSON)       ┌──────────────────────┐
│  Frontend           │ ─────────────────────────▶  │  Backend             │
│  React + TypeScript │ ◀─────────────────────────  │  Spring Boot (Java)  │
│  :5173 (dev)        │     JWT 認証ヘッダー付き       │  :8080               │
└─────────────────────┘                              └──────────┬───────────┘
                                                                │
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │  Database            │
                                                     │  PostgreSQL          │
                                                     └──────────────────────┘
```

---

## 2. バックエンド

| カテゴリ | 技術 | バージョン | 採用理由 |
|----------|------|-----------|----------|
| フレームワーク | Spring Boot | 3.x | Java製 Web フレームワークのデファクトスタンダード。自動設定で素早く起動できる |
| 言語 | Java | 17 (LTS) | 型安全・エコシステムが豊富。LTS版で長期サポートが受けられる |
| ビルドツール | Gradle | 8.x | 柔軟な依存管理。Maven より記述量が少なく、ビルドも高速 |
| API スタイル | REST API | — | シンプルな HTTP + JSON 通信。フロントエンドとの疎結合を維持できる |
| API ドキュメント | OpenAPI 3.0 (Swagger UI) | — | SpringDoc により Swagger UI を自動生成。API 仕様をブラウザで確認・試験できる |
| 認証 | Spring Security + JWT | — | ステートレスなトークン認証。スケールアウトしやすい |
| ORM | Spring Data JPA (Hibernate) | — | SQL を直接書かずにDBアクセスを簡素化できる |
| DB マイグレーション | Flyway | — | SQL ファイルでスキーマのバージョン管理ができる |

---

## 3. フロントエンド

| カテゴリ | 技術 | バージョン | 採用理由 |
|----------|------|-----------|----------|
| UI ライブラリ | React | 18.x | コンポーネントベースの UI 構築。エコシステムが最大規模 |
| 言語 | TypeScript | 5.x | 型安全にコードを書けるため、バグを早期発見できる |
| スタイリング | Tailwind CSS | 3.x | クラス名で UI を素早く組める。カスタマイズ性が高い |
| ドラッグ＆ドロップ | dnd-kit | — | モダンで使いやすい D&D ライブラリ。アクセシビリティ対応済み |
| ビルドツール | Vite | 5.x | 開発サーバーの起動・HMR が高速 |
| HTTP クライアント | Axios | — | REST API との通信。インターセプターで JWT ヘッダーを自動付与できる |

---

## 4. データベース

| カテゴリ | 技術 | 採用理由 |
|----------|------|----------|
| RDBMS | PostgreSQL | 実績・機能ともに充実した OSS DB。JSON 型など拡張機能も豊富 |

---

## 5. 開発環境・ツール

| カテゴリ | 技術 |
|----------|------|
| コンテナ | Docker / Docker Compose（PostgreSQL のローカル起動用） |
| API 確認 | Swagger UI (`http://localhost:8080/swagger-ui.html`) |

---

## 6. ディレクトリ構成

```
TaskManagement/
├── backend/                          # Spring Boot プロジェクト
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/taskflow/
│   │   │   │   ├── controller/       # REST API エンドポイント (@RestController)
│   │   │   │   ├── service/          # ビジネスロジック
│   │   │   │   ├── repository/       # DB アクセス (Spring Data JPA)
│   │   │   │   ├── entity/           # JPA エンティティ
│   │   │   │   ├── dto/              # Request / Response DTO
│   │   │   │   └── config/           # SecurityConfig・CorsConfig
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/     # Flyway マイグレーション SQL
│   │   └── test/
│   └── build.gradle
│
├── frontend/                         # React プロジェクト
│   ├── src/
│   │   ├── components/               # UI コンポーネント
│   │   ├── pages/                    # ページ (Login, Board)
│   │   ├── hooks/                    # カスタムフック
│   │   ├── api/                      # Axios クライアント・API 関数
│   │   └── types/                    # TypeScript 型定義
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                             # 設計ドキュメント
└── prototype/                        # HTML プロトタイプ
```

---

## 7. 主要 API エンドポイント（予定）

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/auth/signup` | サインアップ |
| POST | `/api/auth/login` | ログイン（JWT 発行） |
| GET | `/api/columns` | カラム一覧取得 |
| POST | `/api/columns` | カラム追加 |
| PATCH | `/api/columns/{id}` | カラム名変更 |
| DELETE | `/api/columns/{id}` | カラム削除 |
| GET | `/api/columns/{id}/cards` | カード一覧取得 |
| POST | `/api/columns/{id}/cards` | カード追加 |
| PATCH | `/api/cards/{id}` | カード更新（タイトル・期限・タグ） |
| DELETE | `/api/cards/{id}` | カード削除 |
| PATCH | `/api/cards/{id}/move` | カードをカラム間移動 |

---

## 8. 環境変数

**バックエンド** (`backend/src/main/resources/application.yml`):

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/taskflow}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: 86400000   # 24時間
```

**フロントエンド** (`frontend/.env.local`):

```
VITE_API_BASE_URL=http://localhost:8080/api
```
