<?php

use Fuel\Core\Controller_Rest;
use Fuel\Core\Response;

class Controller_Base_Api extends Controller_Rest
{
  // デフォルトのレスポンスフォーマット
  protected $format = 'json';

  public function before()
  {
    parent::before();

    // CORS ヘッダ設定
    header('Access-Control-Allow-Origin: http://localhost:5173'); // React のオリジン
    header('Access-Control-Allow-Credentials: true');             // Cookie 送信を許可
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Preflight (OPTIONS) リクエスト対応
    if (\Input::method() === 'OPTIONS') {
      return Response::forge('', 200);
    }
  }

  /**
   * 共通レスポンス（成功時）
   */
  protected function success($data = [], $status = 200)
  {
    return $this->response([
      'status' => 'success',
      'data'   => $data,
    ], $status);
  }

  /**
   * 共通レスポンス（エラー時）
   */
  protected function error($message, $status = 400)
  {
    return $this->response([
      'status'  => 'error',
      'message' => $message,
    ], $status);
  }
}
