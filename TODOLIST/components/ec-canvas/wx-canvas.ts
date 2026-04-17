// components/ec-canvas/wx-canvas.ts
export default class WxCanvas {
  ctx: any;
  canvasId: string;
  chart: any;

  constructor(ctx: any, canvasId: string) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;
  }
}