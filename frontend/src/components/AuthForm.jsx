import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthForm = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ログインモードと登録モードの切り替え
  const [isLoginMode, setIsLoginMode] = useState(true);

  // AuthContextから login と register 関数を取得
  const { login, register } = useAuth();

  // モード切り替え時のエラーリセット
  const handleModeSwitch = (isLogin) => {
    setIsLoginMode(isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isRegister = !isLoginMode;

    // 1. ローカルバリデーション
    if (isRegister && !username) {
      // 新規登録時、ユーザー名が必須
      setError('ユーザー名は必須です。');
      return;
    }
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!email.includes('@') || email.length < 5) {
      setError('有効なメールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);
    let result;

    // 2. API実行 (モードで切り替え)
    if (isLoginMode) {
      result = await login(email, password);
    } else {
      result = await register(username, email, password);
    }

    // 3. 結果処理
    if (result.success) {
      onClose();
    } else {
      setError(
        result.message ||
          (isLoginMode ? 'ログインに失敗しました。' : '登録に失敗しました。')
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal">
      <form className="auth-form-content" onSubmit={handleSubmit} noValidate>
        {/* タブ部分 (切り替えロジックを修正) */}
        <div className="auth-tabs">
          <span
            className={isLoginMode ? 'active' : 'inactive'}
            onClick={() => handleModeSwitch(true)}
          >
            ログイン
          </span>
          <span
            className={!isLoginMode ? 'active' : 'inactive'}
            onClick={() => handleModeSwitch(false)}
          >
            新規登録
          </span>
        </div>

        {/* エラーメッセージの表示 */}
        {error && <p className="error-message">{error}</p>}

        {/* ユーザー名 (新規登録時のみ表示) */}
        {!isLoginMode && (
          <>
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </>
        )}

        {/* Email, Password の入力欄は変更なし */}
        <label htmlFor="email">email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <label htmlFor="password">password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />

        {/* ボタン群 (表示名をモードで切り替え) */}
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? '処理中...' : isLoginMode ? 'ログイン' : '登録'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            閉じる
          </button>
        </div>
      </form>
    </div>
  );
};
