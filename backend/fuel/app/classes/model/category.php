<?php

// `categories` テーブルに対応するモデルクラス
// このクラスは、データベースの `categories` テーブルとやり取りするためのモデル（設計図）です。
class Model_Category extends \Orm\Model
{
	/**
	 * @var array $_properties
	 * このモデルが扱うデータベースの**カラム（列）**を定義します。
	 * ここで定義されたプロパティが、テーブルの各カラムに対応します。
	 */
	protected static $_properties = array(
		'id',
		'name',
		'default_title',
		'default_start',
		'default_end',
		'default_note',
		'default_color',
		'created_at',
		'updated_at',
	);

	/**
	 * @var array $_has_many
	 * 他のモデルとの**リレーションシップ（関連付け）**を定義します。
	 * これにより、関連するテーブルのデータを簡単に取得できるようになります。
	 */
	protected static $_has_many = array(
		// Model_Category(親)に属するModel_Schedule(子)の一対多のリレーションシップ
		// 1つのカテゴリーは複数のスケジュールを持つことができます。
		'schedules' => array(
			'key_from' => 'id',
			'model_to' => 'Model_Schedule',
			'key_to' => 'category_id',
			'cascade_delete' => false,
		)
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
	protected static $_table_name = 'categories';

}
