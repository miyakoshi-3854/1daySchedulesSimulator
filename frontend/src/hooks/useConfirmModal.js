import { useState, useCallback } from 'react';

/**
 * 確認モーダル (ConfirmModal) の開閉状態と、
 * 確定時に実行するアクションを管理するためのカスタムフック。
 * * @returns {object} {
 * isModalOpen,            // モーダルが開いているか (boolean)
 * openModal,              // モーダルを開き、実行するアクションをセットする関数
 * closeModal,             // モーダルを閉じる関数
 * modalProps,             // ConfirmModal コンポーネントに渡す props (message, onConfirmなど)
 * }
 */
export const useConfirmModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({}); // メッセージや実行関数を保持

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalData({}); // データをリセット
  }, []);

  /**
   * モーダルを開き、実行ロジックをセットする
   * @param {string} message - 確認メッセージ
   * @param {function} onConfirmAction - 確定ボタンが押されたときに実行する関数
   * @param {boolean} isDestructive - 確定ボタンを赤色にするか
   */
  const openModal = useCallback(
    ({
      message,
      onConfirmAction,
      isDestructive = false,
      confirmText = '削除する',
    }) => {
      setModalData({ message, onConfirmAction, isDestructive, confirmText });
      setIsModalOpen(true);
    },
    []
  );

  // 確定ボタンが押されたときの処理
  const handleConfirm = useCallback(() => {
    if (modalData.onConfirmAction) {
      modalData.onConfirmAction(); // 実行
    }
    closeModal();
  }, [modalData, closeModal]);

  // ConfirmModal に渡す最終的な props
  const modalProps = {
    message: modalData.message,
    confirmText: modalData.confirmText,
    onConfirm: handleConfirm,
    onCancel: closeModal,
    isDestructive: modalData.isDestructive,
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    modalProps,
  };
};
