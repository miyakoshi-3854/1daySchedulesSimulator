<?php
return array(
  // ドライバ指定
  'driver' => 'cookie',

  // 有効期限（秒単位）
  'expiration_time' => 8 * 60 * 60,

  // セッションクッキー設定
  'cookie' => array(

    // HTTPSのみ送信
    'secure' => true,

    // JavaScriptからのアクセス禁止
    'http_only' => true,

    // CSRF対策
    'samesite' => 'Lax',

    // クッキー自体の有効期限。'expiration_time'を使う場合は0でOK
    'expiration_time' => 0,
  ),
);
