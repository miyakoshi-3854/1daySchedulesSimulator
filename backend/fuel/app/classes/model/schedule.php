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
	 */
	protected static $_properties = array(
		'id' => array(
			'data_type' => 'int',
			'null' => false,
			'auto_increment' => true,
			'primary_key' => true,
			'label' => 'ID',
		),
		'user_id' => array(
			'data_type' => 'int',
			'null' => false,
			'label' => 'ユーザーID',
			'validation' => array(
				'required',
			),
		),
		'category_id' => array(
			'data_type' => 'int',
			'null' => true,
			'label' => 'カテゴリーID',
		),
		'title' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => '予定名',
			'validation' => array(
				'max_length' => array(50),
			),
		),
		'date' => array(
			'data_type' => 'date',
			'null' => false,
			'label' => '日付',
			'validation' => array(
				'valid_date',
			),
		),
		'start_time' => array(
			'data_type' => 'time',
			'null' => false,
			'label' => '開始時間',
			'validation' => array(
				'required',
				'match_pattern' => array('/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'),
			),
		),
		'end_time' => array(
			'data_type' => 'time',
			'null' => false,
			'label' => '終了時間',
			'validation' => array(
				'required',
				'match_pattern' => array('/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'),
			),
		),
		'color' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => '色',
			'validation' => array(
				'exact_length' => array(7),
				'match_pattern' => array('/^#[0-9a-fA-F]{6}$/'),
			),
		),
		'note' => array(
			'data_type' => 'text',
			'null' => true,
			'label' => '備考',
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
	protected static $_table_name = 'schedules';

	// ======================================================================
	// スケジュール関連ビジネスロジック
	// ======================================================================

	/**
	 * 指定されたユーザーの指定日のスケジュール一覧を取得
	 * @param int $user_id ユーザーID
	 * @param string $date 日付（YYYY-MM-DD形式）
	 * @param string|null $start_date 開始日（期間指定時）
	 * @param string|null $end_date 終了日（期間指定時）
	 * @return array スケジュール一覧
	 */
	public static function get_user_schedules($user_id, $date = null, $start_date = null, $end_date = null)
	{
		$where = array(
			array('user_id', $user_id)
		);

		// 日付条件を設定
		if ($date) {
			// 特定の日付
			$where[] = array('date', $date);
		} elseif ($start_date && $end_date) {
			// 期間指定
			$where[] = array('date', '>=', $start_date);
			$where[] = array('date', '<=', $end_date);
		}

		try {
			$schedules = static::find('all', array(
				'where' => $where,
				'order_by' => array('date' => 'asc', 'start_time' => 'asc'),
			));

			return static::format_schedules($schedules);

		} catch (\Exception $e) {
			\Log::error('Failed to get user schedules: ' . $e->getMessage());
			return array();
		}
	}
}
