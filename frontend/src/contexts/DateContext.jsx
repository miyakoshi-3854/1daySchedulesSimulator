/*
 * アプリケーション全体で日付の状態を管理するためのカスタムフックを提供します。
 *
 * 目的：
 * 1. 日付の状態（現在の日付）をグローバルに共有する。
 * 2. 日付を操作するための統一された関数（日、月の変更など）を提供する。
 * 3. コンポーネントツリーのどの場所からでも、これらの状態と関数に簡単にアクセスできるようにする。
 */
import React, { createContext, useContext, useState } from 'react';

// DateContextは、日付の状態を格納するためのコンテナとして機能します。
// これにより、コンポーネント間でpropsのバケツリレーをせずに済みます。
const DateContext = createContext();

/*
 * DateProvider
 * これでアプリケーションのルートコンポーネントをラップすることで、
 * 子孫コンポーネントすべてに日付の状態を提供できます。
 */
export const DateProvider = ({ children }) => {
  // useStateフックを使って、現在の日付を状態として管理します。
  const [currentDate, setCurrentDate] = useState(new Date());

  /*
   *現在の日付に状態をリセットする関数。
   */
  const goToToday = () => setCurrentDate(new Date());

  /*
   * 指定された日数だけ日付を変更する関数。
   */
  const changeDay = (days) => {
    // 状態を直接変更しないように、新しい日付オブジェクトを作成します。
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  /*
   * 指定された月数だけ日付を変更する関数。
   * この関数は、月末を正しく処理するためのロジックを含んでいます。
   */
  const changeMonth = (months) => {
    const newDate = new Date(currentDate);
    // 元の日付を保持しておき、月末調整の基準とします。
    const originalDay = currentDate.getDate();

    newDate.setMonth(currentDate.getMonth() + months);

    // 月の変更後に日付がずれた場合（例：1月31日から2月に移動した場合）、
    // その月の最終日に調整します。
    if (newDate.getDate() !== originalDay) {
      // newDate.setDate(0)は、前の月の最終日を意味します。
      // 例：3月3日 -> 2月3日 -> newDate.setDate(0) -> 1月31日
      // 3月31日 -> 4月31日(無効) -> newDate.setDate(0) -> 4月30日
      newDate.setDate(0);
    }

    setCurrentDate(newDate);
  };

  // Contextに提供するすべての状態と関数を一つのオブジェクトにまとめます。
  // これにより、利用する側は必要なものだけを分割代入で取り出せます。
  const value = {
    currentDate,
    goToToday,
    changeDay,
    changeMonth,
    // 頻繁に使用される操作のための便利なラッパー関数。
    goToPrevDay: () => changeDay(-1),
    goToNextDay: () => changeDay(1),
    goToPrevMonth: () => changeMonth(-1),
    goToNextMonth: () => changeMonth(1),
  };

  // Providerコンポーネントの役割は、valueオブジェクトを子コンポーネントに渡すことです。
  return <DateContext value={value}>{children}</DateContext>;
};

/*
 * useDateは、DateContextから値を読み取るためのカスタムフックです。
 * このフックを使用するコンポーネントは、必ずDateProviderの子である必要があります。
 */
export const useDate = () => {
  const context = useContext(DateContext);
  // Providerの外でフックが呼び出された場合に、開発者に警告するエラーをスローします。
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};
