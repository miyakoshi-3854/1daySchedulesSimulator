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
