<?php

use Fuel\Core\Input;

class Controller_Api_Schedule extends Controller_Base_Api
{
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
    
    // Model のメソッドを呼び出す (Model_Schedule の完全版が必要です)
    $schedules = Model_Schedule::get_user_schedules(
        $user_id,
        $date,
        $start_date,
        $end_date
    );

    // 共通メソッドでレスポンス
    return $this->success($schedules);
  }
}
