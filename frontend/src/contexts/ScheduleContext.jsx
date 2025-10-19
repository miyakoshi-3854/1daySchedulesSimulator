/*
 * スケージュールのCRUDを担当するカスタムフックを提供します。
 *
 * 目的：
 * 1. 認証状態と日付状態の両方を監視し、データロードをトリガーします。
 * 2. ログイン済みの場合のみ API を叩くようにし、セキュリティと効率を確保します。
 * 3. データの取得が完了した後、CRUD操作の結果に応じてデータを自動で再ロードします。
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext'; // 認証状態
import { useDate } from './DateContext'; // 日付情報
import * as scheduleService from '../services/scheduleService'; // サービス
import { formatDate } from '../utils/dateUtils';

const ScheduleContext = createContext(null);

export const useSchedule = () => useContext(ScheduleContext);

/*
 * スケジュールデータとCRUDロジックを提供するプロバイダーコンポーネント
 */
export const ScheduleContextProvider = ({ children }) => {
  const { isLoggedIn, logout } = useAuth(); // 認証コンテキスト
  const { currentDate } = useDate(); // 日付コンテキスト

  // スケジュールデータ
  const [schedules, setSchedules] = useState([]);
  // カレンダーハイライト用日付リスト
  const [highlightDates, setHighlightDates] = useState([]);
  // カテゴリーデータ (フォーム用)
  const [categories, setCategories] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  // 編集・新規登録の状態管理
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // ------------------------------------------------------------------
  // 1. API データロード関数
  // ------------------------------------------------------------------

  // 選択された日付のスケジュールと、ハイライト日付をロードする関数
  const loadScheduleData = useCallback(
    async (date) => {
      if (!isLoggedIn) return; // 未ログイン時はロードしない

      setIsDataLoading(true); // ロード開始

      // 1. 詳細スケジュールをロード
      const formattedDate = formatDate(date); // YYYY-MM-DD 形式
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
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const startOfMonthStr = formatDate(startOfMonth);
      const endOfMonthStr = formatDate(endOfMonth);

      const highlightResult = await scheduleService.loadHighlightDatesAPI(
        startOfMonthStr,
        endOfMonthStr
      );
      if (highlightResult.success) {
        // ハイライト日付リストを更新
        setHighlightDates(highlightResult.data.highlight_dates || []);
      }

      setIsDataLoading(false); // ロード終了
    },
    [isLoggedIn, logout]
  ); // 認証状態の変更で再作成

  // カテゴリーデータをロードする関数 (初回のみ)
  // useCallbackでメモ化し、useEffectの依存配列に入れることで関数の安定性を確保
  const loadCategories = useCallback(async () => {
    const result = await scheduleService.loadCategoriesAPI();
    if (result.success) {
      setCategories(result.data); // カテゴリーデータを状態にセット
    }
  }, []);

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

  // スケジュール更新
  const updateSchedule = async (id, data) => {
    const result = await scheduleService.updateScheduleAPI(id, data);
    if (result.success) {
      reloadSchedules();
    }
    return result;
  };

  // スケジュール削除
  const deleteSchedule = async (id) => {
    const result = await scheduleService.deleteScheduleAPI(id);
    if (result.success) {
      reloadSchedules();
    }
    return result;
  };

  /**
   * 【新規実装】読み込み中の日付のスケジュールを全て削除する
   */
  const deleteAllSchedules = async () => {
    // 現在読み込まれているスケジュールデータを使用
    const schedulesToDelete = schedules || [];

    if (schedulesToDelete.length === 0) {
      console.log('削除対象のスケジュールはありません。');
      return { success: true };
    }

    // 削除処理の実行
    try {
      const deletePromises = schedulesToDelete.map((schedule) =>
        // 個別の削除関数 (deleteSchedule) を並列実行 (Promise.all)
        deleteSchedule(schedule.id)
      );

      const results = await Promise.all(deletePromises);

      // 全て成功したかチェック（ここでは単純にPromise.allの成功で判断）
      const allSuccess = results.every((result) => result && result.success);

      if (allSuccess) {
        // 削除が完了したら、カレンダーデータを再読み込み
        reloadSchedules(); // reloadSchedules() は getSchedules を再度実行する関数と仮定
        return { success: true };
      } else {
        // 一部失敗した場合の処理
        return {
          success: false,
          message: '一部のスケジュールの削除に失敗しました。',
        };
      }
    } catch (error) {
      console.error('一括削除中にエラーが発生しました:', error);
      return {
        success: false,
        message: 'サーバーエラーにより一括削除が完了できませんでした。',
      };
    }
  };

  // ------------------------------------------------------------------
  // ★追加: 編集・新規追加モードの制御関数
  // ------------------------------------------------------------------

  // 【編集開始】ScheduleListやTimeGraphが呼び出す
  const startEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsAddingNew(false); // 編集開始時は新規追加モードをオフ
  };

  // 【新規開始】ScheduleListの「予定追加+」ボタンが呼び出す
  const startAdd = () => {
    setEditingSchedule(null); // 編集データはリセット
    setIsAddingNew(true); // 新規追加モードをオン
  };

  // 【フォーム完了/キャンセル】ScheduleFormが呼び出す
  const endForm = () => {
    setEditingSchedule(null); // 編集データをリセット
    setIsAddingNew(false); // 新規追加モードをオフ
  };

  // Contextを通じて提供する全ての状態と関数をまとめたオブジェクト
  const value = useMemo(
    () => ({
      schedules,
      highlightDates,
      categories,
      isDataLoading,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      deleteAllSchedules,
      reloadSchedules,
      editingSchedule, // 現在編集中のデータ (null または Scheduleオブジェクト)
      isAddingNew, // 新規追加モードかどうか (boolean)
      startEdit, // 編集開始トリガー
      startAdd, // 新規開始トリガー
      endForm, // フォーム終了トリガー
    }),
    // ★依存配列の修正★: Stateと関数を含める
    [
      schedules,
      highlightDates,
      categories,
      isDataLoading,
      editingSchedule,
      isAddingNew,
      // 関数は useCallback でラップされているため、依存配列に入れる必要はないが、
      // 厳密に全ての依存関係を列挙するのがベストプラクティス
      addSchedule,
      updateSchedule,
      deleteSchedule,
      deleteAllSchedules,
      reloadSchedules,
      startEdit,
      startAdd,
      endForm,
    ]
  );

  return <ScheduleContext value={value}>{children}</ScheduleContext>;
};
