<?php
return array(
	'_root_'  => 'welcome/index',  // The default route
	'_404_'   => 'welcome/404',    // The main 404 route

	'api/register' => 'api/user/register', // ユーザー登録API
	
	'hello(/:name)?' => array('welcome/hello', 'name' => 'hello'),
);
