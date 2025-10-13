/*
 * 認証状態を管理するためのカスタムフックを提供します。
 *
 * 目的：
 * 1. 認証状態をグローバルに共有する。
 * 2. 認証状態を操作するための統一された関数（ログイン、ログアウト、登録）を提供する。
 * 3. コンポーネントツリーのどの場所からでも、これらの状態と関数に簡単にアクセスできるようにする。
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
// API通信サービスをインポート
import { checkAuthStatusAPI } from '../services/authService';

// Contextの作成
const AuthContext = createContext(null);

// カスタムフック
export const useAuth = () => useContext(AuthContext);

/*
 * AuthContextProvider
 * これでアプリケーションのルートコンポーナントをラップすることで、
 * 子孫コンポーネントすべてに認証状態を提供できます。
 */
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
      // サービス層で捕捉しきれなかった予期せぬエラーが発生した場合の最終的な処理
      console.error('Auth check failed in Context:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      // 処理結果（成功・失敗にかかわらず）に関わらず、ローディング状態を終了
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
      {/* ローディング完了（isLoadingがfalse）後のみ子コンポーネントを描画 */}
      {/* これにより、認証チェックが完了するまでの不完全なUI表示を防ぐ */}
      {!isLoading ? children : <div>Loading authentication...</div>}
    </AuthContext>
  );
};
