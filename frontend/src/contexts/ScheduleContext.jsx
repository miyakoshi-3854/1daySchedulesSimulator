/*
 * スケージュールのCRUDを担当するカスタムフックを提供します。
 *
 * 目的：
 * 1. 認証状態と日付状態の両方を監視し、データロードをトリガーします。
 * 2. ログイン済みの場合のみ API を叩くようにします。
 * 3. データの取得が完了した後、CRUD操作が実行されます。
 */
import { createContext, useContext } from 'react';

const ScheduleContext = createContext(null);

export const useSchedule = () => useContext(ScheduleContext);
