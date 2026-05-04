# TaskManagement — Claude Code コンテキスト

## プロジェクト概要

Trello風のカンバンボード型タスク管理Webアプリ。
カード（タスク）をドラッグ＆ドロップでカラム間を移動でき、ユーザーごとにデータを管理できる。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| ドラッグ&ドロップ | dnd-kit |
| 認証・DB | Supabase (PostgreSQL + Auth) |

## ドキュメント

- [要件定義書](docs/requirements.md) — 機能要件・画面設計・データ設計

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # Lint チェック
```

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
├── requirements.md   # 要件定義書
```

## 環境変数

`.env.local` に以下を設定（Supabaseプロジェクトから取得）:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
