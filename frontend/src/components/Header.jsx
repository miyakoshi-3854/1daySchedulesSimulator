import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from './AuthForm'; // 作成したAuthFormをインポート

export const Header = () => {
  // 1. AuthContextから必要な状態と関数を取得
  const { user, isLoggedIn, logout } = useAuth();

  // 2. モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // モーダルを開く
  const handleAuthClick = () => {
    setIsModalOpen(true);
  };

  // ログアウト処理
  const handleLogout = () => {
    logout(); // AuthContextのログアウト関数を実行
    // ログアウト後の画面遷移などはここに追加
  };

  return (
    <header className="app-header">
      <div className="logo">スケジュール シュミレーター</div>

      {/* 画面右側の認証UI */}
      <div className="auth-status-area">
        {isLoggedIn ? (
          // 認証済みの場合
          <div className="user-info">
            <span>ようこそ, {user?.username || 'ユーザー'}さん</span>
            <button onClick={handleLogout} className="btn-logout">
              ログアウト
            </button>
          </div>
        ) : (
          // 未認証の場合
          <button onClick={handleAuthClick} className="btn-login-register">
            ログイン / 新規登録
          </button>
        )}
      </div>

      {/* AuthForm モーダルの表示 */}
      {isModalOpen && (
        <div className="modal-overlay">
          {/* AuthForm に onClose 関数を渡し、成功時や閉じるボタンでモーダルを閉じる */}
          <AuthForm onClose={() => setIsModalOpen(false)} />
        </div>
      )}
    </header>
  );
};
