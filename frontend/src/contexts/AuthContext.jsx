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
      // サービス層の関数を呼び出し、セッションに基づきユーザーデータを取得
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
    // サービス層のログインAPIを呼び出し、結果を受け取る
    const result = await loginAPI(email, password);

    if (result.success) {
      // ログイン成功: ユーザー情報とログイン状態を更新
      setUser(result.user);
      setIsLoggedIn(true);
      return { success: true };
    } else {
      // ログイン失敗: エラーメッセージを呼び出し元（フォーム）に返す
      return { success: false, message: result.message };
    }
  };

  // ====================================================================
  // 3. ログアウト関数 (logoutAPI を呼び出し)
  // ====================================================================
  const logout = async () => {
    // サービス層のログアウトAPIを呼び出す
    const success = await logoutAPI();

    if (success) {
      // ログアウト成功: 状態をリセット
      setUser(null);
      setIsLoggedIn(false);
      return true;
    }
    // ログアウトAPIが失敗した場合（例: サーバー通信エラー）
    return false;
  };

  // ====================================================================
  // 4. 新規ユーザー登録関数 (registerAPI を呼び出し)
  // ====================================================================
  const register = async (username, email, password) => {
    try {
      // サービス層の登録APIを呼び出し
      const result = await registerAPI(username, email, password);

      if (result.success) {
        // 登録成功: サーバー側で自動ログインされていることを想定し、状態を更新
        setUser(result.user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        // 登録失敗: エラーメッセージを呼び出し元に返す
        return { success: false, message: result.message };
      }
    } catch (error) {
      // 予期せぬエラー発生時
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
