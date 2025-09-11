<?php

namespace Fuel\Migrations;

class Create_schedules
{
	public function up()
	{
		\DBUtil::create_table('schedules', array(
			'id' => array('constraint' => 11, 'type' => 'int', 'auto_increment' => true, 'unsigned' => true),
			'user_id' => array('constraint' => 11, 'type' => 'int', 'unsigned' => true),
			'category_id' => array('constraint' => 11, 'type' => 'int', 'unsigned' => true, 'null' => true),
			'title' => array('constraint' => 50, 'type' => 'varchar'),
			'date' => array('type' => 'datetime'),
			'start_time' => array('type' => 'time'),
			'end_time' => array('type' => 'time'),
			'color' => array('constraint' => 7, 'type' => 'varchar', 'null' => true),
			'note' => array('type' => 'text', 'null' => true),
			'created_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP')),
			'updated_at' => array('type' => 'datetime', 'default' => \DB::expr('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
		), array('id'));
	}

	public function down()
	{
		\DBUtil::drop_table('schedules');
	}
}