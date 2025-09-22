<?php

// `users` テーブルに対応するモデルクラス
// このクラスは、データベースの `users` テーブルとやり取りするためのモデル（設計図）です。
class Model_User extends \Auth\Model\Auth_User
{
	/**
	 * @var array $_properties
	 * このモデルが扱うデータベースの**カラム（列）**を定義します。
	 * ここで定義されたプロパティが、テーブルの各カラムに対応します。
	 */
	protected static $_properties = array(
		'id',
		'username',
		'password',
		'email',
		'group',
		'last_login',
		'login_hash',
		'profile_fields',
	);

	/**
	 * @var array $_has_many
	 * 他のモデルとの**リレーションシップ（関連付け）**を定義します。
	 * これにより、関連するテーブルのデータを簡単に取得できるようになります。
	 */
	/**
	 * Auth_User の初期化にリレーションを追加
	 */
	public static function _init()
	{
		// Auth_User 側の初期化
		parent::_init();

		// schedules リレーションを追加
		static::$_has_many = array_merge(static::$_has_many, array(
			'schedules' => array(
				'key_from'       => 'id',              // users.id
				'model_to'       => 'Model_Schedule',  // 対象モデル
				'key_to'         => 'user_id',         // schedules.user_id
				'cascade_save'   => true,
				'cascade_delete' => true,
			),
		));
	}	

	/**
	 * @var array $_observers
	 * データベース操作の前後に自動で実行される処理（**オブザーバー**）を定義します。
	 */
	protected static $_observers = array(
		// `before_save` イベント時にバリデーション（入力値検証）を行うオブザーバー。
		'Orm\Observer_Validation' => array(
			'events' => array('before_save'), 
		),
	);

	/**
	 * @var string $_table_name
	 * このモデルが対応するデータベースの**テーブル名**を指定します。
	 */
	protected static $_table_name = 'users';

}
