const API_BASE_URL = 'http://localhost:8080/api';

/**
 * 認証状態をチェックし、ユーザー情報を取得する (GET /api/me)
 * @returns {Promise<object|null>} ログイン済みのユーザー情報、またはnull
 */
export const checkAuthStatusAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      credentials: 'include', // Cookieを送信
    });

    if (!response.ok) {
      // HTTP 401 Unauthorized などはここで捕捉
      return null;
    }

    const data = await response.json();

    // 成功ステータスで logged_in: true の場合のみユーザー情報を返す
    if (data.status === 'success' && data.data.logged_in === true) {
      return data.data; // { user_id, username, email, logged_in: true, ... }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Auth check failed (Service):', error);
    // 通信エラーの場合は未認証として扱う
    return null;
  }
};
