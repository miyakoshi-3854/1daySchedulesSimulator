/*
 * AuthForm.jsx
 * 認証フォームコンポーネント
 *
 * 目的：
 * 1. ユーザー認証（ログイン/登録）のためのフォームを提供する。
 * 2. 認証状態をグローバルに共有するContext（AuthContext）と連携し、
 *    認証関連のロジックを分離する。
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/AuthForm.module.css';

/**
 * ログインおよび新規登録フォームコンポーネント
 * @param {object} props.onClose - フォーム（モーダル）を閉じるための関数
 */
export const AuthForm = ({ onClose }) => {
  // --- 1. フォームの状態管理 ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ログインモード(true)と登録モード(false)の切り替え状態
  const [isLoginMode, setIsLoginMode] = useState(true);

  // AuthContextから login と register 関数を取得
  const { login, register } = useAuth();

  // モード切り替え時の処理（タブクリック時）
  const handleModeSwitch = (isLogin) => {
    setIsLoginMode(isLogin);
    setError('');
  };

  // --- 2. フォーム送信ハンドラ ---
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
      // どちらのモードでも、EmailとPasswordは必須
      setError('Email and password are required.');
      return;
    }
    // 簡易的なメールアドレス形式チェック
    if (!email.includes('@') || email.length < 5) {
      setError('有効なメールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);
    let result;

    // 2. API実行 (モードで切り替え)
    if (isLoginMode) {
      // ログインモードの場合、AuthContextの login 関数を実行
      result = await login(email, password);
    } else {
      // 新規登録モードの場合、AuthContextの register 関数を実行
      result = await register(username, email, password);
    }

    // 3. 結果処理
    if (result.success) {
      // 成功: 認証状態が更新されたので、モーダルを閉じる
      onClose();
    } else {
      // 失敗: エラーメッセージを設定
      setError(
        result.message ||
          (isLoginMode ? 'ログインに失敗しました。' : '登録に失敗しました。')
      );
      setIsSubmitting(false);
    }
  };

  // --- 3. レンダリング ---
  return (
    <div className={styles.authModal}>
      <form
        className={styles.authFormContent}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* タブ部分 (モード切り替えUI) */}
        <div className={styles.authTabs}>
          <span
            className={`${styles.authTab} ${isLoginMode ? styles.active : ''}`}
            onClick={() => handleModeSwitch(true)}
          >
            ログイン
          </span>
          <span
            className={`${styles.authTab} ${!isLoginMode ? styles.active : ''}`}
            onClick={() => handleModeSwitch(false)}
          >
            新規登録
          </span>
        </div>

        {/* エラーメッセージの表示 */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* ユーザー名 (新規登録時のみ表示) */}
        {!isLoginMode && (
          <>
            <label htmlFor="username" className={styles.label}>
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </>
        )}

        {/* Email 入力欄 */}
        <label htmlFor="email" className={styles.label}>
          email
        </label>
        <input
          id="email"
          type="email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />

        {/* Password 入力欄 */}
        <label htmlFor="password" className={styles.label}>
          password
        </label>
        <input
          id="password"
          type="password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />

        {/* ボタン群 (表示名をモードで切り替え) */}
        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? '処理中...' : isLoginMode ? 'ログイン' : '登録'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            閉じる
          </button>
        </div>
      </form>
    </div>
  );
};
