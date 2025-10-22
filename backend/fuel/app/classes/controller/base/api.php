<?php

use Fuel\Core\Controller_Rest;
use Fuel\Core\Response;
use Fuel\Core\Input;

class Controller_Base_Api extends Controller_Rest
{
  // デフォルトのレスポンスフォーマット
  protected $format = 'json';

  // 認証関連プロパティ
  protected $require_auth = false; // 継承先でtrueにすることで認証必須
  protected $user_id = null;       // 認証済みユーザーのID

  /**
   * Controller_Base_Api
   * このコントローラーで拡張したクラスを使用する時に、最初に実行されるメソッド
   */
  public function before()
  {
    parent::before();

    // CORS ヘッダ設定
    header('Access-Control-Allow-Origin: http://localhost:5173'); // React のオリジン
    header('Access-Control-Allow-Credentials: true');             // Cookie 送信を許可
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // クリックジャッキング対策 (iframe埋め込みを拒否)
    header('X-Frame-Options: SAMEORIGIN');

    // Preflight (OPTIONS) リクエスト対応
    if (\Input::method() === 'OPTIONS') {
      return Response::forge('', 200);
      $response->send();
      exit;
    }

    // 認証チェック（継承クラスで true の場合のみ実行）
    if ($this->require_auth) {
      if (!$this->authenticate()) {
        // 認証失敗時は authenticate() でレスポンスを返し、
        // before()から false を返すことで、コントローラーのメイン処理実行を停止
        return false; 
      }
    }
  }

  /**
   * 認証処理（Auth::check()とユーザーIDの取得）
   * @return bool 認証成功/失敗
   */
  protected function authenticate()
  {
    if (!\Auth::check()) {
      $this->error('Unauthorized', 401);
      return false;
    }

    $user_id_array = \Auth::get_user_id();
    if (!$user_id_array || !isset($user_id_array[1])) {
      $this->error('Failed to get user ID', 500);
      return false;
    }

    $this->user_id = $user_id_array[1];
    return true;
  }

  /**
   * 現在のユーザーIDを取得 (Model連携用)
   * @return int|null ユーザーID
   */
  protected function get_current_user_id()
  {
    return $this->user_id;
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

  /**
   * バリデーションエラーレスポンス
   */
  protected function validation_error($errors, $status = 400)
  {
    // ユーザーコントローラーのバリデーションロジックに合わせてerrorsを配列形式で返す
    return $this->response([
      'status' => 'error',
      'errors' => $errors,
    ], $status);
  }
}
