<?php

// scheduleテーブルに対応するモデルクラス
// このクラスは、FuelPHPのORM機能を使って、データベースの `schedules` テーブルと
// やり取りするための設計図（モデル）です。
class Model_Schedule extends \Orm\Model
{
	/**
	 * @var array $_properties
	 * このモデルが扱うデータベースの**カラム（列）**を定義します。
	 * ここで定義されたプロパティが、テーブルの各カラムに対応します。
	 * * id:            // スケジュールのユニークな識別子（主キー）
	 * user_id:       // スケジュールを作成したユーザーのID（外部キー）
	 * category_id:   // スケジュールのカテゴリーID（外部キー）
	 * title:         // スケジュールのタイトル
	 * date:          // スケジュールの日付
	 * start_time:    // スケジュールの開始時間
	 * end_time:      // スケジュールの終了時間
	 * color:         // スケジュールの表示色
	 * note:          // スケジュールの詳細なメモ
	 * created_at:    // レコードが作成された日時
	 * updated_at:    // レコードが最後に更新された日時
	 */
	protected static $_properties = array(
		'id',
		'user_id',
		'category_id',
		'title',
		'date',
		'start_time',
		'end_time',
		'color',
		'note',
		'created_at',
		'updated_at',
	);

	/**
	 * @var array $_belongs_to
	 * 他のモデルとの**リレーションシップ（関連付け）**を定義します。
	 * これにより、関連するテーブルのデータを簡単に取得できるようになります。
	 */
	protected static $_belongs_to = array(
		// Model_User(親)に属するModel_Schedule(子)の多対一のリレーションシップ
		// 1人のユーザーは複数のスケジュールを持つことができます。
    'user' => array(
			'key_from' => 'user_id',
			'model_to' => 'Model_User',
			'key_to' => 'id',
			'cascade_save' => true,
			'cascade_delete' => false,
		),

		// Model_category(親)に属するModel_Schedule(子)の多対一のリレーションシップ
		// 1つのカテゴリーは複数のスケジュールに属することができます。
		'category' => array(
			'key_from' => 'category_id',
			'model_to' => 'Model_Category',
			'key_to' => 'id',
			'cascade_save' => true,
			'cascade_delete' => false,
    ),
	);

	/**
	 * @var array $_observers
	 * データベース操作の前後に自動で実行される処理（**オブザーバー**）を定義します。
	 */
	protected static $_observers = array(
		// 新規レコード作成時、`created_at`カラムにタイムスタンプを自動設定するオブザーバー。
		'Orm\Observer_CreatedAt' => array(
			'events' => array('before_insert'),
			'mysql_timestamp' => true,
		),
		// レコードが更新されるたび、`updated_at`カラムにタイムスタンプを自動設定するオブザーバー。
		'Orm\Observer_UpdatedAt' => array(
			'events' => array('before_save'),
			'mysql_timestamp' => true,
		),
	);

	/**
	 * @var string $_table_name
	 * このモデルが対応するデータベースの**テーブル名**を指定します。
	 */
	protected static $_table_name = 'schedules';

}
