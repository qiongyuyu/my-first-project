// components/ec-canvas/ec-canvas.ts
import WxCanvas from './wx-canvas';
import echarts from './echarts';

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    }
  },
  data: {},
  ready() {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例: <ec-canvas id="mychart-dom-bar" '
        + 'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },
  methods: {
    init(callback?: any) {
      const { canvasId } = this.data;
      this.ctx = wx.createCanvasContext(canvasId, this);
      const canvas = new WxCanvas(this.ctx, canvasId);
      echarts.setCanvasCreator(() => canvas);

      const query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas').boundingClientRect(res => {
        if (typeof callback === 'function') {
          callback(canvas, res.width, res.height);
        } else if (this.data.ec && this.data.ec.onInit) {
          this.data.ec.onInit(canvas, res.width, res.height);
        }
      }).exec();
    },
    touchStart(e: any) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        this.chart._zr.handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        this.chart._zr.handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },
    touchMove(e: any) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        this.chart._zr.handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },
    touchEnd(e: any) {
      if (this.chart) {
        const touch = e.changedTouches[0];
        this.chart._zr.handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        this.chart._zr.handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    }
  }
});