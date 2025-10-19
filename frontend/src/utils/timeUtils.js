/*
 * ScheduleFormの時間選択リストの時間と分の文字列を生成するヘルパー関数
 */

/**
 * 00 から 23 までの時間文字列を生成する
 * @returns {Array<string>} ['00', '01', ..., '23']
 */
export const generateHourOptions = () => {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push(String(h).padStart(2, '0'));
  }
  return hours;
};

/**
 * 00 から 55 までの 5 分おきの分文字列を生成する
 * @returns {Array<string>} ['00', '05', ..., '55']
 */
export const generateMinuteOptions = () => {
  const minutes = [];
  for (let m = 0; m < 60; m += 5) {
    minutes.push(String(m).padStart(2, '0'));
  }
  return minutes;
};
