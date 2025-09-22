<?php

return array(
  'table_name' => 'users',
  'table_columns' => array('*'),
  'model' => 'Model_User',
  'multiple_logins' => false,
  'login_after_registration' => true,

  // 自動ログイン機能（remember_me）を有効にする
  'remember_me' => array(
    'enabled' => true,                   // 有効化
    'cookie_name' => 'remember_me',      // Cookie 名
    'expiration' => 604800,              // 7日間（秒数）
  ),

  // ログインハッシュ用ソルト（remember_me で使用）
  'login_hash_salt' => 'my_fuel_php_app_login_hash_salt',

  'username_post_key' => 'username',
  'password_post_key' => 'password',
);
