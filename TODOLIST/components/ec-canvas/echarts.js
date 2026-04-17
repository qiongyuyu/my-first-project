"use strict";
// components/ec-canvas/echarts.ts
// 这里应该导入微信小程序版的 echarts
// 为了简化，我们导出一个模拟对象
Object.defineProperty(exports, "__esModule", { value: true });
const echarts = {
    init(_canvas, _theme, _opts) {
        console.log('echarts.init called');
        return {
            setOption(option) {
                console.log('chart.setOption called', option);
            },
            _zr: {
                handler: {
                    dispatch() { }
                }
            }
        };
    },
    setCanvasCreator(_creator) {
        console.log('setCanvasCreator called');
    }
};
exports.default = echarts;
