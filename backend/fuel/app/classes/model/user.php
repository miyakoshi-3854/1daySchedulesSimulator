<?php

// `users` テーブルに対応するモデルクラス
// このクラスは、データベースの `users` テーブルとやり取りするためのモデル（設計図）です。
class Model_User extends \Orm\Model
{
	/**
	 * @var array $_properties
	 * このモデルが扱うデータベースの**カラム（列）**を定義します。
	 * ここで定義されたプロパティが、テーブルの各カラムに対応します。
	 */
	protected static $_properties = array(
		'id' => array(
			'data_type' => 'int',
			'null' => false,
			'auto_increment' => true,
			'primary_key' => true,
			'label' => 'ID',
		),
		'username' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => 'ユーザー名',
			'validation' => array(
				'required',
				'max_length' => array(50)
			),
		),
		'password' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => 'Password',
			'validation' => array(
				'required',
				'max_length' => array(255)
			),
		),
		'email' => array(
			'data_type' => 'varchar',
			'null' => false,
			'label' => 'Email',
			'validation' => array(
				'required',
				'valid_email',
				'max_length' => array(255)
			),
		),
		'group' => array(
			'data_type' => 'int',
			'null' => false,
			'default' => 1,
		),
		'last_login' => array(
			'data_type' => 'varchar',
			'null' => false,
			'default' => '',
		),
		'login_hash' => array(
			'data_type' => 'varchar',
			'null' => false,
			'default' => '',
		),
		'profile_fields' => array(
			'data_type' => 'text',
			'null' => false,
			'label' => 'Profile Fields',
		),
		'created_at' => array(
			'data_type' => 'int',
			'null' => false,
			'default' => 0,
			'label' => '作成日時',
		),
		'updated_at' => array(
			'data_type' => 'int',
			'null' => false,
			'default' => 0,
			'label' => '更新日時',
		),
	);

	/**
	 * @var array $_has_many
	 * 他のモデルとの**リレーションシップ（関連付け）**を定義します。
	 * これにより、関連するテーブルのデータを簡単に取得できるようになります。
	 */
	protected static $_has_many = array(
		'schedules' => array(
			'key_from'       => 'id',            // users.id
			'model_to'       => 'Model_Schedule',// 対象モデル
			'key_to'         => 'user_id',       // schedules.user_id
			'cascade_save'   => true,
			'cascade_delete' => true,
		),
	);	

	/**
	 * @var array $_observers
	 * データベース操作の前後に自動で実行される処理（**オブザーバー**）を定義します。
	 */
	protected static $_observers = array(
		// `before_save` イベント時にバリデーション（入力値検証）を行うオブザーバー。
		'Orm\Observer_Validation' => array(
			'events' => array('before_save'), 
		),
		// 新規レコード作成時、`created_at`カラムにタイムスタンプを自動設定するオブザーバー。
		'Orm\Observer_CreatedAt' => array(
			'events' => array('before_insert'),
			'mysql_timestamp' => false, // カラムの型がint型のためfalse
		),
		// レコードが更新されるたび、`updated_at`カラムにタイムスタンプを自動設定するオブザーバー。
		'Orm\Observer_UpdatedAt' => array(
			'events' => array('before_save'),
			'mysql_timestamp' => false, // カラムの型がint型のためfalse
		),
	);

	/**
	 * @var string $_table_name
	 * このモデルが対応するデータベースの**テーブル名**を指定します。
	 */
	protected static $_table_name = 'users';

	// ======================================================================
	// 認証に関するビジネスロジック
	// ======================================================================

	/**
	 * ユーザー登録処理
	 * @param string $username ユーザー名
	 * @param string $email メールアドレス
	 * @param string $password パスワード
	 * @return array ユーザー情報（user_id, username, email）
	 * @throws \SimpleUserUpdateException ユーザー作成失敗時
	 */
	public static function create_new_user($username, $email, $password)
	{
		// バリデーションは呼び出し元で実施済みという前提
		// ここではビジネスロジックに集中
		
		try {
			// FuelPHPの認証機能を使用（パスワードの自動ハッシュ化を含む）
			$user_id = \Auth::create_user($username, $password, $email);
			
			return [
				'user_id'  => $user_id,
				'username' => $username,
				'email'    => $email,
			];
		} catch (\SimpleUserUpdateException $e) {
			// エラーをそのまま再投下（コントローラーでハンドリング）
			throw $e;
		}
	}

	/**
	 * ユーザーログイン処理
	 * @param string $email メールアドレス
	 * @param string $password パスワード
	 * @return array|false ログイン成功時はユーザー情報、失敗時はfalse
	 */
	public static function authenticate_user($email, $password)
	{
		// 認証を実行
		if (!\Auth::login($email, $password)) {
			return false;
		}

		// 認証成功時、ユーザー情報を取得して返す
		return static::get_current_user_info();
	}

	/**
	 * ユーザーログアウト処理
	 * @return bool ログアウト可能だったかどうか
	 */
	public static function logout_user()
	{
		// ログイン状態チェック
		if (!\Auth::check()) {
			return false;
		}

    // ------------------------------------------------------------------
    // 1. Authシステムのログアウト処理とリメンバーミーの無効化
    // ------------------------------------------------------------------
    // SimpleAuth のリメンバーミー無効化は、セッション終了前に実行する
    \Auth::dont_remember_me(); 
    \Auth::logout();
    
    // ------------------------------------------------------------------
    // 2. Cookie設定の取得
    // ------------------------------------------------------------------
    // セッションCookie設定を取得
    $session_config = \Config::get('session.cookie', []); 
    
    // リメンバーミーCookie設定を取得
    $remember_config = \Config::get('simpleauth.remember_me', []);
    
    // ------------------------------------------------------------------
    // 3. セッションCookie (fuelcid) の削除
    // ------------------------------------------------------------------
    \Cookie::delete(
        \Config::get('session.cookie.name', 'fuelcid'), 
        $session_config['path'] ?? '/',           
        $session_config['domain'] ?? null,        
        $session_config['secure'] ?? false        
    );
    
    // ------------------------------------------------------------------
    // 4. リメンバーミーCookieの削除 (SimpleAuthの設定を完全に利用)
    // ------------------------------------------------------------------
    \Cookie::delete(
        $remember_config['cookie_name'] ?? 'remember_me', // 名前
        $remember_config['cookie_path'] ?? '/',           // パス
        $remember_config['cookie_domain'] ?? null,
        $remember_config['cookie_secure'] ?? false
    );
    
    // セッションデータ自体を破棄
    \Session::destroy();

		return true;
	}

	/**
	 * 現在ログイン中のユーザー情報を取得
	 * @return array|null ユーザー情報またはnull（未ログイン時）
	 */
	public static function get_current_user_info()
	{
		if (!\Auth::check()) {
				return null;
		}
		
		try {
			// Auth情報から基本情報を取得
			$user_id  = \Auth::get_user_id()[1];
			$username = \Auth::get_screen_name();
			
			// ORMでユーザー情報を取得（emailなど追加情報のため）
			$user = static::find($user_id);
			
			if (!$user) {
				// データベースに該当ユーザーが見つからない場合
				return null;
			}
			
			return [
				'user_id'  => $user_id,
				'username' => $username,
				'email'    => $user->email,
			];
			
		} catch (\Exception $e) {
			// エラー時はnullを返す
			\Log::error('Failed to get current user info: ' . $e->getMessage());
			return null;
		}
	}

	/**
	 * ログイン状態確認
	 * @return bool ログイン中かどうか
	 */
	public static function is_logged_in()
	{
		return \Auth::check();
	}

	/**
	 * セッション情報を取得
	 * @return string|null 現在のセッションID
	 */
	public static function get_session_id()
	{
		return static::is_logged_in() ? \Session::key() : null;
	}
}
