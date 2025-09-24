<?php

class Controller_Api_Ping extends Controller_Base_Api
{
  public function get_index()
  {
    return $this->success('pong');
  }
}
