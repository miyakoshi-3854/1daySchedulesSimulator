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

// ======================================================================
// API通信関数
// ======================================================================

/**
 * 選択された期間のハイライト日付リストを取得 (GET /api/schedules/dates)
 */
export const loadHighlightDatesAPI = async (startDate, endDate) => {
  const url = `${API_BASE_URL}/schedules/dates?start_date=${startDate}&end_date=${endDate}`;
  const result = await fetchApi(url);

  // { success: true, data: { highlight_dates: [...] } } の形式で返る
  return result;
};

/**
 * 選択された日付の詳細なスケジュールリストを取得 (GET /api/schedules)
 */
export const loadSchedulesAPI = async (date) => {
  // 日付のみでスケジュール一覧を取得
  const url = `${API_BASE_URL}/schedules?date=${date}`;
  return await fetchApi(url);
};

/**
 * 新しいスケジュールを登録する (POST /api/schedules)
 */
export const addScheduleAPI = async (scheduleData) => {
  // FuelPHPがJSONを受け取れるよう、Content-TypeとJSON.stringifyを使用
  return await fetchApi(`${API_BASE_URL}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
};

/**
 * 既存のスケジュールを更新する (PUT /api/schedules/{id})
 */
export const updateScheduleAPI = async (id, scheduleData) => {
  // FuelPHPがJSONを受け取れるよう、Content-TypeとJSON.stringifyを使用
  return await fetchApi(`${API_BASE_URL}/schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
};
