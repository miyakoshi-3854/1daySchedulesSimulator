<?php
return array(
	'_root_'  => 'welcome/index',  // The default route
	'_404_'   => 'welcome/404',    // The main 404 route

	// User関連
	'api/register' => 'api/user/register', // ユーザー登録API
	'api/login'    => 'api/user/login', // ユーザーログインAPI
	'api/logout'   => 'api/user/logout', // ユーザーログアウトAPI
	'api/me'       => 'api/user/me', // ユーザーログイン状態確認API

	// Schedule関連
	'api/schedules/dates' => 'api/schedule/dates', // スケージュールが存在する日を取得するAPI
	'api/schedules(/:id)?' => 'api/schedule', // これ一つで全てのCRUDに対応
	
	'hello(/:name)?' => array('welcome/hello', 'name' => 'hello'),
);
