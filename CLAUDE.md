# TaskManagement — Claude Code コンテキスト

## プロジェクト概要

Trello風のカンバンボード型タスク管理Webアプリ。
カード（タスク）をドラッグ＆ドロップでカラム間を移動でき、ユーザーごとにデータを管理できる。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| バックエンド | Spring Boot 4.0.x (Java 25) + Gradle |
| API | REST API + OpenAPI 3.0 (Swagger UI) |
| 認証 | Spring Security + JWT |
| フロントエンド | React 18 + TypeScript + Vite |
| スタイリング | Tailwind CSS |
| ドラッグ&ドロップ | dnd-kit |
| データベース | PostgreSQL |

→ 詳細は [技術スタック定義書](docs/techstack.md) を参照。

## ドキュメント

- [要件定義書](docs/requirements.md) — 機能要件・非機能要件・ユースケース
- [画面設計書](docs/screen-design.md) — ワイヤーフレーム・画面遷移図
- [DB設計書](docs/database-design.md) — ER図・テーブル定義
- [技術スタック定義書](docs/techstack.md) — アーキテクチャ・技術選定・API一覧

## よく使うコマンド

```bash
# バックエンド (backend/ ディレクトリで実行)
./gradlew bootRun    # 開発サーバー起動 (http://localhost:8080)
./gradlew build      # ビルド
./gradlew test       # テスト実行

# フロントエンド (frontend/ ディレクトリで実行)
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # 本番ビルド
npm run lint         # Lint チェック
```

## ディレクトリ構成

```
TaskManagement/
├── backend/
│   ├── src/main/java/com/example/taskflow/
│   │   ├── controller/   # REST API エンドポイント
│   │   ├── service/      # ビジネスロジック
│   │   ├── repository/   # DB アクセス (JPA)
│   │   ├── entity/       # JPA エンティティ
│   │   ├── dto/          # Request / Response DTO
│   │   └── config/       # Security・CORS 設定
│   └── build.gradle
├── frontend/
│   └── src/
│       ├── components/   # UI コンポーネント
│       ├── pages/        # ページ (Login, Board)
│       ├── hooks/        # カスタムフック
│       ├── api/          # Axios クライアント
│       └── types/        # TypeScript 型定義
├── docs/
│   ├── requirements.md
│   ├── screen-design.md
│   ├── database-design.md
│   └── techstack.md
└── prototype/            # HTML プロトタイプ
```

## 環境変数

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
```

**フロントエンド** (`frontend/.env.local`):

```
VITE_API_BASE_URL=http://localhost:8080/api
```
