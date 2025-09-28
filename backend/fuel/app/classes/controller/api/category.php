<?php
// app/classes/controller/api/category.php

class Controller_Api_Category extends Controller_Base_Api
{
  // カテゴリー一覧は認証不要とする (共通設定のため)
  protected $require_auth = false; 

  /**
   * GET /api/categories
   * 全カテゴリーのリストを返す
   */
  public function get_index()
  {
    try {
      $categories = Model_Category::get_all_categories();
      
      return $this->success($categories);

    } catch (\Exception $e) {
      \Log::error('Failed to get categories: ' . $e->getMessage());
      // エラーハンドリングは共通の error メソッドを使用
      return $this->error('Internal Server Error', 500);
    }
  }
}