import React from 'react';
import styles from '../styles/ConfirmModal.module.css';

export const ConfirmModal = ({
  message,
  confirmText,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  // 汎用 ConfirmModal の UI を作成します
  const confirmButtonClass = isDestructive ? 'btn-danger' : 'btn-primary';

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
