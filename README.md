# TaskFlow — Trello風タスク管理アプリ

カンバンボード形式でタスクを視覚的に管理できるWebアプリ。カード（タスク）をドラッグ＆ドロップでカラム間を移動でき、ユーザーごとにデータを管理できる。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| ドラッグ&ドロップ | dnd-kit |
| 認証・DB | Supabase (PostgreSQL + Auth) |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成し、Supabaseプロジェクトの値を設定:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. 開発サーバーの起動

```bash
npm run dev   # http://localhost:3000
```

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # Lint チェック
```

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義書](docs/requirements.md) | 機能要件・非機能要件・ユースケース |
| [画面設計書](docs/screen-design.md) | ワイヤーフレーム・画面遷移図 |
| [DB設計書](docs/database-design.md) | ER図・テーブル定義 |

## ディレクトリ構成

```
src/
├── app/              # Next.js App Router のページ
│   ├── login/        # ログイン・サインアップ画面
│   └── board/        # カンバンボード画面
├── components/       # UIコンポーネント
├── lib/              # Supabaseクライアントなどユーティリティ
└── types/            # TypeScript 型定義
docs/
├── requirements.md      # 要件定義書
├── screen-design.md     # 画面設計書
└── database-design.md   # DB設計書
```

## 開発フェーズ

| フェーズ | 内容 | 主な成果物 |
|----------|------|------------|
| Phase 1 | プロジェクトセットアップ | Next.js初期化、Supabase接続設定 |
| Phase 2 | ユーザー認証 | ログイン・サインアップ画面、認証ルーティング |
| Phase 3 | カンバンUI | カラム・カードの表示・追加・削除 |
| Phase 4 | Supabase連携 | データの取得・保存・リアルタイム更新 |
| Phase 5 | ドラッグ＆ドロップ | dnd-kitを使ったカード移動機能 |
| Phase 6 | スタイリング・レスポンシブ | モバイル対応、UI仕上げ |
| Phase 7 | テスト・デプロイ | 動作確認、Vercelへのデプロイ |
