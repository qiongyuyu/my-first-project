// components/ec-canvas/echarts.ts
// 这里应该导入微信小程序版的 echarts
// 为了简化，我们导出一个模拟对象

const echarts = {
  init(_canvas: any, _theme?: any, _opts?: any) {
    console.log('echarts.init called');
    return {
      setOption(option: any) {
        console.log('chart.setOption called', option);
      },
      _zr: {
        handler: {
          dispatch() {}
        }
      }
    };
  },
  setCanvasCreator(_creator: any) {
    console.log('setCanvasCreator called');
  }
};

export default echarts;