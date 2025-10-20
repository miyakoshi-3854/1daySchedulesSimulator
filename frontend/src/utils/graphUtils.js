import * as d3 from 'd3';

const TOTAL_MINUTES_IN_DAY = 24 * 60; // 1440分
const DEGREES_PER_MINUTE = 360 / TOTAL_MINUTES_IN_DAY; // 1分あたり 0.25度
export const SNAP_MINUTES = 5; // スケジュールは5分刻み
export const SNAP_ANGLE = SNAP_MINUTES * DEGREES_PER_MINUTE; // 5分あたり 1.25度

// -----------------------------------------------------------
// 角度と時刻の変換ヘルパー
// -----------------------------------------------------------

/**
 * HH:MM:SS 形式の時刻を 24時間円グラフの角度 (0〜360度) に変換する
 * @param {string} timeString - 'HH:MM:SS'
 * @returns {number} 角度 (0〜360)
 */
export const timeToAngle = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  // 0:00 = 0度, 12:00 = 180度, 24:00 = 360度
  return totalMinutes * DEGREES_PER_MINUTE;
};

// インタラクティブな編集機能を省略するため、今回は使用しない。
/**
 * 角度を時刻 (HH:MM:00) に逆変換し、5分刻みにスナップする
 * @param {number} angle - 角度 (0〜360)
 * @returns {string} スナップされた 'HH:MM:00' 形式の時刻文字列
 */
export const angleToTime = (angle) => {
  // 1. 角度を 5分刻み (1.25度) にスナップ
  // 角度は 0度未満や 360度を超えることもあるため、360で剰余を取る
  let snappedAngle = (Math.round(angle / SNAP_ANGLE) * SNAP_ANGLE) % 360;

  // 負の角度を正に変換 (例: -1.25 -> 358.75)
  if (snappedAngle < 0) {
    snappedAngle += 360;
  }

  // 2. 角度を合計分数に逆変換
  let totalMinutes = Math.round(snappedAngle / DEGREES_PER_MINUTE);

  // 3. 24:00 (1440分) は 00:00 に丸める
  if (totalMinutes === TOTAL_MINUTES_IN_DAY) {
    totalMinutes = 0;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hourString = String(hours).padStart(2, '0');
  const minuteString = String(minutes).padStart(2, '0');

  return `${hourString}:${minuteString}:00`;
};

// -----------------------------------------------------------
// D3.js 描画データ整形
// -----------------------------------------------------------

/**
 * スケジュールリストを円グラフ描画用のデータに整形する
 * @param {Array<object>} schedules - ScheduleContextから取得したスケジュールデータ
 * @returns {Array<object>} D3.js の pie layout が扱う {value, color, data} 形式
 */
export const prepareGraphData = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) return [];

  // 0. スケジュールデータを時刻でソート
  schedules.sort((a, b) => a.start_time.localeCompare(b.start_time));

  let graphData = [];
  let currentTimeAngle = 0; // 0:00 (0度) から開始

  // 1. スケジュールとスケジュール間の隙間を処理
  schedules.forEach((schedule) => {
    const startTime = timeToAngle(schedule.start_time);
    const endTime = timeToAngle(schedule.end_time);

    // a. 未予定時間 (前の予定の終わり or 0:00 から現在の予定の開始まで)
    if (startTime > currentTimeAngle) {
      graphData.push({
        color: '#1c1c1c', // 灰色の休憩時間
        value: startTime - currentTimeAngle,
        data: {
          title: '未予定時間',
          id: `idle-${currentTimeAngle}`,
          isIdle: true,
        },
      });
    }

    // b. スケジュール本体
    let angleDifference = endTime - startTime;

    // 23:55の視覚的調整 (endTimeを360度まで延長)
    if (schedule.end_time.startsWith('23:55')) {
      angleDifference += 5 * DEGREES_PER_MINUTE; // 1.25度分追加
    }

    graphData.push({
      color: schedule.color,
      value: angleDifference,
      data: schedule,
    });

    currentTimeAngle = endTime; // 現在時刻をこの予定の終了角度まで進める
  });

  // 最後に処理された時刻が 23:55:00 を超えているかチェック
  // 23:55 の視覚調整を行った場合、currentTimeAngle は 360 を超えるはず
  const angleFor2355 = timeToAngle('23:55:00'); // 358.75度

  // 【★修正点1★】最後のセグメントが 23:55 で終わっていた場合、currentTimeAngleを調整
  // 23:55 で終わる予定に遭遇した場合、currentTimeAngle が 360度を超えてしまうのを防ぐ
  if (currentTimeAngle >= angleFor2355) {
    // 描画上は360度まで到達したと見なし、残りの休憩時間を計算しないようにする
    currentTimeAngle = 360;
  }

  // 2. 最終的な未予定時間 (最後の予定の終わりから 360度まで)
  if (currentTimeAngle < 360) {
    graphData.push({
      color: '#444444',
      value: 360 - currentTimeAngle,
      data: { title: '未予定時間', id: `idle-end` },
    });
  }

  return graphData;
};

// テキストを折り返すためのD3ヘルパー関数
export const wrap = (text, width) => {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr('y') || 0;
    const dy = parseFloat(text.attr('dy') || 0);
    let tspan = text
      .text(null)
      .append('tspan')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', dy + 'em');

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
};
