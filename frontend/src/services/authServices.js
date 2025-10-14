/*
 * authService.js
 * ユーザー認証に関するバックエンドAPIとの通信ロジックを専門に扱うサービスファイル
 */

// APIのベースURLを定義
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * 認証状態をチェックし、ユーザー情報を取得する (GET /api/me)
 * @returns {Promise<object|null>} ログイン済みのユーザー情報、またはnull
 */
export const checkAuthStatusAPI = async () => {
  try {
    // /api/meエンドポイントに対してGETリクエストを送信
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      // Cookie（セッションIDなど）をリクエストに含めるために必要
      credentials: 'include',
    });

    if (!response.ok) {
      // HTTP 401 Unauthorized などはここで捕捉
      return null;
    }

    // レスポンスボディをJSONとして解析
    const data = await response.json();

    // 成功ステータスで logged_in: true の場合のみユーザー情報を返す
    if (data.status === 'success' && data.data.logged_in === true) {
      // ログイン済みの場合、ユーザー情報オブジェクトをContext層に返す
      return data.data; // { user_id, username, email, logged_in: true, ... }
    } else {
      // レスポンスが成功でも logged_in が false の場合（未ログイン）
      return null;
    }
  } catch (error) {
    // ネットワーク接続や予期せぬエラーが発生した場合
    console.error('Auth check failed (Service):', error);
    // 通信エラーの場合は未認証として扱う
    return null;
  }
};

/**
 * ユーザーをログインさせる (POST /api/login)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} 成功時はユーザー情報、失敗時はエラーオブジェクト
 */
export const loginAPI = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // FuelPHPのInput::post()に対応
    },
    body: new URLSearchParams({ email, password }), // URLSearchParamsでフォームデータ形式に変換
  });

  const data = await response.json();

  if (response.ok && data.status === 'success') {
    return { success: true, user: data.data }; // 成功
  } else {
    // APIからのエラーメッセージをそのまま返す
    return { success: false, message: data.message || 'Login failed' };
  }
};

/**
 * ユーザーをログアウトさせる (POST /api/logout)
 * @returns {Promise<boolean>} 成功/失敗
 */
export const logoutAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // ログアウトAPIは成功ステータス（200または204）であればOKと見なす
    return response.ok;
  } catch (error) {
    console.error('Logout API failed:', error);
    return false;
  }
};

/**
 * ユーザーを新規登録するAPIを呼び出す
 * @param {string} username - ユーザー名
 * @param {string} email - Eメールアドレス
 * @param {string} password - パスワード
 * @returns {Promise<{success: boolean, message: string, user: object}>}
 */
export const registerAPI = async (username, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    // 200 OKの場合、成功
    if (response.ok) {
      const data = await response.json();
      // 登録成功と同時にログイン状態になることを想定
      return { success: true, user: data.data };
    }

    // 400 Bad Request などのエラー処理
    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || '登録に失敗しました。',
    };
  } catch (error) {
    console.error('Registration API error:', error);
    return { success: false, message: 'ネットワークエラーが発生しました。' };
  }
};
