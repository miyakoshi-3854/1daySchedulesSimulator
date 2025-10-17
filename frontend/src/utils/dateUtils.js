/**
 * Dateオブジェクトを YYYY-MM-DD 形式の文字列に整形します。
 * APIとの通信や、日付の比較に利用します。
 * @param {Date} date - 整形対象の Date オブジェクト
 * @returns {string} 'YYYY-MM-DD' 形式の文字列
 */
export const formatDate = (date) => {
  // YYYY-MM-DD形式に変換 (ISO文字列から日付部分を抜き取る)
  // ただし、この方法だと、dateがUTC midnightの場合、ローカルタイムゾーンによっては前日になってしまう可能性がある
  // 例: JSTの場合 2025-10-18T00:00:00Z は 2025-10-17 09:00:00 JST
  // なので、代わりに手動で現地の日付を構築する方法を使う。

  // YYYY-MM-DD の現地時刻を返す新しいヘルパー
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 指定されたDateオブジェクトから時刻情報を削除し、ローカルタイムゾーンの深夜0時に設定します。
 * これにより、タイムゾーンオフセットによる日付のズレを防ぎます。
 * @param {Date} date - 基準となるDateオブジェクト
 * @returns {Date} 時刻が00:00:00に設定された新しいDateオブジェクト
 */
export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // 時刻を00:00:00.000に設定
  return d;
};
