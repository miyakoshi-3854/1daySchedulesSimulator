<?php

use Fuel\Core\Input;
use Fuel\Core\Validation;

class Controller_Api_User extends Controller_Base_Api
{
   // 自動認証はオフ（メソッドごとに手動制御）
  protected $require_auth = false;
  protected $format = 'json';

  /**
   * POST /api/register
   * ユーザー登録処理
   */
  public function post_register()
  {
    $validation = $this->validate_registration();
    if ($validation !== true) {
      return $validation; 
    }

    try {
      $user_data = Model_User::create_new_user(
        Input::post('username'),
        Input::post('email'),
        Input::post('password')
      );

      return $this->success($user_data, 201); // 共通 success を使用

    } catch (\SimpleUserUpdateException $e) {
      return $this->error($e->getMessage(), 400); // 共通 error を使用
    }
  }

  /**
   * POST /api/login
   * ユーザーログイン処理
   */
  public function post_login()
  {
    $validation = $this->validate_login();
    if ($validation !== true) {
      return $validation; 
    }

    $user_data = Model_User::authenticate_user(
      Input::post('email'),
      Input::post('password')
    );

    if ($user_data === false) {
      return $this->error('Invalid email or password', 401); // 共通 error を使用
    }

    $user_data['session_id'] = Model_User::get_session_id();
    return $this->success($user_data); // 共通 success を使用
  }

  /**
   * POST /api/logout
   * ユーザーログアウト処理
   */
  public function post_logout()
  {
    // 認証チェックは Model 側に寄せているため、Model の戻り値で判定
    if (!Model_User::logout_user()) {
      return $this->error('No active session', 400); // 共通 error を使用
    }

    return $this->success(['message' => 'Logged out successfully']); // 共通 success を使用
  }

  /**
   * GET /api/me
   * 現在のユーザー情報を取得
   */
  public function get_me()
  {
    // 認証が必要だが、BaseControllerでは認証がスキップされているため、Model側で認証状態を確認
    $user_data = Model_User::get_current_user_info();
    
    if ($user_data === null) {
      return $this->success(['logged_in' => false]);
    }

    $user_data['logged_in'] = true;
    return $this->success($user_data); // 共通 success を使用
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
      // 共通 validation_error を使用
      return $this->validation_error($val->error_message());
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
      // 共通 validation_error を使用
      return $this->validation_error($val->error_message());
    }

    return true;
  }
}