/*
 * confirmModal.jsx
 * スケジュール削除時に表示されるモーダル
 *
 * 目的：
 * 1. ユーザーが間違いで削除することを防ぐ
 */
import styles from '../styles/ConfirmModal.module.css';

export const ConfirmModal = ({ message, confirmText, onConfirm, onCancel }) => {
  return (
    <div
      className="modal-overlay"
      onClick={onCancel /* 外側クリックで閉じる */}
    >
      <div className={styles.modalContent}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className="btn" onClick={onCancel}>
            キャンセル
          </button>
          <button className="btn btn-secondary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
