import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // APIのエンドポイント
  const API_BASE_URL = 'http://localhost:8080/api'; // お使いのAPIのベースURLに合わせて調整してください

  // ====================================================================
  // 1. 認証状態チェック関数 (GET /api/me)
  // ====================================================================
  const checkAuthStatus = async () => {
    try {
      // 認証Cookieを送るため、credentials: 'include' は必須です
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // HTTPステータスが200以外 (例: 401 Unauthorized) の場合
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();

      // バックエンドAPIのレスポンス形式を信頼: { status: "success", data: { logged_in: true/false, ...user_info } }
      if (data.status === 'success' && data.data.logged_in === true) {
        // ログイン済みの場合、状態を更新
        setUser(data.data);
        setIsLoggedIn(true);
      } else {
        // 未ログインの場合、状態をリセット
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // 通信エラーやサーバーエラーが発生した場合も未ログインとして扱う
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      // 認証チェックが完了したため、ローディングを終了
      setIsLoading(false);
    }
  };

  // 【初期化処理】: コンポーネントマウント時に実行
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 公開する値と関数
  const value = {
    user,
    isLoggedIn,
    isLoading,
    login: async () => {}, // 実装予定
    logout: async () => {}, // 実装予定
    register: async () => {}, // 実装予定
  };

  return (
    <AuthContext value={value}>
      {/* ローディング完了後のみ子コンポーネントを表示 */}
      {!isLoading ? children : <div>Loading authentication...</div>}
    </AuthContext>
  );
};
