<?php

use Fuel\Core\Controller_Rest;
use Fuel\Core\Input;
use Fuel\Core\Auth;

class Controller_Api_Schedule extends Controller_Rest
{
  protected $format = 'json';

  /**
   * GET /api/schedules
   * 指定された日付のスケジュール一覧を取得
   */
  public function get_index()
  {
    // ログインチェック
    if (!\Auth::check()) {
      return $this->response([
        'status' => 'error',
        'message' => 'Unauthorized',
      ], 401);
    }

    // ログイン中のユーザーID
    $user_id = \Auth::get_user_id()[1];

    // クエリパラメータから date を取得
    $date = \Input::get('date');

    if (!$date) {
      return $this->response([
        'status' => 'error',
        'message' => 'Missing required parameter: date',
      ], 400);
    }

    // ORM を使ってスケジュールを取得
    $schedules = Model_Schedule::find('all', [
      'where' => [
        ['user_id', $user_id],
        ['date', $date],
      ],
      'order_by' => ['start_time' => 'asc'],
    ]);

    // 結果を配列化
    $result = [];
    foreach ($schedules as $schedule) {
      $result[] = [
        'id'         => $schedule->id,
        'title'      => $schedule->title,
        'date'       => $schedule->date,
        'start_time' => $schedule->start_time,
        'end_time'   => $schedule->end_time,
        'color'      => $schedule->color,
        'note'       => $schedule->note,
        'category_id'=> $schedule->category_id,
      ];
    }

    return $this->response([
      'status' => 'success',
      'data'   => $result,
    ], 200);
  }
}
