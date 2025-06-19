const uxAndAppearanceSettings = [
  {
    id: 0,
    categoryName: "管家助手",
    child: [
      {
        index: 0,
        id: "autoHideEasiAssistant",
        type: "switch",
        name: "自动最小化管家助手",
        description: "管家启动后, 自动将桌面右下角管家助手最小化至 Fab 形态",
        restart: true,
        reload: false,
        associateVal: ["ssa.ux.easiAssistant.notDisplay"],
        auraIf: () => true,
        defaultValue: false,
        auraDisable: () => {
          if (global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.notDisplay) {
            return { value: true, tooltip: '禁用 "隐藏管家助手" 以继续' };
          } else {
            return { value: false };
          }
        },
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.autoHide;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.autoHide = newVal;
        },
      },
      {
        index: 1,
        id: "notDisplayEasiAssistant",
        type: "switch",
        name: "隐藏管家助手",
        description: "管家启动后, 管家助手窗口将不再显示",
        restart: true,
        reload: false,
        associateVal: ["ssa.ux.easiAssistant.autoHide"],
        auraIf: () => true,
        defaultValue: false,
        auraDisable: () => {
          if (global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.autoHide) {
            return { value: true, tooltip: '禁用 "自动最小化管家助手" 以继续' };
          } else {
            return { value: false };
          }
        },
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.notDisplay;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.notDisplay = newVal;
        },
      },
    ],
  },
];

module.exports = { uxAndAppearanceSettings };
