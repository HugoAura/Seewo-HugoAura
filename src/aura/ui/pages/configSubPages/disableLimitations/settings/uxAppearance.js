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
  {
    id: 1,
    categoryName: "U 盘提示",
    child: [
      {
        index: 0,
        id: "switchUsbInsertPromptButton",
        type: "switch",
        name: '隐藏 U 盘插入提示悬浮窗的 "开始查杀" 按钮',
        description: '启用后, "打开 U 盘" 将成为悬浮窗中的 Primary 按钮',
        restart: true,
        reload: false,
        associateVal: [
          "networkRewrite.appearance/switchUsbInsertPromptBtn.enabled",
        ],
        auraIf: () => true,
        defaultValue: false,
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode === "hide" &&
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].enabled
          ) {
            return { value: true, tooltip: '禁用 "隐藏 U 盘插入提示" 以继续' };
          } else {
            return { value: false };
          }
        },
        valueGetter: () => {
          return (
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode === "switch" &&
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].enabled
          );
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (newVal === true) {
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode = "switch";
          }
          global.__HUGO_AURA_CONFIG__.networkRewrite[
            "appearance/switchUsbInsertPromptBtn"
          ].enabled = newVal;
        },
      },
      {
        index: 1,
        id: "hideUsbInsertPrompt",
        type: "switch",
        name: "隐藏 U 盘插入提示",
        description: "启用后, 插入 U 盘将不再显示悬浮窗",
        restart: true,
        reload: false,
        associateVal: [
          "networkRewrite.appearance/switchUsbInsertPromptBtn.enabled",
        ],
        auraIf: () => true,
        defaultValue: false,
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode === "switch" &&
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].enabled
          ) {
            return {
              value: true,
              tooltip:
                '禁用 "隐藏 U 盘插入提示悬浮窗的 "开始查杀" 按钮" 以继续',
            };
          } else {
            return { value: false };
          }
        },
        valueGetter: () => {
          return (
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode === "hide" &&
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].enabled
          );
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (newVal === true) {
            global.__HUGO_AURA_CONFIG__.networkRewrite[
              "appearance/switchUsbInsertPromptBtn"
            ].mode = "hide";
          }
          global.__HUGO_AURA_CONFIG__.networkRewrite[
            "appearance/switchUsbInsertPromptBtn"
          ].enabled = newVal;
        },
      },
    ],
  },
];

module.exports = { uxAndAppearanceSettings };
