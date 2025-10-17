/*
 * Calendar.jsx
 * カレンダーコンポーネント
 *
 * 目的：
 * 1. 選択日の年月を表示する。
 * 2. 選択可能な日付グリッドを表示する。
 * 3. スケージュールが存在する日は水色背景、選択されている日付は白色で強調する。
 */
import React, { useMemo, useCallback } from 'react';
import { useDate } from '../contexts/DateContext';
import { useSchedule } from '../contexts/ScheduleContext'; // スケジュールデータ用
import { formatDate } from '../utils/dateUtils';
import styles from '../styles/Calendar.module.css';

export const Calendar = () => {
  const { currentDate, goToPrevMonth, goToNextMonth, setTargetDate } =
    useDate();
  const { highlightDates } = useSchedule(); // スケジュールコンテキストからハイライト日付を取得

  // 表示中の月（currentDateを基に1日のDateオブジェクトを作成）
  const displayMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // 曜日の表示（日曜日スタート）
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // ==========================================================
  // 日付グリッド生成ロジック (機能 3)
  // ==========================================================
  const calendarDays = useMemo(() => {
    const days = [];
    // 1. 月の開始日と最終日
    const monthStartDayOfWeek = displayMonth.getDay(); // 0 (日曜日) - 6 (土曜日)
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    // 2. 前月の日付の補い
    const prevMonthDaysToShow = monthStartDayOfWeek; // 1日の曜日に応じて前の月を表示する日数
    const prevMonthLastDate = new Date(displayMonth);
    prevMonthLastDate.setDate(0); // 前月の最終日

    for (let i = prevMonthDaysToShow; i > 0; i--) {
      const date = new Date(prevMonthLastDate);
      date.setDate(prevMonthLastDate.getDate() - i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // 3. 当月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(displayMonth);
      date.setDate(i);
      days.push({ date, isCurrentMonth: true });
    }

    // 4. 次月の日付の補い (6行目を満たすまで)
    const totalCells = 6 * 7; // 6週間 * 7日 = 42マス
    const nextMonthDaysToShow = totalCells - days.length;

    for (let i = 1; i <= nextMonthDaysToShow; i++) {
      const date = new Date(displayMonth);
      date.setMonth(displayMonth.getMonth() + 1); // 次の月に移動
      date.setDate(i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentDate, displayMonth]);
  // ==========================================================

  // 日付クリックハンドラ (選択日の変更)
  const handleDayClick = useCallback(
    (date) => {
      // Contextの関数を直接呼び出し、クリックされた日の Date オブジェクトを渡す
      setTargetDate(date);
    },
    [setTargetDate]
  ); // 依存配列も setTargetDate のみで十分

  return (
    <div className={styles.calendarContainer}>
      {/* 1. 年月と月切り替えボタン */}
      <div className={styles.calendarHeader}>
        <h2>
          {displayMonth.getFullYear()}年 {displayMonth.getMonth() + 1}月
        </h2>
        <div className={styles.monthNav}>
          <button onClick={goToPrevMonth} className={styles.btnMonthNav}>
            &laquo;
          </button>
          <button onClick={goToNextMonth} className={styles.btnMonthNav}>
            &raquo;
          </button>
        </div>
      </div>

      {/* 2. 曜日と日付グリッド */}
      <div className={styles.calendarGrid}>
        {/* 曜日表示 */}
        {weekdays.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}

        {/* 日付表示 (機能 3, 4) */}
        {calendarDays.map((day, index) => {
          const isSelected = formatDate(day.date) === formatDate(currentDate);
          const isHighlighted = highlightDates.includes(formatDate(day.date));

          // 日付セルに適用するクラス名
          let cellClasses = styles.dayCell;
          if (!day.isCurrentMonth) cellClasses += ` ${styles.otherMonth}`;
          if (isHighlighted) cellClasses += ` ${styles.highlighted}`;
          if (isSelected) cellClasses += ` ${styles.selected}`;

          return (
            <div
              key={index}
              className={cellClasses}
              onClick={() => handleDayClick(day.date)}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
