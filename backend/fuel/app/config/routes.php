<?php
return array(
	'_root_'  => 'welcome/index',  // The default route
	'_404_'   => 'welcome/404',    // The main 404 route

	'api/register' => 'api/user/register', // ユーザー登録API
	'api/login'    => 'api/user/login', // ユーザーログインAPI
	'api/logout'   => 'api/user/logout', // ユーザーログアウトAPI
	
	'hello(/:name)?' => array('welcome/hello', 'name' => 'hello'),
);
