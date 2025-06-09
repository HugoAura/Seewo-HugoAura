const REQUIRE_BASE = ".";

const {
  updatePlsConfigToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/plsConfigManager`);

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
        PLSRequired: true,
        restartPLS: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.plsRules) return "";
          return global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo
            .enable;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;

          global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo.enable =
            newVal;
          updatePlsConfigToRemote(
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
        description: "选择一种篡改模式, 选中的磁盘范围会<b>被上报</b>为冻结 (不是实际行为)",
        restart: false,
        reload: false,
        PLSRequired: true,
        restartPLS: false,
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        associateVal: ["ruleSettings.client.security.uploadFreezeInfo.enable"],
        auraIf: () => {
          return global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo
            .enable;
        },
        defaultValue: "allFreeze",
        templates: ["allFreeze", "systemOnly", "exceptSecondDisk"],
        templateLabels: ["全部冻结", "仅系统盘", "仅第二磁盘"],
        valueGetter: () => {
          return global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo
            .rewriteMode;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo.rewriteMode =
            newVal;
          updatePlsConfigToRemote(
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
        listenerType: "pls"
      },
    ],
  },
];

module.exports = { deviceSecuritySettings };
