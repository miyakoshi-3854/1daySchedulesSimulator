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
import {
  checkAuthStatusAPI,
  loginAPI,
  logoutAPI,
  registerAPI,
} from '../services/authServices';

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

  // ====================================================================
  // 2. ログイン関数 (loginAPI を呼び出し)
  // ====================================================================
  const login = async (email, password) => {
    const result = await loginAPI(email, password);

    if (result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      return { success: true };
    } else {
      // エラーメッセージを AuthForm に返す
      return { success: false, message: result.message };
    }
  };

  // ====================================================================
  // 3. ログアウト関数 (logoutAPI を呼び出し)
  // ====================================================================
  const logout = async () => {
    const success = await logoutAPI();

    if (success) {
      // 状態をリセット
      setUser(null);
      setIsLoggedIn(false);
      // ログアウト後のページ遷移はコンポーネント側で行うのが一般的
      return true;
    }
    return false;
  };

  /**
   * 新規登録を行い、成功時にログイン状態にする
   */
  const register = async (username, email, password) => {
    try {
      const result = await registerAPI(username, email, password);

      if (result.success) {
        // 登録成功と同時にログイン状態へ更新
        setUser(result.user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: '予期せぬエラーが発生しました。' };
    }
  };

  // 公開する値と関数
  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus,
  };

  return (
    <AuthContext value={value}>
      {/* ローディング完了（isLoadingがfalse）後のみ子コンポーネントを描画 */}
      {/* これにより、認証チェックが完了するまでの不完全なUI表示を防ぐ */}
      {!isLoading ? children : <div>Loading authentication...</div>}
    </AuthContext>
  );
};
