# Gallery セットアップ手順（Supabase）

招待状ページの Gallery に表示される写真は、Supabase（無料）に保存します。
管理ページ（`/private-h9k2p4m7/`）からアップロード・並べ替え・削除・キャプション編集ができ、変更は即座に Gallery に反映されます。

---

## 1. Supabase プロジェクトを作る

1. https://supabase.com にアクセスして無料アカウント登録
2. **New project** で新しいプロジェクトを作成
   - Name: `ysabelle-bd`（自由）
   - Region: 一番近いリージョン（例: `Northeast Asia (Tokyo)`）
3. Database password を控えておく（あとで使わない場合もOK）

プロジェクト作成後、左メニューから:
- **Project Settings → API** にアクセスし、以下の2つを控える:
  - `Project URL`（例: `https://abcdefghijk.supabase.co`）
  - `Project API keys → anon public`（長い文字列）

---

## 2. テーブルとストレージを作る

左メニュー **SQL Editor** を開き、`deploy/supabase-setup.sql` の中身を**全選択してコピー**し、エディタに貼り付けて **Run**。

> ⚠️ ``` のような Markdown コードフェンスは含めないこと。`.sql` ファイルの中身だけを貼り付けてください。

> セキュリティモデル: シークレットURL（`/private-h9k2p4m7/`）を知っている人だけが管理ページを開けます。anon key は静的サイトに含まれるので、URLが漏れたら誰でも書き込みできます。家族間で共有するだけにしてください。
> もしより強固にしたい場合は、後日 Edge Function + ベーシック認証 or Supabase Auth を追加可能です。

---

## 3. 設定ファイルに記入する

`deploy/gallery-config.js` を開き、`SUPABASE_URL` と `SUPABASE_ANON_KEY` を Supabase で確認した値に書き換えてください。

```js
window.GALLERY_CONFIG = {
  SUPABASE_URL: "https://abcdefghijk.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJI...（長い文字列）",
  BUCKET: "gallery",
  TABLE: "gallery_photos",
};
```

---

## 4. 動作確認

1. デプロイ後、`https://your-site/private-h9k2p4m7/` にアクセス
2. 写真をドロップ → アップロード成功すれば下にサムネが並ぶ
3. ドラッグで順番変更、キャプション入力、× で削除
4. `https://your-site/` の Gallery ボタンを開くと、同じ写真と順番が表示される

---

## シークレットパスを変えたい

`deploy/private-h9k2p4m7/` フォルダ名を任意に変更してください（例: `family-only-xyz789`）。
これでURLも変わります。フォルダ内のファイルは触らなくてOK。
