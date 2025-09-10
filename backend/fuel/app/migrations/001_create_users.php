<?php

namespace Fuel\Migrations;

class Create_users
{
    // マイグレーションを実行する際に呼び出され`users`テーブルを作成するmethod
    public function up()
    {
        \DBUtil::create_table('users', array(
            'id' => array('constraint' => 11, 'type' => 'int', 'auto_increment' => true, 'unsigned' => true),
            'name' => array('constraint' => 50, 'type' => 'varchar'),
            'email' => array('constraint' => 255, 'type' => 'varchar', 'null' => true),
            'password' => array('constraint' => 255, 'type' => 'varchar'),
            'created_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP')),
            'updated_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        ), array('id'));
    }

    // マイグレーションをロールバックする際に呼び出され`users`テーブルを削除するmethod
    public function down()
    {
        \DBUtil::drop_table('users');
    }
}