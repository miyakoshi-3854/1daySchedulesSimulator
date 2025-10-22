# 1 日スケジュールシミュレーター

## ユーザーが日々の生活や予定を視覚的に把握し、直感的に操作できる円グラフで時間配分をシュミレーションするアプリ。

- 目的: 生活の時間配分を可視化・シュミレーションすることで、効率的な時間管理や生活改善をサポート。

- ターゲットユーザー: 学生・社会人・フリーランスなど、時間管理や生活リズムに関心がある人。

---

## セットアップ方法

- リポジトリをクローン

```
git clone git@github.com:miyakoshi-3854/1daySchedulesSimulator.git
```

- Docker image 作成

```
docker compose up --build
```

- Docker コンテナに入る

```
docker container exec -it fuelphp-app bash
```

- oil を起動

```
php oil console
```

- マイグレーション実行

```
php oil refine migrate
```

- テンプレートカテゴリーの挿入

```
$categories_data = [
  [
    'name' => '睡眠',
    'default_title' => '睡眠時間',
    'default_start' => '00:00:00',
    'default_end' => '07:00:00',
    'default_note' => '体力回復',
    'default_color' => '#FF0000'
  ],
  [
    'name' => '朝食',
    'default_title' => '朝食タイム',
    'default_start' => '07:00:00',
    'default_end' => '08:00:00',
    'default_note' => '栄養補給',
    'default_color' => '#00FF00'
  ],
  [
    'name' => '勉強',
    'default_title' => '集中学習',
    'default_start' => '08:00:00',
    'default_end' => '12:00:00',
    'default_note' => '課題と自習',
    'default_color' => '#0000FF'
  ],
  [
    'name' => '昼食',
    'default_title' => '昼食休憩',
    'default_start' => '12:00:00',
    'default_end' => '13:00:00',
    'default_note' => 'リフレッシュ',
    'default_color' => '#FFFF00'
  ],
  [
    'name' => 'アルバイト',
    'default_title' => '勤務時間',
    'default_start' => '13:00:00',
    'default_end' => '19:00:00',
    'default_note' => '収入獲得',
    'default_color' => '#FF00FF'
  ],
  [
    'name' => '夕食',
    'default_title' => '夕食タイム',
    'default_start' => '19:00:00',
    'default_end' => '20:00:00',
    'default_note' => '夕食準備と摂取',
    'default_color' => '#00FFFF'
  ],
  [
    'name' => '風呂',
    'default_title' => '入浴時間',
    'default_start' => '20:00:00',
    'default_end' => '21:00:00',
    'default_note' => 'リラックス',
    'default_color' => '#778899'
  ],
  [
    'name' => 'ゲーム',
    'default_title' => '自由時間',
    'default_start' => '21:00:00',
    'default_end' => '23:55:00',
    'default_note' => 'リラックスと趣味',
    'default_color' => '#008080'
  ],
];

foreach ($categories_data as $data) {
  Model_Category::forge($data)->save();
}

exit
```

- ローカルホストにアクセス

```
http://localhost:5173/
```

#### セットアップ完了！

---

### ユーザーガイド

#### ログイン / 新規登録

- 画面右上の`ログイン / 新規登録`ボタンをクリックして新規登録を選択

- ユーザー名入力（新規登録時のみ）

```
テストマン
```

- email 入力

```
testman@example.com
```

- password 入力

```
secretman
```

- ログイン / 登録ボタンをクリック

#### ログアウト

- ログインしている状態で画面右上の`ログアウト`ボタンをクリック

---

### スケジュールガイド

#### スケジュール追加

- 画面右側の予定一覧フォームから予定を追加をクリック

- 下にフォームが開く

- カテゴリーからテンプレートまたは`カテゴリーなし`を選択

- 予定名を入力

```
散歩
```

- 開始時間、終了時間をリストから選択

- 赤い丸をクリックし、カラーピッカーを表示、選択

- お好みで備考にメモを入力

```
家の近くをうろちょろ
```

- 追加ボタンをクリック

#### スケジュール更新

- 予定一覧から編集をクリック

- 下にフォームが開く

- お好みで変更

- 更新を完了をクリック

#### スケジュール削除

- 予定一覧から削除をクリック

- 再確認モーダルが開く

- 削除ボタンをクリック
