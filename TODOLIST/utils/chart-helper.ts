/**
 * 简易图表绘制工具
 * 使用 Canvas 2D API，不依赖第三方库
 */

export interface BarChartOption {
  data: { label: string; value: number }[];
  colors?: string[];
  unit?: string;
}

export interface PieChartOption {
  data: { name: string; value: number }[];
  colors?: string[];
}

/** 薰衣草渐变色板 */
const BAR_COLORS = ['#C9B4E9', '#B09FD8', '#9C7BC8', '#8B6AB8', '#A78AC8', '#7B5EA7', '#B8A0D8'];

export function drawBarChart(
  canvas: any,
  width: number,
  height: number,
  option: BarChartOption,
) {
  const ctx = canvas.getContext('2d');
  const dpr = wx.getWindowInfo().pixelRatio;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const { data, unit = '分钟' } = option;
  const padding = { top: 30, right: 24, bottom: 40, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barCount = data.length;

  // 根据柱子数量动态计算间距
  const minGap = barCount <= 3 ? 24 : barCount <= 7 ? 16 : barCount <= 12 ? 10 : 6;
  const barGap = Math.max(minGap, chartW / (barCount * 4));
  const barWidth = Math.min((chartW - barGap * (barCount + 1)) / barCount, 48);

  const maxVal = Math.max(...data.map(d => d.value), 1);

  // 背景
  ctx.clearRect(0, 0, width, height);

  // 网格线
  ctx.strokeStyle = '#F0EDF8';
  ctx.lineWidth = 0.8;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.setLineDash(i === 4 ? [] : [4, 4]);
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y 轴刻度
    const val = Math.round((maxVal / 4) * (4 - i));
    ctx.fillStyle = '#B0A0C8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(val), padding.left - 6, y + 3);
  }

  // X 轴基线
  ctx.strokeStyle = '#D8C8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartH);
  ctx.lineTo(width - padding.right, padding.top + chartH);
  ctx.stroke();

  // 柱子
  data.forEach((d, i) => {
    const barH = maxVal === 0 ? 0 : (d.value / maxVal) * chartH;
    const x = padding.left + barGap + i * (barWidth + barGap);
    const y = padding.top + chartH - barH;
    const r = Math.min(barWidth / 2, 6);

    const color = (option.colors && option.colors[i]) || BAR_COLORS[i % BAR_COLORS.length];

    // 柱子渐变
    const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '44');
    ctx.fillStyle = grad;

    // 圆角矩形柱
    ctx.beginPath();
    if (barH > r) {
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.lineTo(x + barWidth - r, y);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
      ctx.lineTo(x + barWidth, padding.top + chartH);
    } else {
      ctx.rect(x, padding.top + chartH, barWidth, 0);
    }
    ctx.closePath();
    ctx.fill();

    // 数值标签（仅当有值时显示）
    if (d.value > 0) {
      ctx.fillStyle = '#7B5EA7';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.value + unit, x + barWidth / 2, y - 8);
    }

    // X 轴标签
    ctx.fillStyle = '#8B7BAE';
    ctx.font = barCount > 10 ? '9px sans-serif' : '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barWidth / 2, padding.top + chartH + 18);

    // 柱子顶部高亮线
    if (barH > 0) {
      ctx.strokeStyle = color + 'AA';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.stroke();
    }
  });
}

/**
 * 在 canvas 上绘制饼图
 */
export function drawPieChart(
  canvas: any,
  width: number,
  height: number,
  option: PieChartOption,
) {
  const ctx = canvas.getContext('2d');
  const dpr = wx.getWindowInfo().pixelRatio;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const { data } = option;
  const colors = option.colors || ['#C9B4E9', '#A78AC8', '#B09FD8', '#E8D5F5', '#9C7BC8', '#D8C8F0', '#7B5EA7'];
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.35;
  const cy = height / 2;
  const radius = Math.min(cx - 10, cy - 16);

  if (radius <= 0) return;

  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    // 标签
    const midAngle = startAngle + sliceAngle / 2;
    const labelX = cx + Math.cos(midAngle) * (radius + 18);
    const labelY = cy + Math.sin(midAngle) * (radius + 18);
    const pct = Math.round((d.value / total) * 100);

    ctx.fillStyle = '#5A4A7A';
    ctx.font = '12px sans-serif';
    ctx.textAlign = labelX > cx ? 'left' : 'right';
    ctx.fillText(d.name + ' ' + pct + '%', labelX, labelY);

    startAngle = endAngle;
  });

  // 图例
  const legendX = width * 0.7;
  const legendStartY = cy - data.length * 14;
  data.forEach((d, i) => {
    const ly = legendStartY + i * 30;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(legendX + 6, ly + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B7BAE';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.name, legendX + 18, ly + 8);
  });
}
