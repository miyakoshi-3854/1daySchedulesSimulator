<?php

// userテーブルのモデル
class Model_User extends \Orm\Model
{
	// テーブルのカラム
	protected static $_properties = array(
		'id',
		'name',
		'email',
		'password',
		'created_at',
		'updated_at',
	);

	// schedulesテーブルとのhas_manyリレーションシップを定義
	protected static $_has_many = array(
		'schedules' => array(
			'key_from' => 'id',
			'model_to' => 'Model_Schedule',
			'key_to' => 'user_id',
			'cascade_delete' => true,
		)
	);

	// 作成日時と更新日時のオブザーバー
	protected static $_observers = array(
		'Orm\Observer_CreatedAt' => array(
			'events' => array('before_insert'),
			'mysql_timestamp' => true,
		),
		'Orm\Observer_UpdatedAt' => array(
			'events' => array('before_save'),	
			'mysql_timestamp' => true,
		),
	);

	// テーブル名
	protected static $_table_name = 'users';

}
