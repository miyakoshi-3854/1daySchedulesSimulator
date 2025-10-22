<?php

use Fuel\Core\Input;
use Fuel\Core\Validation;

class Controller_Api_Schedule extends Controller_Base_Api
{
  /**
   * OPTIONS /api/schedule
   * CORS Preflight リクエストを処理する
   * Controller_Rest の仕様上、明示的に定義する
   */
  public function options_index()
  {
    // 処理は base/api.php の before() で既に実装済みのため、
    // ここでは FuelPHP のルーティングにヒットさせる役割のみを担う
  }
  
  // 全メソッドで認証が必要
  protected $require_auth = true;

  /**
   * GET /api/schedules
   * 指定された日付のスケジュール一覧を取得
   */
  public function get_index()
  {
    // 認証は before() で完了しているため、ここでは不要
    $user_id = $this->get_current_user_id();
    $date = Input::get('date');
    $start_date = Input::get('start_date'); // 期間指定に対応
    $end_date = Input::get('end_date');     // 期間指定に対応

    // パラメータバリデーション (date or (start_date and end_date))
    if (!$date && !($start_date && $end_date)) {
      return $this->error('Missing required parameter: date or (start_date and end_date)', 400);
    }
    
    // Model のメソッドを呼び出す
    $schedules = Model_Schedule::get_user_schedules(
      $user_id,
      $date,
      $start_date,
      $end_date
    );

    // 共通メソッドでレスポンス
    return $this->success($schedules);
  }

  /**
   * POST /api/schedules
   * 新しいスケジュールを作成
   */
  public function post_index()
  {
    // JSONデータ全体を取得
    $input_data = \Input::json();

    // バリデーション
    $validation = $this->validate_schedule_data($input_data); // 引数 $input_data を渡す
    if ($validation !== true) {
      return $validation;
    }

    $schedule_data = [
      // $input_data から値を直接取得
      'title'       => $input_data['title'],
      'date'        => $input_data['date'],
      'start_time'  => $input_data['start_time'],
      'end_time'    => $input_data['end_time'],
      'color'       => $input_data['color'] ?? '#3498db',
      'note'        => $input_data['note'] ?? '',
      'category_id' => $input_data['category_id'] ?? null,
    ];

    // 時間重複チェック
    if (Model_Schedule::has_time_conflict(
      $this->get_current_user_id(),
      $schedule_data['date'],
      $schedule_data['start_time'],
      $schedule_data['end_time']
    )) {
      return $this->error('Time conflict with existing schedule', 409);
    }

    try {
      $created_schedule = Model_Schedule::create_user_schedule($this->get_current_user_id(), $schedule_data);
      return $this->success($created_schedule, 201);

    } catch (\Exception $e) {
      return $this->error($e->getMessage(), 500);
    }
  }

  /**
   * PUT /api/schedules/{id}
   * スケジュールを更新
   */
  public function put_index()
  {
    // URLから直接スケジュールIDを取得
    $schedule_id = \Uri::segment(3); // /api/schedules/{id} の {id} 部分
    
    if (!$schedule_id) {
      return $this->error('Schedule ID is required', 400);
    }

    // JSONデータ全体を取得
    $input_data = \Input::json(); 

    // バリデーション
    $validation = $this->validate_schedule_data($input_data); // 引数 $input_data を渡す
    if ($validation !== true) {
      return $validation;
    }

    $schedule_data = [
      // $input_data から値を直接取得
      'title'       => $input_data['title'] ?? null,
      'date'        => $input_data['date'] ?? null,
      'start_time'  => $input_data['start_time'] ?? null,
      'end_time'    => $input_data['end_time'] ?? null,
      'color'       => $input_data['color'] ?? null,
      'note'        => $input_data['note'] ?? null,
      'category_id' => $input_data['category_id'] ?? null,
    ];

    // 時間重複チェック（自分自身は除く）
    if (Model_Schedule::has_time_conflict(
      $this->get_current_user_id(),
      $schedule_data['date'],
      $schedule_data['start_time'],
      $schedule_data['end_time'],
      $schedule_id
    )) {
      return $this->error('Time conflict with existing schedule', 409);
    }

    try {
      $updated_schedule = Model_Schedule::update_user_schedule(
        $schedule_id,
        $this->get_current_user_id(),
        $schedule_data
      );

      return $this->success($updated_schedule);

    } catch (\Exception $e) {
      $status_code =
      ($e->getMessage() === 'Schedule not found') ? 404 : 
      (($e->getMessage() === 'Permission denied') ? 403 : 500);
      
      return $this->error($e->getMessage(), $status_code);
    }
  }

