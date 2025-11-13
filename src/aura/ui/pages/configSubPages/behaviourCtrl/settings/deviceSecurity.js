const REQUIRE_BASE = ".";

const {
  updateAikariConfigToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

const composables = {};

const deviceSecuritySettings = [
  {
    id: 0,
    categoryName: "冰点管理",
    child: [
      {
        index: 0,
        id: "enableFreezeInfoReportOverride",
        type: "switch",
        name: "启用冰冻状态篡改",
        description: "篡改上报的冰冻数据, 可自定义集控端显示的状态",
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return "";
          return global.__HUGO_AURA__.aikariRules.client.security.uploadFreezeInfo
            .enable;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (!global.__HUGO_AURA__.aikariRules) return;

          global.__HUGO_AURA__.aikariRules.client.security.uploadFreezeInfo.enable =
            newVal;
          updateAikariConfigToRemote(
            "ruleSettings.client.security.uploadFreezeInfo.enable",
            newVal
          );
          return true;
        },
      },
      {
        index: 1,
        id: "freezeInfoReportOverrideType",
        type: "radio",
        name: "篡改模式",
        description:
          "选择一种篡改模式, 选中的磁盘范围会<b>被上报</b>为冻结 (不是实际行为)",
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: false,
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        associateVal: ["ruleSettings.client.security.uploadFreezeInfo.enable"],
        auraIf: () => {
          if (!global.__HUGO_AURA__.aikariRules) return true;

          return global.__HUGO_AURA__.aikariRules.client.security.uploadFreezeInfo
            .enable;
        },
        defaultValue: "allFreeze",
        templates: ["allFreeze", "systemOnly", "exceptSecondDisk"],
        templateLabels: ["全部冻结", "仅系统盘", "第二磁盘除外"],
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return;

          return global.__HUGO_AURA__.aikariRules.client.security.uploadFreezeInfo
            .rewriteMode;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA__.aikariRules.client.security.uploadFreezeInfo.rewriteMode =
            newVal;
          updateAikariConfigToRemote(
            "ruleSettings.client.security.uploadFreezeInfo.rewriteMode",
            newVal
          );
          return true;
        },
      },
      {
        index: 2,
        id: "freezeInfoReportOverridePreview",
        type: "preview",
        loaderTarget:
          "Aura.UI.Assistant.Config.BehaviourCtrl.DeviceSecurity.FreezeOverridePreview",
        associateVal: ["ruleSettings.client.security.uploadFreezeInfo"],
        listenerType: "pls",
      },
    ],
  },
];

module.exports = { deviceSecuritySettings };
