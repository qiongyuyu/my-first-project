"use strict";
/**
 * 简易图表绘制工具
 * 使用 Canvas 2D API，不依赖第三方库
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBarChart = drawBarChart;
exports.drawPieChart = drawPieChart;

var BAR_COLORS = ['#C9B4E9', '#B09FD8', '#9C7BC8', '#8B6AB8', '#A78AC8', '#7B5EA7', '#B8A0D8'];

function drawBarChart(canvas, width, height, option) {
    var ctx = canvas.getContext('2d');
    var dpr = wx.getWindowInfo().pixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    var data = option.data, unit = option.unit || '分钟';
    var padding = { top: 30, right: 24, bottom: 40, left: 44 };
    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;
    var barCount = data.length;

    var minGap = barCount <= 3 ? 24 : barCount <= 7 ? 16 : barCount <= 12 ? 10 : 6;
    var barGap = Math.max(minGap, chartW / (barCount * 4));
    var barWidth = Math.min((chartW - barGap * (barCount + 1)) / barCount, 48);

    var maxVal = Math.max.apply(Math, data.map(function (d) { return d.value; })) || 1;

    ctx.clearRect(0, 0, width, height);

    // 网格线
    ctx.strokeStyle = '#F0EDF8';
    ctx.lineWidth = 0.8;
    for (var i = 0; i <= 4; i++) {
        var gy = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.setLineDash(i === 4 ? [] : [4, 4]);
        ctx.moveTo(padding.left, gy);
        ctx.lineTo(width - padding.right, gy);
        ctx.stroke();
        ctx.setLineDash([]);

        var gval = Math.round((maxVal / 4) * (4 - i));
        ctx.fillStyle = '#B0A0C8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(gval), padding.left - 6, gy + 3);
    }

    // X 轴基线
    ctx.strokeStyle = '#D8C8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(width - padding.right, padding.top + chartH);
    ctx.stroke();

    // 柱子
    data.forEach(function (d, i) {
        var barH = maxVal === 0 ? 0 : (d.value / maxVal) * chartH;
        var x = padding.left + barGap + i * (barWidth + barGap);
        var y = padding.top + chartH - barH;
        var r = Math.min(barWidth / 2, 6);

        var color = (option.colors && option.colors[i]) || BAR_COLORS[i % BAR_COLORS.length];

        var grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
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

        if (d.value > 0) {
            ctx.fillStyle = '#7B5EA7';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.value + unit, x + barWidth / 2, y - 8);
        }

        ctx.fillStyle = '#8B7BAE';
        ctx.font = barCount > 10 ? '9px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barWidth / 2, padding.top + chartH + 18);

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

function drawPieChart(canvas, width, height, option) {
    var ctx = canvas.getContext('2d');
    var dpr = wx.getWindowInfo().pixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    var data = option.data;
    var colors = option.colors || ['#C9B4E9', '#A78AC8', '#B09FD8', '#E8D5F5', '#9C7BC8', '#D8C8F0', '#7B5EA7'];
    var total = data.reduce(function (sum, d) { return sum + d.value; }, 0) || 1;

    ctx.clearRect(0, 0, width, height);

    var cx = width * 0.35;
    var cy = height / 2;
    var radius = Math.min(cx - 10, cy - 16);

    if (radius <= 0) return;

    var startAngle = -Math.PI / 2;

    data.forEach(function (d, i) {
        var sliceAngle = (d.value / total) * Math.PI * 2;
        var endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        var midAngle = startAngle + sliceAngle / 2;
        var labelX = cx + Math.cos(midAngle) * (radius + 18);
        var labelY = cy + Math.sin(midAngle) * (radius + 18);
        var pct = Math.round((d.value / total) * 100);

        ctx.fillStyle = '#5A4A7A';
        ctx.font = '12px sans-serif';
        ctx.textAlign = labelX > cx ? 'left' : 'right';
        ctx.fillText(d.name + ' ' + pct + '%', labelX, labelY);

        startAngle = endAngle;
    });

    var legendX = width * 0.7;
    var legendStartY = cy - data.length * 14;
    data.forEach(function (d, i) {
        var ly = legendStartY + i * 30;
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
