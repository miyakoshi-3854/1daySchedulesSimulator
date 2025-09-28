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

	/**
	 * 新しいスケジュールを作成
	 * @param int $user_id ユーザーID
	 * @param array $schedule_data スケジュールデータ
	 * @return array 作成されたスケジュール情報
	 * @throws \Exception 作成失敗時
	 */
	public static function create_user_schedule($user_id, $schedule_data)
	{
		try {
			$schedule = static::forge(array(
				'user_id'       => $user_id,
				'title'         => $schedule_data['title'],
				'date'          => $schedule_data['date'],
				'start_time'    => $schedule_data['start_time'],
				'end_time'      => $schedule_data['end_time'],
				// デフォルト値を適用
				'color'         => isset($schedule_data['color']) ? $schedule_data['color'] : '#FF0000',
				'note'          => isset($schedule_data['note']) ? $schedule_data['note'] : '',
				'category_id'   => isset($schedule_data['category_id']) ? $schedule_data['category_id'] : null,
			));

			if (!$schedule->save()) {
				throw new \Exception('Failed to save schedule');
			}

			return static::format_schedule($schedule);

		} catch (\Exception $e) {
			\Log::error('Failed to create schedule: ' . $e->getMessage());
			throw $e;
		}
	}

	/**
	 * スケジュールを更新
	 * @param int $schedule_id スケジュールID
	 * @param int $user_id ユーザーID（所有者確認用）
	 * @param array $schedule_data 更新データ
	 * @return array 更新されたスケジュール情報
	 * @throws \Exception 更新失敗時
	 */
	public static function update_user_schedule($schedule_id, $user_id, $schedule_data)
	{
		try {
			$schedule = static::find($schedule_id);
			
			if (!$schedule) {
				throw new \Exception('Schedule not found');
			}

			// 所有者確認
			if ($schedule->user_id != $user_id) {
				throw new \Exception('Permission denied');
			}

			// データを更新
			$schedule->title        = $schedule_data['title'] ?? $schedule->title; 
			$schedule->date         = $schedule_data['date'] ?? $schedule->date;
			$schedule->start_time   = $schedule_data['start_time'] ?? $schedule->start_time;
			$schedule->end_time     = $schedule_data['end_time'] ?? $schedule->end_time;
			$schedule->color        = $schedule_data['color'] ?? $schedule->color;
			$schedule->note         = $schedule_data['note'] ?? $schedule->note;
			$schedule->category_id  = $schedule_data['category_id'] ?? $schedule->category_id;

			if (!$schedule->save()) {
				throw new \Exception('Failed to update schedule');
			}

			return static::format_schedule($schedule);

		} catch (\Exception $e) {
			\Log::error('Failed to update schedule: ' . $e->getMessage());
			throw $e;
		}
	}

	/**
	 * スケジュールの時間重複チェック
	 * @param int $user_id ユーザーID
	 * @param string $date 日付
	 * @param string $start_time 開始時間
	 * @param string $end_time 終了時間
	 * @param int|null $exclude_id 除外するスケジュールID（更新時用）
	 * @return bool 重複があるかどうか
	 */
	public static function has_time_conflict($user_id, $date, $start_time, $end_time, $exclude_id = null)
	{
		$where = array(
			array('user_id', $user_id),
			array('date', $date),
		);

		if ($exclude_id) {
			$where[] = array('id', '!=', $exclude_id);
		}

		try {
			$schedules = static::find('all', array(
				'where' => $where,
			));

			foreach ($schedules as $schedule) {
				// 時間重複チェック: (A開始 < B終了) AND (A終了 > B開始)
				if (($start_time < $schedule->end_time) && ($end_time > $schedule->start_time)) {
					return true;
				}
			}

			return false;

		} catch (\Exception $e) {
			\Log::error('Failed to check time conflict: ' . $e->getMessage());
			return false;
		}
	}

	// --- データ整形ヘルパー ---
	
	protected static function format_schedule($schedule)
	{
		// コントローラーへの戻り値を整形
		return [
			'id'          => $schedule->id,
			'title'       => $schedule->title,
			'date'        => $schedule->date,
			'start_time'  => $schedule->start_time,
			'end_time'    => $schedule->end_time,
			'color'       => $schedule->color,
			'note'        => $schedule->note,
			'category_id' => $schedule->category_id,
		];
	}

	protected static function format_schedules($schedules)
	{
		// 複数件のスケジュールを整形
		$result = [];
		foreach ($schedules as $schedule) {
			$result[] = static::format_schedule($schedule);
		}
		return $result;
	}
}
