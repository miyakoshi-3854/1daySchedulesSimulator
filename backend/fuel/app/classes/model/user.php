<?php

// `users` テーブルに対応するモデルクラス
// このクラスは、データベースの `users` テーブルとやり取りするためのモデル（設計図）です。
class Model_User extends \Orm\Model
{
	/**
	 * @var array $_properties
	 * このモデルが扱うデータベースの**カラム（列）**を定義します。
	 * ここで定義されたプロパティが、テーブルの各カラムに対応します。
	 */
	protected static $_properties = array(
		'id' => array(
			'data_type' => 'int',
			'null' => false,
			'auto_increment' => true,
			'primary_key' => true,
			'label' => 'ID',
		),
		'name' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => 'ユーザー名',
			'validation' => array(
				'required' => true,
				'min_length' => 2,
				'max_length' => 50,
			),
		),
		'email' => array(
			'data_type' => 'varchar',
			'null' => true,
			'unique' => true,
			'label' => 'メールアドレス',
			'validation' => array(
				'required' => false,
				'valid_email' => true,
			),
		),
		'password' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => 'パスワード',
			'validation' => array(
				'required' => true,
				'min_length' => 8,
			),
		),
		'created_at' => array(
			'data_type' => 'datetime',
			'null' => false,
			'label' => '作成日時',
		),
		'updated_at' => array(
			'data_type' => 'datetime',
			'null' => false,
			'label' => '更新日時',
		),
	);

	/**
	 * @var array $_has_many
	 * 他のモデルとの**リレーションシップ（関連付け）**を定義します。
	 * これにより、関連するテーブルのデータを簡単に取得できるようになります。
	 */
	protected static $_has_many = array(
		// Model_User(親)に属するModel_Schedule(子)の一対多のリレーションシップ
		// 1人のユーザーは複数のスケジュールを持つことができます。
		'schedules' => array(
			'key_from' => 'id',
			'model_to' => 'Model_Schedule',
			'key_to' => 'user_id',
			'cascade_delete' => true,
		)
	);

	/**
	 * @var array $_observers
	 * データベース操作の前後に自動で実行される処理（**オブザーバー**）を定義します。
	 */
	protected static $_observers = array(
		// `before_save` イベント時にバリデーション（入力値検証）を行うオブザーバー。
		'Orm\Observer_Validation' => array(
			'events' => array('before_save'), 
		),
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
	protected static $_table_name = 'users';

}
