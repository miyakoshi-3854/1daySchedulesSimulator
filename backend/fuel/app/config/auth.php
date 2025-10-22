<?php

return array(
  'driver'                 => 'Simpleauth', // 使用するドライバー
  'verify_multiple_logins' => false, // 多重ログイン不可
  'salt'                   => 'my_fuel_php_app_salt', // パスワードのハッシュ化のために使用
  'iterations'             => 5000, // ハッシュ化処理の繰り返し回数
);

