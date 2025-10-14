import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // AuthContextからロジックを取得

// propsとしてモーダルを閉じる関数を受け取ることを想定
export const AuthForm = ({ onClose }) => {
  // --- 1. フォームの状態管理 ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 多重送信防止

  // ログインモードと登録モードの切り替え (今回はログインに固定)
  const [isLoginMode, setIsLoginMode] = useState(true);

  // AuthContextから login 関数を取得
  const { login } = useAuth();

  // --- 2. フォーム送信ハンドラ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. 必須項目のチェック (ここで空文字は捕捉される)
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    // 2. メールアドレス形式のチェック
    if (!email.includes('@') || email.length < 5) {
      setError('有効なメールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);

    // ログインAPIの実行
    const result = await login(email, password);

    if (result.success) {
      // ログイン成功: モーダルを閉じる
      onClose();
    } else {
      // ログイン失敗: エラーメッセージを表示
      setError(result.message || 'ログインに失敗しました。');
      setIsSubmitting(false); // 再度送信できるようにする
    }
  };

  // --- 3. レンダリング ---
  return (
    // モーダル背景やコンテナは Header コンポーネント側で実装することを想定
    <div className="auth-modal">
      <form className="auth-form-content" onSubmit={handleSubmit} noValidate>
        {/* ログイン/新規登録のタブ部分 */}
        <div className="auth-tabs">
          <span
            className={isLoginMode ? 'active' : 'inactive'}
            onClick={() => setIsLoginMode(true)}
            // スタイルはCSSで実装
          >
            ログイン
          </span>
          <span
            className={!isLoginMode ? 'active' : 'inactive'}
            onClick={() => setIsLoginMode(false)}
            // 今回はログインのみなのでボタンは機能しない
          >
            新規登録
          </span>
        </div>

        {/* エラーメッセージの表示 */}
        {error && <p className="error-message">{error}</p>}

        {/* ユーザー名は新規登録時のみ表示（今回は省略） */}

        {/* Email */}
        <label htmlFor="email">email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />

        {/* Password */}
        <label htmlFor="password">password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />

        {/* ボタン群 */}
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? '処理中...' : 'ログイン'}
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
