/*
 * ScheduleForm.jsx
 * スケジュール追加、編集を専門に行うコンポーネント
 *
 * 目的：
 * 1. 追加モード、編集モードを用意しデータを送信する。
 * 2. TimeGraph、ScheduleListと連携し、選択されたスケジュールをセットする。
 */
import { useState, useEffect, useMemo } from 'react';
import { useSchedule } from '../contexts/ScheduleContext';
import { useDate } from '../contexts/DateContext';
import { formatDate } from '../utils/dateUtils';
import { generateHourOptions, generateMinuteOptions } from '../utils/timeUtils';
import styles from '../styles/ScheduleForm.module.css';

// ヘルパー関数: HH:MM:SS から HH と MM を抽出
const parseTime = (timeString, fallbackHour = '09', fallbackMinute = '00') => {
  if (!timeString) return { hour: fallbackHour, minute: fallbackMinute };
  const parts = timeString.split(':');
  return {
    hour: parts[0] ? String(parts[0]).padStart(2, '0') : fallbackHour,
    minute: parts[1] ? String(parts[1]).padStart(2, '0') : fallbackMinute,
  };
};

// フォームの初期状態を定義するヘルパー
const createInitialFormState = (date) => {
  // カテゴリのデフォルト時刻をパース
  const formattedDate = formatDate(date);
  const fallbackColor = '#FF0000'; // フォームのベースカラー

  return {
    title: '',
    category_id: '', // ★初期値は空文字列 (NULL選択肢に対応)
    start_hour: '09',
    start_minute: '00',
    end_hour: '10',
    end_minute: '00',
    note: '',
    color: fallbackColor, // ★初期色はデフォルト色に設定
    fixed_date: formattedDate,
  };
};

/**
 * スケジュールの追加・編集フォームコンポーネント
 */
