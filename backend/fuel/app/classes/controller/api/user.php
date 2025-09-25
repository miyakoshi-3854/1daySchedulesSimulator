<?php

use Fuel\Core\Controller_Rest;
use Fuel\Core\Input;
use Fuel\Core\Validation;
use Fuel\Core\Auth;

class Controller_Api_User extends Controller_Rest
{
  protected $format = 'json';

  /**
   * POSTリクエストによるユーザー登録処理
   */
  public function post_register()
  {
    // 入力チェック
    $val = Validation::forge();
    $val->add('username', 'Username')->add_rule('required');
    $val->add('email', 'Email')->add_rule('required')->add_rule('valid_email');
    $val->add('password', 'Password')->add_rule('required')->add_rule('min_length', 6);

    // バリデーションを実行し、失敗した場合はエラーレスポンスを返す
    if (!$val->run()) {
      return $this->response([
        'status' => 'error',
        'errors' => $val->error_message(),
      ], 400);
    }

    // POSTデータからユーザー情報を取得
    $username = Input::post('username');
    $email    = Input::post('email');
    $password = Input::post('password');

    try {
      // FuelPHPの認証機能を使って新しいユーザーを作成
      // パスワードは自動的にハッシュ化されて保存される
      $user_id = \Auth::create_user($username, $password, $email);

      // ユーザー作成成功時のレスポンスを返す
      return $this->response([
        'status' => 'success',
        'data'   => [
          'user_id'  => $user_id,
          'username' => $username,
          'email'    => $email,
        ]
      ], 201);

    } catch (\SimpleUserUpdateException $e) {
      // ユーザー作成中にエラーが発生した場合
      return $this->response([
        'status'  => 'error',
        'message' => $e->getMessage(),
      ], 400);
    }
  }
}
