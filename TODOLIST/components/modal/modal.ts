// components/modal/modal.ts
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ''
    },
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    maskClosable: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm');
    },

    onCancel() {
      this.triggerEvent('cancel');
    },

    onMaskTap() {
      if (this.data.maskClosable) {
        this.triggerEvent('cancel');
      }
    }
  }
});