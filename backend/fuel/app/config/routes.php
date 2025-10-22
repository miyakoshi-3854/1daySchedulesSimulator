<?php
return array(
	'_root_' => 'api/ping', // APIが起動しているか確認するため ping をデフォルトにする
	'_404_'  => 'api/ping/404', // 404ルートは維持

	// User関連
	'api/register' => 'api/user/register', // ユーザー登録API
	'api/login'    => 'api/user/login', // ユーザーログインAPI
	'api/logout'   => 'api/user/logout', // ユーザーログアウトAPI
	'api/me'       => 'api/user/me', // ユーザーログイン状態確認API

	// Schedule関連（優先度の高い順）
	'api/schedules/dates' => 'api/schedule/dates', // スケージュールが存在する日を取得するAPI
	'api/schedules(/:id)?' => 'api/schedule', // これ一つで全てのCRUDに対応

	// Category関連
	'api/categories' => 'api/category/index', // カテゴリーの取得API
);
