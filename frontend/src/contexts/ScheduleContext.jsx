/*
 * スケージュールのCRUDを担当するカスタムフックを提供します。
 *
 * 目的：
 * 1. 認証状態と日付状態の両方を監視し、データロードをトリガーします。
 * 2. ログイン済みの場合のみ API を叩くようにします。
 * 3. データの取得が完了した後、CRUD操作が実行されます。
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext'; // 認証状態
import { useDate } from './DateContext'; // 日付情報
import * as scheduleService from '../services/scheduleService'; // サービス

const ScheduleContext = createContext(null);

export const useSchedule = () => useContext(ScheduleContext);

export const ScheduleContextProvider = ({ children }) => {
  const { isLoggedIn, logout, user } = useAuth(); // 認証コンテキスト
  const { currentDate, changeMonth } = useDate(); // 日付コンテキスト

  // スケジュールデータ
  const [schedules, setSchedules] = useState([]);
  // カレンダーハイライト用日付リスト
  const [highlightDates, setHighlightDates] = useState([]);
  // カテゴリーデータ (フォーム用)
  const [categories, setCategories] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // ------------------------------------------------------------------
  // 1. API データロード関数
  // ------------------------------------------------------------------

  // 選択された日付のスケジュールと、ハイライト日付をロードする関数
  const loadScheduleData = useCallback(
    async (date) => {
      if (!isLoggedIn) return; // 未ログイン時はロードしない

      setIsDataLoading(true);

      // 1. 詳細スケジュールをロード
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 形式
      const scheduleResult = await scheduleService.loadSchedulesAPI(
        formattedDate
      );

      if (scheduleResult.success) {
        setSchedules(scheduleResult.data);
      } else if (scheduleResult.status === 401) {
        // 認証切れの場合、ログアウト処理を促す
        logout();
      }

      // 2. ハイライト日付をロード (カレンダーUI用)
      // ここでは、現在表示されている月のハイライトを取得する必要がある
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const highlightResult = await scheduleService.loadHighlightDatesAPI(
        startOfMonth,
        endOfMonth
      );
      if (highlightResult.success) {
        setHighlightDates(highlightResult.data.highlight_dates || []);
      }

      setIsDataLoading(false);
    },
    [isLoggedIn, logout]
  ); // 認証状態の変更で再作成

  // ------------------------------------------------------------------
  // 2. ライフサイクル/監視
  // ------------------------------------------------------------------

  // 【監視】日付、認証状態の変更を監視し、スケジュールデータをリロード
  useEffect(() => {
    // currentDate が変更されるたび、またはログイン状態が true になるたびにロード
    loadScheduleData(currentDate);
  }, [currentDate, isLoggedIn, loadScheduleData]);

  // 【初回ロード】カテゴリーデータのロード
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ------------------------------------------------------------------
  // 3. CRUD 公開関数
  // ------------------------------------------------------------------

  // CRUD操作後、スケジュールを再ロードするためのヘルパー
  const reloadSchedules = () => loadScheduleData(currentDate);

  // スケジュール追加
  const addSchedule = async (data) => {
    const result = await scheduleService.addScheduleAPI(data);
    if (result.success) {
      reloadSchedules();
    }
    return result;
  };
};
