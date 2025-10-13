import React, { createContext, useContext, useState, useEffect } from 'react';
// API通信サービスをインポート
import { checkAuthStatusAPI } from '../services/authService';

// Contextの作成
const AuthContext = createContext(null);

// カスタムフック
export const useAuth = () => useContext(AuthContext);

// プロバイダーコンポーネント
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ====================================================================
  // 1. 認証状態チェック関数 (checkAuthStatusAPI を呼び出し)
  // ====================================================================
  const checkAuthStatus = async () => {
    try {
      // API通信の代わりにサービス層の関数を呼び出す
      const userData = await checkAuthStatusAPI();

      if (userData) {
        // ユーザー情報が返ってきた場合 (ログイン済み)
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        // null が返ってきた場合 (未ログイン or エラー)
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      // サービス内で通信エラーは捕捉済みだが、念のため
      console.error('Auth check failed in Context:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
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
      {/* AuthContext に修正 */}
      {!isLoading ? children : <div>Loading authentication...</div>}
    </AuthContext>
  );
};
