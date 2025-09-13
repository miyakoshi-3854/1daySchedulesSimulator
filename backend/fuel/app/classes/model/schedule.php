<?php

// scheduleテーブルのモデル
class Model_Schedule extends \Orm\Model
{
	// テーブルのカラム
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


	protected static $_belongs_to = array(
		// Model_User(親)に属するModel_Schedule(子)の多対一のリレーションシップ
    'user' => array(
			'key_from' => 'user_id',
			'model_to' => 'Model_User',
			'key_to' => 'id',
			'cascade_save' => true,
			'cascade_delete' => false,
		),

		// Model_category(親)に属するModel_Schedule(子)の多対一のリレーションシップ
		'category' => array(
			'key_from' => 'category_id',
			'model_to' => 'Model_Category',
			'key_to' => 'id',
			'cascade_save' => true,
			'cascade_delete' => false,
    ),
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
	protected static $_table_name = 'schedules';

}
