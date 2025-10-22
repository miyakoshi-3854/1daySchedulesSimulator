/*
 * TimeGraph.jsx
 * 24時間の円グラフ表示を担当する
 *
 * 目的：
 * 1. スケジュールを可視化し、時間の割合を表示する。
 * 2. 一日の時間の使い方をシュミレートする。
 */
import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useSchedule } from '../contexts/ScheduleContext';
import { timeToAngle, prepareGraphData, wrap } from '../utils/graphUtils'; // angleToTime, SNAP_ANGLEを削除
import styles from '../styles/TimeGraph.module.css';

// グラフの定数
const WIDTH = 700;
const HEIGHT = 700;
const INNER_RADIUS = 20;
const OUTER_RADIUS = 300;
const GRAPH_CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const PI = Math.PI;
const START_ANGLE_OFFSET = 0;

export const TimeGraph = () => {
  // Contextからデータを取得
  const { schedules, startAdd, startEdit, editingSchedule } = useSchedule();

  // D3.jsで描画対象となるSVG要素への参照
  const svgRef = useRef(null);

  // 拡大用のアークジェネレータをここで定義 (ホバーと描画の両方で使用)
  const expandedArcGenerator = d3
    .arc()
    .innerRadius(INNER_RADIUS)
    .outerRadius(OUTER_RADIUS + 10) // 通常より10px大きくする
    .cornerRadius(7);

  // 1. スケジュールデータをD3.js用に整形
  // schedulesが変更された場合のみ再計算
  const graphData = useMemo(() => prepareGraphData(schedules), [schedules]);

  // 2. D3.js 描画設定のメモ化
  // 通常のアーク（円弧）を生成するジェネレータ
  const arcGenerator = useMemo(() => {
    return d3
      .arc()
      .innerRadius(INNER_RADIUS)
      .outerRadius(OUTER_RADIUS)
      .padAngle(0.01) // セグメント間の隙間
      .cornerRadius(7);
  }, []);

  // パイレイアウトを計算するジェネレータ
  const pieGenerator = useMemo(() => {
    return d3
      .pie()
      .value((d) => d.value) // セグメントのサイズを決定するデータフィールド
      .sort(null) // ソートを無効化し、データ順を保持
      .startAngle(START_ANGLE_OFFSET * (PI / 180))
      .endAngle((360 + START_ANGLE_OFFSET) * (PI / 180)); // 360度の描画範囲
  }, []);

  // 3. D3.js 描画ロジック
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    let g = svg.select('.graph-group'); // グラフ全体を保持するグループ要素

    // グループ要素が存在しない場合の初期化処理
    if (g.empty()) {
      g = svg
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .append('g')
        .attr('class', 'graph-group')
        // 中心座標へ移動
        .attr('transform', `translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`);
    } else {
      // 既存の要素をクリーンアップ
      g.selectAll('*').remove();
      // 座標変換をリセット (D3のデータ結合前に実行)
      g.attr('transform', `translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`); // 不要な回転をリセット
    }

    // パイジェネレータを実行し、角度情報を含むデータ配列を生成
    const pieData = pieGenerator(graphData);

    // 1. パス（円弧）の描画
    const paths = g
      .selectAll('path.schedule-arc')
      // pieDataをバインドし、d.data.idでキーを追跡
      .data(pieData, (d) => d.data.id);

    paths
      .enter() // 新しいデータポイントに対して
      .append('path') // path要素を追加
      .attr('class', 'schedule-arc')
      .merge(paths) // 既存要素と新規要素を結合し、共通の属性を設定
      .attr('d', (d) => {
        // 編集対象のIDと現在のセグメントのIDが一致する場合、拡大アークを返す
        if (d.data.data && d.data.data.id === editingSchedule?.id) {
          return expandedArcGenerator(d);
        }
        // それ以外は通常のアークを返す
        return arcGenerator(d);
      })
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#484848')
      .attr('stroke-width', '2px')
      // 未予定時間('idle')以外はポインターカーソルを設定
      .style('cursor', (d) => (d.data.id === 'idle' ? 'default' : 'pointer'))
      // クリックイベント
      .on('click', (event, d) => {
        // 未予定時間 ('idle') の場合は新規追加、スケジュールセグメントは編集開始
        if (d.data.data && d.data.data.isIdle) {
          startAdd(); // startAdd関数がContextから取得されていることを想定
        } else {
          // スケジュールセグメントをクリックした場合
          startEdit(d.data.data);
        }
      })

      // ホバーイベントの調整
      .on('mouseenter', function (event, d) {
        // 編集中のセグメントなら何もしない
        if (d.data.data && d.data.data.id === editingSchedule?.id) return;

        // 通常セグメントのホバーアニメーション
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', expandedArcGenerator); // 拡大したアークを使用
      })
      // ホバーイベント (mouseleave)
      .on('mouseleave', function (event, d) {
        // 編集中のセグメントなら何もしない
        if (d.data.data && d.data.data.id === editingSchedule?.id) return;

        // 元のサイズに戻す (非編集セグメントのみ)
        d3.select(this).transition().duration(150).attr('d', arcGenerator);
      });

    // 2. ラベル（テキスト）の描画
    const labels = g
      .selectAll('text.schedule-label')
      .data(pieData, (d) => d.data.data.id); // キーは d.data.data.id を使用

    labels
      .enter()
      .append('text')
      .attr('class', 'schedule-label')
      .merge(labels)
      // テキストの位置を円弧の中心座標に設定
      .attr('transform', (d) => {
        // arcGenerator.centroid は描画可能なセグメントの中心を返す。
        const [x, y] = arcGenerator.centroid(d);
        return `translate(${x}, ${y})`;
      })
      .attr('dy', '0.35em') // 垂直方向の中央揃え
      .attr('text-anchor', 'middle') // 水平方向の中央揃え
      .style('fill', '#eaeaea')
      .style('font-size', '12px')
      .style('pointer-events', 'none') // クリックイベントを円弧に渡す
      .text((d) => {
        // スケジュールデータへのアクセスをシンプルに：d.data.data を使用
        const schedule = d.data.data;

        // 未予定時間 ('idle')、または角度が極端に小さいセグメントは非表示
        if (schedule.id === 'idle' || d.endAngle - d.startAngle < 0.1)
          return '';

        // スケジュール名を表示
        return schedule.title;
      })
      .call(wrap, 80); // ラベルが指定幅(80px)を超えたら折り返す処理を適用

    // 3. ラベルの削除
    labels.exit().remove();

    // 2. ★時刻メモリ（目盛り）の描画★
    const timeLabels = g.selectAll('.time-label').data(d3.range(0, 24)); // 0時から23時まで

    const textOffset = OUTER_RADIUS + 25; // グラフ外側からの距離

    timeLabels
      .enter()
      .append('text')
      .attr('class', 'time-label')
      .merge(timeLabels)
      .attr('fill', '#484848') // 薄い灰色
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .each(function (hour) {
        // 時刻を角度に変換 (例: 6時 = 90度, 12時 = 180度)
        const angle = timeToAngle(`${hour}:00:00`);

        // D3描画基準（3時方向が0度）に合わせるための調整
        // 角度をラジアンに変換
        const rad = angle * (PI / 180);

        // 角度から座標を計算
        const x = Math.sin(rad) * textOffset;
        const y = -Math.cos(rad) * textOffset; // Y軸は上向きを正とするため、反転が必要

        d3.select(this)
          .attr('transform', `translate(${x}, ${y})`) // 計算した座標へ移動
          .text(`${hour}:00`); // 時刻テキストを設定
      });

    timeLabels.exit().remove(); // データから削除された目盛り要素を削除
  }, [schedules, pieGenerator, arcGenerator, startEdit, graphData]);

  return (
    <div className={styles.timeGraphContainer}>
      <svg
        width={WIDTH}
        height={HEIGHT}
        ref={svgRef} // D3.jsが操作できるようにRefをアタッチ
        className={styles.svgContainer}
      >
        {/* D3が要素を追加していくためのグループ */}
        <g
          className="graph-group"
          transform={`translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`}
        ></g>
      </svg>
    </div>
  );
};
