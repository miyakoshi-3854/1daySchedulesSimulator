<?php

return array(
  'driver' => array('Simpleauth'),        // ← 配列にするのが正式
  'salt' => 'my_fuel_php_app_salt',
  'verify_multiple_logins' => false,
  'iterations' => 5000,

  'drivers' => array(
    'Simpleauth' => array(
      'login_hash_salt' => 'my_fuel_php_app_login_hash_salt',
      'table' => 'users',
      'model' => 'Model_User',
      'username_property' => 'name',
      'password_property' => 'password',
      'email_property'    => 'email',
      'login_after_registration' => true,
    ),
  ),
);
