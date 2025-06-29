# Training Record App

個人利用のトレーニング記録アプリです。スマートフォンからの利用を重視し、シンプルで使いやすいUIを提供します。

## 主な機能

- **トレーニング記録**: メニューごとに日付、ウエイト、回数、時間、コメントを記録
- **前回記録の表示**: 記録時に前回のデータを表示してウエイトや回数の調整を支援
- **トレーニングメニュー管理**: メニュー名、概要、実施予定曜日を登録・管理
- **実施予定表示**: 曜日でフィルタして今日実施するトレーニング一覧を表示
- **PWA対応**: オフラインでも利用可能なプログレッシブWebアプリ

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + D1 Database
- **Hosting**: Cloudflare Pages
- **Testing**: Vitest + React Testing Library + Playwright

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Wrangler CLI (`npm install -g wrangler`)

### クイックスタート

```bash
# リポジトリをクローン
git clone <repository-url>
cd トレーニングアプリ

# 依存関係をインストール
npm install

# 開発環境セットアップ（自動）
npm run dev:setup

# 開発サーバーを起動
npm run dev
```

### 手動セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local

# D1データベースを作成
npx wrangler d1 create training-app-db

# wrangler.tomlにデータベースIDを設定

# マイグレーションを実行
npm run db:migrate

# 開発サーバーを起動
npm run dev
```

### API付きで開発

```bash
# フロントエンド（ターミナル1）
npm run dev

# バックエンドAPI（ターミナル2）
npm run dev:workers

# .env.localでAPI使用を有効化
echo "VITE_USE_API=true" >> .env.local
```

## 開発

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアプリケーションにアクセスできます。

### テスト実行

```bash
# 単体テスト
npm run test

# テストをウォッチモードで実行
npm run test:watch

# E2Eテスト
npm run test:e2e

# カバレッジレポート生成
npm run test:coverage
```

### コード品質チェック

```bash
# ESLint実行
npm run lint

# 自動修正
npm run lint:fix

# コードフォーマット
npm run format

# 型チェック
npm run typecheck
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## デプロイ

### Cloudflare Pages（静的サイト）

```bash
# フロントエンドをビルド＆デプロイ
npm run deploy
```

### Cloudflare Workers（API）

```bash
# バックエンドAPIをデプロイ
npm run deploy:functions
```

### 本番環境の設定

1. Cloudflare Pagesでプロジェクトを作成
2. 環境変数を設定:
   - `VITE_USE_API=true`
   - `VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev`
3. D1データベースを本番環境にも作成
4. wrangler.tomlの`[env.production]`セクションを設定

## 使用方法

### 1. トレーニングメニューの作成

1. 「メニュー管理」から新しいメニューを作成
2. メニュー名、説明、実施予定曜日を設定

### 2. トレーニング記録

1. ホーム画面で今日の予定を確認
2. 実施するメニューを選択
3. 前回記録を参考に、各セットのウエイト・回数を入力
4. 必要に応じてコメントを追加

### 3. 記録の確認

- 記録一覧から過去のトレーニング履歴を確認
- カレンダービューで月間の実施状況を把握

## 開発指針

このプロジェクトは**TDD（テスト駆動開発）**で開発されています：

1. **Red**: まず失敗するテストを書く
2. **Green**: テストが通る最小限のコードを書く  
3. **Refactor**: テストを通したままコードを改善

詳細な開発ガイドラインは [CLAUDE.md](./CLAUDE.md) を参照してください。

## ライセンス

個人利用のプロジェクトです。

## 貢献

個人開発プロジェクトのため、外部からの貢献は受け付けていません。