import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDate } from '../contexts/DateContext';
import { AuthForm } from './AuthForm';
import ko from 'knockout'; // 課題の条件： knockout.jsを使用する

/*
 * アプリケーションのヘッダーコンポーネント
 * 認証状態の表示、ログアウト、日付操作UI、Knockout.jsとの連携を担当
 */
export const Header = () => {
  // 1. Contextから必要な状態と関数を取得
  const { user, isLoggedIn, logout } = useAuth();
  const {
    currentDate,
    goToToday,
    goToPrevDay,
    goToNextDay,
    goToPrevMonth,
    goToNextMonth,
  } = useDate();

  // 2. モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ====================================================================
  // KNOCKOUT VIEW MODEL の作成と管理
  // ====================================================================
  // useMemoでVMを一度だけ作成し、依存関係が変更されない限り再利用
  const viewModel = useMemo(() => {
    // ReactのDateオブジェクトのタイムスタンプを監視可能な変数として定義
    const observableDate = ko.observable(currentDate.getTime());

    // UI表示用の整形された日付文字列を生成する算出プロパティ
    const displayDate = ko.pureComputed(() => {
      const date = new Date(observableDate()); // observableDateが更新されると再実行される
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('ja-JP', options);
    });

    // 月と年を結合して表示する算出プロパティ (例: 2025年10月)
    const displayMonthYear = ko.pureComputed(() => {
      const date = new Date(observableDate());
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    });

    return {
      observableDate,
      displayDate,
      displayMonthYear,
    };
  }, []);

  // 3. ReactのcurrentDateとKnockoutのobservableを同期
  useEffect(() => {
    // DateContextの値が変更されたら、Knockoutのobservableを新しいタイムスタンプで更新
    // これにより、日付の変更がDOMに反映されます
    viewModel.observableDate(currentDate.getTime());
  }, [currentDate, viewModel]);

  // 4. コンポーネントマウント時にKnockoutのバインディングを実行
  useEffect(() => {
    const element = document.getElementById('date-controls-container');

    // DOM要素が存在し、かつ二重バインドされていないかチェック
    if (element && !element.__ko_applied) {
      ko.applyBindings(viewModel, element); // DOM要素にViewModelを適用
      element.__ko_applied = true; // バインド済みフラグを設定し、二重実行を防止
    }

    // アンマウント時のクリーンアップ処理（今回は省略）
    // return () => { ko.cleanNode(element); };
  }, [viewModel]);

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

      {/* Knockout.jsが制御する日付操作コンテナ（バインディングターゲット） */}
      <div id="date-controls-container" className="date-controls">
        {/* 1. 「今日」ボタン - Reactで制御（Contextの関数を直接呼び出し） */}
        <button onClick={goToToday} className="btn-today">
          今日
        </button>

        {/* 2. 月の移動ボタンと表示 */}
        <span className="month-nav">
          {/* Reactで操作関数を呼び出すが、表示の更新はKnockoutが行う */}
          <button onClick={goToPrevMonth} className="btn-month-nav">
            &lt;
          </button>
          {/* ★Knockoutバインディング：displayMonthYearの値をテキストとして表示★ */}
          <span
            className="current-month-year"
            data-bind="text: displayMonthYear"
          >
            {/* この部分はKnockoutによって上書きされる */}
          </span>
          <button onClick={goToNextMonth} className="btn-month-nav">
            &gt;
          </button>
        </span>

        {/* 3. 日の移動と日付表示 (メイン) */}
        <span className="day-nav">
          <button onClick={goToPrevDay} className="btn-day-nav">
            &lt;
          </button>
          {/* ★Knockoutバインディング：displayDateの値をテキストとして表示★ */}
          <h2 className="current-day-display" data-bind="text: displayDate">
            {/* この部分もKnockoutによって上書きされる */}
          </h2>
          <button onClick={goToNextDay} className="btn-day-nav">
            &gt;
          </button>
        </span>
      </div>

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

      {/* AuthForm モーダルの表示（isModalOpenがtrueのときのみレンダリング） */}
      {isModalOpen && (
        <div className="modal-overlay">
          {/* AuthForm に onClose 関数を渡し、成功時や閉じるボタンでモーダルを閉じる */}
          <AuthForm onClose={() => setIsModalOpen(false)} />
        </div>
      )}
    </header>
  );
};
