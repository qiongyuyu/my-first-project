"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// components/ec-canvas/wx-canvas.ts
class WxCanvas {
    constructor(ctx, canvasId) {
        this.ctx = ctx;
        this.canvasId = canvasId;
        this.chart = null;
    }
}
exports.default = WxCanvas;
