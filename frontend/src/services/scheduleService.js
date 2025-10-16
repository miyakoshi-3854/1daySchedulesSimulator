/*
 * scheduleService.js
 * バックエンドのスケジュール関連 API との通信ロジックを専門に扱うサービスファイル
 */

const API_BASE_URL = 'http://localhost:8080/api';

// --- ヘルパー関数: API実行 ---
const fetchApi = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // 認証Cookie必須
  });
  const data = await response.json();

  // エラーハンドリング: 400, 401, 500 などをチェック
  if (!response.ok || data.status === 'error') {
    const message =
      data.message || data.errors || 'API通信エラーが発生しました。';
    // 401 Unauthorized の場合は、Context側でログアウト処理を促すため、ステータスを返す
    return { success: false, message, status: response.status };
  }
  return { success: true, data: data.data };
};
