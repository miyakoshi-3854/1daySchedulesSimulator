/*
 * 24時間の円グラフ表示を担当する
 * TimeGraph.jsx
 *
 * 目的：
 * 1. スケジュールを可視化し、時間の割合を表示する。
 * 2. 一日の時間の使い方をシュミレートする。
 */
import React, { useRef, useEffect, useMemo } from 'react'; // useState, dragging, ...を削除
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

  const svgRef = useRef(null);

  // 拡大用のアークジェネレータをここで定義 (ホバーと描画の両方で使用)
  const expandedArcGenerator = d3
    .arc()
    .innerRadius(INNER_RADIUS)
    .outerRadius(OUTER_RADIUS + 10)
    .cornerRadius(7);

  // 1. スケジュールデータをD3.js用に整形
  const graphData = useMemo(() => prepareGraphData(schedules), [schedules]);

  // 2. D3.js 描画設定のメモ化
  const arcGenerator = useMemo(() => {
    return d3
      .arc()
      .innerRadius(INNER_RADIUS)
      .outerRadius(OUTER_RADIUS)
      .padAngle(0.01)
      .cornerRadius(7);
  }, []);

  const pieGenerator = useMemo(() => {
    return d3
      .pie()
      .value((d) => d.value)
      .sort(null)
      .startAngle(START_ANGLE_OFFSET * (PI / 180))
      .endAngle((360 + START_ANGLE_OFFSET) * (PI / 180));
  }, []);

  // 3. D3.js 描画ロジック
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    let g = svg.select('.graph-group');

    if (g.empty()) {
      g = svg
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .append('g')
        .attr('class', 'graph-group')
        .attr('transform', `translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`);
    } else {
      // 既存の要素をクリーンアップ
      g.selectAll('*').remove();
      g.attr('transform', `translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`); // 不要な回転をリセット
    }

    const pieData = pieGenerator(graphData);

    // 1. パス（円弧）の描画
    const paths = g
      .selectAll('path.schedule-arc')
      .data(pieData, (d) => d.data.id);

    paths
      .enter()
      .append('path')
      .attr('class', 'schedule-arc')
      .merge(paths)
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
      .style('cursor', (d) => (d.data.id === 'idle' ? 'default' : 'pointer'))
      // クリックイベント
      .on('click', (event, d) => {
        // 未予定時間 ('idle') の場合は新規追加、スケジュールセグメントは編集開始
        if (d.data.data && d.data.data.isIdle) {
          startAdd(); // startAdd関数がContextから取得されていることを想定
        } else {
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
      // ★位置の計算: arcGenerator.centroid() で円弧の中心座標を取得
      .attr('transform', (d) => {
        // arcGenerator.centroid は描画可能なセグメントの中心を返す。
        const [x, y] = arcGenerator.centroid(d);
        return `translate(${x}, ${y})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('fill', '#eaeaea')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .text((d) => {
        // スケジュールデータへのアクセスをシンプルに：d.data.data を使用
        const schedule = d.data.data;

        // 未予定時間 ('idle')、または角度が極端に小さいセグメントは非表示
        if (schedule.id === 'idle' || d.endAngle - d.startAngle < 0.1)
          return '';

        // スケジュール名を表示
        return schedule.title;
      })
      .call(wrap, 80); // ★新規追加: ラベルが長すぎる場合に折り返すヘルパーを適用 (後述)

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
          .attr('transform', `translate(${x}, ${y})`)
          .text(`${hour}:00`);
      });

    timeLabels.exit().remove();
  }, [schedules, pieGenerator, arcGenerator, startEdit, graphData]);

  return (
    <div className={styles.timeGraphContainer}>
      <svg
        width={WIDTH}
        height={HEIGHT}
        ref={svgRef}
        className={styles.svgContainer}
      >
        <g
          className="graph-group"
          transform={`translate(${GRAPH_CENTER.x}, ${GRAPH_CENTER.y})`}
        ></g>
      </svg>
    </div>
  );
};
