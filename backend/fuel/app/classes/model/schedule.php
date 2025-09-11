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

	// 作成日時と更新日時のオブザーバー
	protected static $_observers = array(
		'Orm\Observer_CreatedAt' => array(
			'events' => array('before_insert'),
			'mysql_timestamp' => false,
		),
		'Orm\Observer_UpdatedAt' => array(
			'events' => array('before_save'),
			'mysql_timestamp' => false,
		),
	);

	// テーブル名
	protected static $_table_name = 'schedules';

}
