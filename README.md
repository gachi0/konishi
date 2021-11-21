# konishi
いろいろdiscordBot

## 機能
- スレッドの自動作成
- メッセージの自動削除
- 通話参加者に自動ロール付与
- 個人チャンネルの作成機能

その他いろいろ

## セットアップ&実行

### 必要なパッケージのインストール
```
npm i
```

### configファイルの設定
`config.json.sample` を `config.json` にリネーム  
tokenにはボットのtokenを設定  
clientidにはボットのclient idを設定  
サーバースコープでコマンドを登録する場合は、guildidを設定（任意）

### コマンドの登録
アプリケーションスコープで登録する場合
```
npm run cmdapp
```
サーバースコープで登録する場合
```
npm run cmdguild
```

### 実行！
```
npm start
```
