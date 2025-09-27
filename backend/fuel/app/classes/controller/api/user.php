<?php

use Fuel\Core\Controller_Rest;
use Fuel\Core\Input;
use Fuel\Core\Validation;

class Controller_Api_User extends Controller_Rest
{
  protected $format = 'json';

  /**
   * POST /api/register
   * ユーザー登録処理
   */
  public function post_register()
{
    // バリデーション処理
    $validation = $this->validate_registration();
    if ($validation !== true) {
      return $validation; // エラーレスポンス
    }

    // Modelでビジネスロジック実行
    try {
      $user_data = Model_User::create_new_user(
        Input::post('username'),
        Input::post('email'),
        Input::post('password')
      );

      return $this->response([
        'status' => 'success',
        'data'   => $user_data
      ], 201);

    } catch (\SimpleUserUpdateException $e) {
      return $this->response([
        'status'  => 'error',
        'message' => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * POST /api/login
   * ユーザーログイン処理
   */
  public function post_login()
  {
    // バリデーション処理
    $validation = $this->validate_login();
    if ($validation !== true) {
      return $validation; // エラーレスポンス
    }

    // Modelで認証処理
    $user_data = Model_User::authenticate_user(
      Input::post('email'),
      Input::post('password')
    );

    if ($user_data === false) {
      return $this->response([
        'status'  => 'error',
        'message' => 'Invalid email or password',
      ], 401);
    }

    // ログイン成功レスポンス（セッションIDを追加）
    $user_data['session_id'] = Model_User::get_session_id();
    
    return $this->response([
      'status' => 'success',
      'data'   => $user_data
    ], 200);
  }

  /**
   * POST /api/logout
   * ユーザーログアウト処理
   */
  public function post_logout()
  {
    // Modelでログアウト処理
    if (!Model_User::logout_user()) {
      return $this->response([
        'status'  => 'error',
        'message' => 'No active session',
      ], 400);
    }

    return $this->response([
      'status'  => 'success',
      'message' => 'Logged out successfully',
    ], 200);
  }

  /**
   * GET /api/me
   * 現在のユーザー情報を取得
   */
  public function get_me()
  {
    // Modelからユーザー情報を取得
    $user_data = Model_User::get_current_user_info();
    
    if ($user_data === null) {
      return $this->response([
        'status' => 'success',
        'data'   => ['logged_in' => false]
      ], 200);
    }

    $user_data['logged_in'] = true;
    
    return $this->response([
      'status' => 'success',
      'data'   => $user_data
    ], 200);
  }

  // ======================================================================
  // Private Helper Methods (バリデーション処理)
  // ======================================================================

  /**
   * ユーザー登録用バリデーション
   * @return mixed true（成功）またはエラーレスポンス
   */
  private function validate_registration()
  {
    $val = Validation::forge();
    $val->add('username', 'Username')->add_rule('required');
    $val->add('email', 'Email')->add_rule('required')->add_rule('valid_email');
    $val->add('password', 'Password')->add_rule('required')->add_rule('min_length', 6);

    if (!$val->run()) {
      return $this->response([
        'status' => 'error',
        'errors' => $val->error_message(),
      ], 400);
    }

    return true;
  }

  /**
   * ログイン用バリデーション
   * @return mixed true（成功）またはエラーレスポンス
   */
  private function validate_login()
{
    $val = Validation::forge();
    $val->add('email', 'Email')->add_rule('required')->add_rule('valid_email');
    $val->add('password', 'Password')->add_rule('required');

    if (!$val->run()) {
      return $this->response([
        'status' => 'error',
        'errors' => $val->error_message(),
      ], 400);
    }

    return true;
  }
}