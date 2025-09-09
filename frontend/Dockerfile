# nodeの公式イメージを使用
FROM node:latest

# コンテナ内の作業ディレクトリを設定
WORKDIR /usr/src/app

# pnpm をグローバルに入れる
RUN npm install -g pnpm

# ホストのpackage.jsonとpnpm-lock.yamlをコンテナにコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install

# ローカルのソースコードをコンテナにコピー
COPY . .

# 開発サーバーのポートを公開
EXPOSE 5173

# 開発サーバーを起動
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
