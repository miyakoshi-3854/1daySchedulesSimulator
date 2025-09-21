<?php

return array(
  // 使用する認証ドライバを指定
  'driver' => array('Simpleauth'),
  // パスワードハッシュ化に使用されるソルト
  'salt' => 'my_fuel_php_app_salt',
  // 各ドライバの詳細設定を定義
  'drivers' => array(
    'Simpleauth' => array(
      'login_hash_salt' => 'my_fuel_php_app_login_hash_salt',
      'iterations' => 5000,
      'table' => 'users',
      'model' => 'Model_User',
      'username_property' => 'name',
      'password_property' => 'password',
      'email_property'    => 'email',
      'login_after_registration' => true,
    ),
  ),
  // ログイン状態を保持する
  'remember_me' => array(
    'enabled' => true,
    'cookie_name' => 'remember_me',
    'expiration' => 604800, // 7日
  ),
);