export const ScheduleForm = () => {
  const {
    categories,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    editingSchedule,
    isAddingNew,
    endForm,
  } = useSchedule();

  const { currentDate } = useDate();

  // ★追加: フォームの表示制御
  const isFormVisible = isAddingNew || editingSchedule;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(() =>
    createInitialFormState(currentDate, categories)
  );

  // ★変更: 編集モードの判定を Context のデータに依存させる
  const isEditMode = !!editingSchedule;

  // 時刻オプションの生成 (useMemoで一度だけ実行)
  const hourOptions = useMemo(() => generateHourOptions(), []);
  const minuteOptions = useMemo(() => generateMinuteOptions(), []);

  // ------------------------------------------------------------------
  // 編集モード/日付変更時の初期化処理
  // ------------------------------------------------------------------
  useEffect(() => {
    // ★変更: prop ではなく Context の editingSchedule を使う
    if (isEditMode && editingSchedule) {
      // 編集モード時の初期化
      const start = parseTime(editingSchedule.start_time);
      const end = parseTime(editingSchedule.end_time);

      setFormData({
        title: editingSchedule.title || '',
        category_id: editingSchedule.category_id || '',
        start_hour: start.hour,
        start_minute: start.minute,
        end_hour: end.hour,
        end_minute: end.minute,
        note: editingSchedule.note || '',
        color: editingSchedule.color || '',
        fixed_date: editingSchedule.date,
      });
    } else if (isAddingNew) {
      // 新規追加モード時の初期化
      setFormData(createInitialFormState(currentDate, categories));
    }
    setFormError('');

    // 依存配列に editingSchedule と isAddingNew を追加
  }, [editingSchedule, isAddingNew, currentDate, categories, isEditMode]);

  // ------------------------------------------------------------------
  // カテゴリー変更時のデフォルト値セット
  // ------------------------------------------------------------------
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    // 選択されたカテゴリオブジェクト (NULL選択時: undefined)
    const category = categories.find((c) => String(c.id) === categoryId);

    // 【新規登録時/未選択時のデフォルト値】
    const defaultTitle = '';
    const defaultNote = '';
    const defaultColor = '#3498db'; // フォームのベースカラーに戻す
    const defaultStart = parseTime('09:00:00', '09', '00');
    const defaultEnd = parseTime('10:00:00', '10', '00');

    // ★主要ロジックの修正★
    if (categoryId === '') {
      // NULL (未選択) が選ばれた場合: フォームをリセット
      setFormData((prev) => ({
        ...prev,
        category_id: '',
        color: defaultColor,
        title: defaultTitle,
        note: defaultNote,
        start_hour: defaultStart.hour,
        start_minute: defaultStart.minute,
        end_hour: defaultEnd.hour,
        end_minute: defaultEnd.minute,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      category_id: categoryId,
      // カテゴリーのデフォルト値で色と時刻を更新
      color: category?.default_color || prev.color,
      // UI上、タイトルはユーザーが入力したものを優先することが多いため、
      // ユーザーが入力していない場合のみデフォルトタイトルを適用する方がUXは良い。
      title: prev.title === '' ? category?.default_title || '' : prev.title,
      note: prev.note === '' ? category?.default_note || '' : prev.note,

      start_hour: parseTime(category?.default_start).hour || prev.start_hour,
      start_minute:
        parseTime(category?.default_start).minute || prev.start_minute,
      end_hour: parseTime(category?.default_end).hour || prev.end_hour,
      end_minute: parseTime(category?.default_end).minute || prev.end_minute,
    }));
  };

  // フォーム入力値の変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    // カテゴリIDの変更は専用ハンドラに任せる
    if (name === 'category_id') {
      handleCategoryChange(e);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ------------------------------------------------------------------
  // フォーム送信ハンドラ
  // ------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // 1. ローカルバリデーション
    if (!formData.title || !formData.start_hour || !formData.end_hour) {
      setFormError('予定名と時刻は必須です。');
      return;
    }

    // API送信用の時刻文字列を生成 (HH:MM:00 形式)
    const start_time_api = `${formData.start_hour}:${formData.start_minute}:00`;
    const end_time_api = `${formData.end_hour}:${formData.end_minute}:00`;

    // 時刻の論理チェック（開始時刻 < 終了時刻）
    if (start_time_api >= end_time_api) {
      setFormError('終了時刻は開始時刻よりも後である必要があります。');
      return;
    }

    setIsSubmitting(true);

    // formData.fixed_date が '2025-10-19 00:00:00' の形式の場合、'2025-10-19' のみを取得
    const simpleDate = formData.fixed_date.substring(0, 10);

    const payload = {
      title: formData.title,
      category_id: formData.category_id === '' ? null : formData.category_id,
      date: simpleDate,
      start_time: start_time_api,
      end_time: end_time_api,
      color: formData.color,
      note: formData.note,
    };

    let result;
    try {
      // ★変更: 編集時は editingSchedule.id を使う
      if (isEditMode) {
        result = await updateSchedule(editingSchedule.id, payload);
      } else {
        result = await addSchedule(payload);
      }

      if (result.success) {
        endForm(); // ★変更: Contextの終了関数を呼び出す
      } else {
        setFormError(result.message || '処理に失敗しました。');
      }
    } catch (error) {
      setFormError('ネットワークエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // 削除ハンドラ（編集モード時のみ）
  // ------------------------------------------------------------------
  const handleDelete = async () => {
    if (!window.confirm('この予定を削除しますか？')) return;

    setIsSubmitting(true);
    try {
      // ★変更: editingSchedule.id を使う
      const result = await deleteSchedule(editingSchedule.id);
      if (result.success) {
        endForm(); // ★変更: Contextの終了関数を呼び出す
      } else {
        setFormError(result.message || '削除に失敗しました。');
      }
    } catch (error) {
      setFormError('ネットワークエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // レンダリング
  // ------------------------------------------------------------------
  // ★追加: フォームの非表示処理
  if (!isFormVisible) {
    return null;
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>
        {isEditMode ? '予定を編集' : '予定を追加'}
      </h3>

      {formError && <p className="error-message">{formError}</p>}

      <form onSubmit={handleSubmit}>
        {/* 1. カテゴリー選択 */}
        <div className={styles.formGroup}>
          <label htmlFor="category">テンプレートから選ぶ</label>
          <select
            id="category"
            name="category_id"
            className={styles.inputSelect}
            value={formData.category_id}
            onChange={handleCategoryChange} // 専用ハンドラを呼び出す
            disabled={isSubmitting}
          >
            {/* カテゴリーを選択しない場合 */}
            <option value="">カテゴリーなし</option>

            {categories.length === 0 && <option value="">ロード中...</option>}

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.default_title})
              </option>
            ))}
          </select>
        </div>

        {/* 2. タイトル入力 */}
        <div className={styles.formGroup}>
          <label htmlFor="title">予定名</label>
          <input
            id="title"
            name="title"
            type="text"
            className={styles.inputField}
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            placeholder="必須"
          />
        </div>

        {/* 3. 開始時刻・終了時刻 (Hour / Minute 分割) */}
        <div className={styles.dateGroup}>
          {/* 開始時刻 */}
          <div className={styles.dateTime}>
            <label>開始時刻</label>
            <div className={styles.timeSelectGroup}>
              <select
                name="start_hour"
                className={styles.inputSelect}
                value={formData.start_hour}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className={styles.timeSeparator}>:</span>
              <select
                name="start_minute"
                className={styles.inputSelect}
                value={formData.start_minute}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* 終了時刻 */}
          <div className={styles.dateTime}>
            <label>終了時刻</label>
            <div className={styles.timeSelectGroup}>
              <select
                name="end_hour"
                className={styles.inputSelect}
                value={formData.end_hour}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className={styles.timeSeparator}>:</span>
              <select
                name="end_minute"
                className={styles.inputSelect}
                value={formData.end_minute}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. 色ピッカー */}
        <div className={styles.formGroup}>
          <label htmlFor="color">色</label>
          <div className={styles.colorInputGroup}>
            <input
              id="color"
              name="color"
              type="color" // HTMLのカラーピッカー
              className={styles.colorPicker}
              value={formData.color}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className={styles.colorHex}>{formData.color}</span>
          </div>
        </div>

        {/* 5. メモ */}
        <div className={styles.formGroup}>
          <label htmlFor="note">備考</label>
          <textarea
            id="note"
            name="note"
            rows="3"
            className={styles.inputField}
            value={formData.note}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="詳細な説明や備考（任意）"
          ></textarea>
        </div>

        {/* 6. 送信ボタンと削除ボタン */}
        <div className={styles.formActions}>
          {/* 完了 / 追加 ボタン */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '処理中...' : isEditMode ? '更新を完了' : '追加'}
          </button>

          {/* 削除ボタンは編集モード時のみ表示 */}
          {isEditMode && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              削除
            </button>
          )}

          {/* キャンセルボタン */}
          <button
            type="button"
            className="btn"
            onClick={endForm}
            disabled={isSubmitting}
          >
            閉じる
          </button>
        </div>
      </form>
    </div>
  );
};
