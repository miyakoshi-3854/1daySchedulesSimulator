/*
 * ScheduleList.jsx
 * スケジュール一覧表示コンポーネント
 *
 * 目的：
 * 1. 選択している日付のスケジュール一覧を表示する。
 * 2. スケジュールを編集、削除する導線になる。
 */
import { useDate } from '../contexts/DateContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirmModal } from '../hooks/useConfirmModal'; // ★カスタムフックをインポート
import { ConfirmModal } from './ConfirmModal';
import styles from '../styles/ScheduleList.module.css';

export const ScheduleList = () => {
  // 1. Contextからデータと状態を取得
  const { schedules, isDataLoading, deleteSchedule, deleteAllSchedules } =
    useSchedule();
  const { formattedDate } = useDate();
  const { isLoggedIn } = useAuth();

  // 2. カスタムフックからモーダル制御を取得
  const { isModalOpen, openModal, modalProps } = useConfirmModal();

  // スケジュールデータがなければ、空の配列を確保
  const schedulesForSelectedDay = schedules || [];

  // --- 削除ハンドラ ---
  const handleDelete = (schedule) => {
    // 削除実行ロジックをラップする関数を定義
    const deleteAction = async () => {
      const result = await deleteSchedule(schedule.id);
      if (!result.success) {
        // エラーメッセージはモーダルが閉じるときにアラートなどで表示しても良い
        console.error('削除に失敗しました:', result.message);
        alert('スケジュールの削除に失敗しました。');
      }
    };

    // 確認モーダルを開く
    openModal({
      message: `「${schedule.title}」を本当に削除しますか？`,
      confirmText: '削除する',
      onConfirmAction: deleteAction, // 実行すべき関数を渡す
      isDestructive: true,
    });
  };

  // ------------------------------------------------------------------
  // レンダリング
  // ------------------------------------------------------------------
  return (
    <div className={styles.scheduleListContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>予定一覧</h2>
      </div>

      {isDataLoading && <p className={styles.loading}>予定を読み込み中...</p>}

      <div className={styles.listBody}>
        {schedulesForSelectedDay.length === 0 && !isDataLoading ? (
          <p className={styles.noData}>予定はありません。</p>
        ) : (
          schedulesForSelectedDay.map((schedule) => (
            <div key={schedule.id} className={styles.scheduleItem}>
              {/* 色マーカー */}
              <div
                className={styles.colorMarker}
                style={{
                  backgroundColor:
                    schedule.color || 'var(--color-schedule-default)',
                }}
              ></div>

              {/* 予定名と時間 */}
              <div className={styles.details}>
                <span className={styles.scheduleTitle}>{schedule.title}</span>
                <span className={styles.scheduleTime}>
                  {schedule.start_time.substring(0, 5)} ~{' '}
                  {schedule.end_time.substring(0, 5)}
                </span>
              </div>

              {/* 編集・削除ボタン (ログイン時のみ表示) */}
              {isLoggedIn && (
                <div className={styles.actions}>
                  <button
                    className={`btn ${styles.btnEdit}`}
                    onClick={() => {
                      /* 編集モーダルを開くロジック */
                    }}
                  >
                    編集
                  </button>
                  <button
                    className={`btn ${styles.btnDelete}`}
                    onClick={() => handleDelete(schedule)} // ★カスタムモーダルを呼び出す
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 予定追加ボタン (ScheduleForm コンポーネントへの導線) */}
      {isLoggedIn && (
        <div className={styles.listActions}>
          {' '}
          {/* 新しいコンテナを追加 */}
          {/* 予定追加+ ボタン */}
          <button className={`btn ${styles.btnAddSchedule}`}>予定追加 +</button>
          {/* 全て削除 ボタン */}
          <button
            className={`btn ${styles.btnDeleteAll}`}
            onClick={() =>
              openModal({
                message:
                  'この日のスケジュールを全て削除します。よろしいですか？',
                confirmText: '全て削除',
                // onConfirmAction で deleteAllSchedules を実行
                onConfirmAction: async () => {
                  const result = await deleteAllSchedules();
                  if (!result.success) {
                    alert(result.message);
                  }
                },
                isDestructive: true,
              })
            }
          >
            全て削除
          </button>
        </div>
      )}

      {/* ★汎用確認モーダルのレンダリング★ */}
      {isModalOpen && <ConfirmModal {...modalProps} />}
    </div>
  );
};
