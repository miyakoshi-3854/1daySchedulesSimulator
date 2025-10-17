/**
 * Dateオブジェクトを YYYY-MM-DD 形式の文字列に整形します。
 * APIとの通信や、日付の比較に利用します。
 * @param {Date} date - 整形対象の Date オブジェクト
 * @returns {string} 'YYYY-MM-DD' 形式の文字列
 */
export const formatDate = (date) => {
  // タイムゾーンの問題を回避するため、getTimezoneOffsetを考慮したUTC変換を使わずに
  // ISO文字列から日付部分のみを取り出す方法を採用します。
  return date.toISOString().split('T')[0];
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