  /**
   * DELETE /api/schedules/{id}
   * スケジュールを削除
   */
  public function delete_index() // 引数なしに変更
  {
    // IDを URIセグメントから直接取得
    // URLが /api/schedules/{id} の場合、セグメントは 3
    $schedule_id = \Uri::segment(3); 

    // IDが数値でない、または取得できなかった場合はエラー
    if (!$schedule_id || !is_numeric($schedule_id)) {
      return $this->error('Schedule ID is required or invalid', 400);
    }
    
    $user_id = $this->get_current_user_id();

    try {
      // Modelでの削除処理（所有権チェックも含む）
      Model_Schedule::delete_user_schedule($schedule_id, $user_id);
      
      // 成功時、204 No Contentを返す
      return $this->success(null, 204); 

    } catch (\Exception $e) {
      // Modelから throw された例外をハンドリング
      $status_code = 
      ($e->getMessage() === 'Schedule not found') ? 404 : 
      (($e->getMessage() === 'Permission denied') ? 403 : 500);

      return $this->error($e->getMessage(), $status_code);
    }
  }

  /**
   * GET /api/schedules/dates
   * スケジュールが存在する日付のリストを取得 (カレンダーハイライト用)
   */
  public function get_dates()
  {
    // before()で認証済み
    $user_id = $this->get_current_user_id();
    $start_date = Input::get('start_date');
    $end_date = Input::get('end_date');     

    if (!$start_date || !$end_date) {
      return $this->error('Missing start_date or end_date parameter', 400);
    }
    
    try {
      $dates = Model_Schedule::get_dates_with_schedules($user_id, $start_date, $end_date);
      return $this->success(['highlight_dates' => $dates]);
    } catch (\Exception $e) {
      \Log::error('Failed to get dates: ' . $e->getMessage());
      return $this->error('Internal Server Error', 500);
    }
  }

  // ======================================================================
  // Private Helper Methods
  // ======================================================================

  /**
   * スケジュールデータのバリデーション
   * @return mixed true（成功）またはエラーレスポンス
   */
  private function validate_schedule_data($data) // 引数 $data を受け取る
  {
    $val = Validation::forge();
    $val->add('title', 'Title')->add_rule('required')->add_rule('max_length', 255);
    $val->add('date', 'Date')->add_rule('required');
    $val->add('start_time', 'Start Time')->add_rule('required');
    $val->add('end_time', 'End Time')->add_rule('required');
    
    // バリデーションにデータをセット
    if (!$val->run($data)) {
      return $this->validation_error($val->error_message());
    }

    // データ取得も $data から統一して行う
    $date = $data['date'] ?? null;
    $start_time = $data['start_time'] ?? null;
    $end_time = $data['end_time'] ?? null;

    // 日付形式チェック
    if (!$this->validate_date($date)) {
      return $this->error('Invalid date format. Use YYYY-MM-DD.', 400);
    }

    // 時間形式と論理チェック
    if (!$this->validate_time($start_time) || !$this->validate_time($end_time)) {
      return $this->error('Invalid time format. Use HH:MM:SS.', 400);
    }

    if ($start_time >= $end_time) {
      return $this->error('End time must be after start time.', 400);
    }

    return true;
  }

  /**
   * 日付形式バリデーション（YYYY-MM-DD）
   */
  private function validate_date($date)
  {
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) && strtotime($date);
  }

  /**
   * 時間形式バリデーション（HH:MM:SS）
   */
  private function validate_time($time)
  {
    return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/', $time);
  }
}
