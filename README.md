
## 見方
1. このフォルダを開く
2. `index.html` をダブルクリック
3. トップページの「ページ一覧」カードやヘッダーから、各詳細ページへ移動できます。
4. 画面幅が狭い(スマホ・タブレット)場合は、ヘッダー右側のメニューボタン(三本線)からナビゲーションを開けます。

## フォルダ構成
```
sum_new_site_pages/
├── index.html            トップページ
├── overview.html         チーム概要
├── activity.html         活動内容
├── members.html          メンバー紹介
├── vehicle.html          車両紹介
├── sponsors.html         スポンサー紹介
├── recruit.html          新入部員募集
├── results.html          大会実績
├── contact.html          お問い合わせ
├── news.html             お知らせ一覧
├── news-admin.html       お知らせ管理(要パスワード、検索エンジン非公開)
├── blog.html             MONTHLY REPORT一覧
├── blog-admin.html       MONTHLY REPORT管理(要パスワード、検索エンジン非公開)
├── assets/
│   ├── css/styles.css    サイト共通スタイル
│   ├── js/main.js        共通スクリプト(アニメーション・ハンバーガーメニュー等)
│   ├── js/admin-shared.js  news-admin/blog-adminで共有するGitHub連携ロジック
│   └── images/           画像・アイコン
├── reports/               MONTHLY REPORTの添付ファイル置き場(投稿時に自動生成)
├── robots.txt
└── README.md
```

## 追加したページ
- `overview.html`：チーム概要
- `activity.html`：活動内容
- `members.html`：メンバー紹介
- `vehicle.html`：車両紹介
- `sponsors.html`：スポンサー紹介
- `recruit.html`：新入部員募集
- `results.html`：大会実績
- `contact.html`：お問い合わせ
- `news.html`：お知らせ
- `gallery.html`：ギャラリー

## お知らせ / MONTHLY REPORTの更新方法
`news-admin.html` / `blog-admin.html` はGitHubの個人アクセストークンを使って、`index.html` / `news.html` / `blog.html` を直接書き換えて投稿・削除できる簡易管理画面です。

内部的には、それぞれのページの決まった目印(`class="news-list reveal">` や `id="blogList">` など)を探してHTMLを挿入する仕組みのため、**該当ファイルのその部分の書き方を変更すると投稿・削除機能が動かなくなります。** 手を加える場合は `assets/js/admin-shared.js` と各admin htmlの挙動をあわせて確認してください。

## 注意
- 画像・ロゴ・SNSリンクの一部は仮のものが残っています。
- 電話番号・メンバー氏名など「仮」「氏名未定」と書かれている情報は、正式なものが決まり次第差し替えてください。
- お問い合わせページのフォーム(トップページの見た目だけのフォーム)は実際に送信するにはGoogleフォームや外部サービスとの接続が必要です。
- `news-admin.html` / `blog-admin.html` の簡易パスワードは誤操作防止のためのものです。実際のセキュリティ境界はGitHubの個人アクセストークン側にあるため、トークンは他人と共有しないでください。
