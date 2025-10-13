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
