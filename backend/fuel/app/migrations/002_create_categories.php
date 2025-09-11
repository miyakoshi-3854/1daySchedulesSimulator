<?php

namespace Fuel\Migrations;

class Create_categories
{
	public function up()
	{
		\DBUtil::create_table('categories', array(
			'id' => array('constraint' => 11, 'type' => 'int', 'auto_increment' => true, 'unsigned' => true),
			'name' => array('constraint' => 50, 'type' => 'varchar'),
			'default_title' => array('constraint' => 50, 'type' => 'varchar', 'null' => true),
			'default_start' => array('type' => 'TIME', 'null' => true),
			'default_end' => array('type' => 'TIME', 'null' => true),
			'default_note' => array('type' => 'TEXT', 'null' => true),
			'default_color' => array('constraint' => 7, 'type' => 'varchar', 'default' => '#87CEFA'),
			'created_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP')),
			'updated_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
		), array('id'));
	}

	public function down()
	{
		\DBUtil::drop_table('categories');
	}
}