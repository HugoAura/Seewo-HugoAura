// [!] Will be deprecated

const REQUIRE_BASE = ".";

const {
  updateAikariPLSRulesToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

const composables = {};

const deviceInfoPostSettings = [
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
        aikariRequired: true,
        restartAikari: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return "";
          return global.__HUGO_AURA__.aikariRules.ssaFeatures.securityPolicies
            .freezeManagement.freezeDiskInfoPost.enabled;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (!global.__HUGO_AURA__.aikariRules) return;

          global.__HUGO_AURA__.aikariRules.ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost.enabled =
            newVal;
          updateAikariPLSRulesToRemote(
            "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost.enabled",
            newVal,
            "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost"
          );
          return true;
        },
      },
      {
        index: 1,
        id: "freezeInfoReportFrozenDisks",
        type: "checkbox",
        name: "被冻结的磁盘",
        description: "选中的磁盘会<b>被上报</b>为冻结 (不是实际行为)",
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: false,
        warning: true,
        warningContent:
          "如果可选的磁盘盘符与下方预览不一致, 则多出的盘符可能为 DVD 驱动器 / 软盘 / 可移动磁盘, 忽略即可",
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        associateVal: [
          "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost.enabled",
        ],
        auraIf: () => true,
        auraDisable: () => {
          if (!global.__HUGO_AURA__.aikariRules) return { value: true };
          if (
            !global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared
              .diskCaptions
          )
            return {
              value: true,
              tooltip: "发生错误, 请上报至 HugoAura GitHub Issues",
            };
          if (
            !global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared
              .diskCaptions.length === 0
          )
            return {
              value: true,
              tooltip: "发生错误, 请上报至 HugoAura GitHub Issues",
            };

          return {
            value:
              !global.__HUGO_AURA__.aikariRules.ssaFeatures.securityPolicies
                .freezeManagement.freezeDiskInfoPost.enabled,
            tooltip: "启用冰冻状态篡改以继续",
          };
        },
        defaultValue: [],
        templates: () => {
          try {
            if (
              global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared
                .diskCaptions.length === 0
            ) {
              return ["error"];
            } else {
              return global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared.diskCaptions.map(
                (element) => {
                  return element.toLowerCase().replace(/:/g, "");
                }
              );
            }
          } catch (err) {
            console.error(err);
            return ["error"];
          }
        },
        templateLabels: () => {
          try {
            if (
              global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared
                .diskCaptions.length === 0
            ) {
              return ["获取盘符时发生错误, 请上报至 GitHub Issues"];
            } else {
              return global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared.diskCaptions.map(
                (element) => {
                  return element.replace(/:/g, " 盘");
                }
              );
            }
          } catch (err) {
            console.error(err);
            return ["发生未知错误"];
          }
        },
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return [];

          return global.__HUGO_AURA__.aikariRules.ssaFeatures.securityPolicies
            .freezeManagement.freezeDiskInfoPost.frozenDisks;
        },
        callbackFn: (affectedData, affectedEl) => {
          const targetArr =
            global.__HUGO_AURA__.aikariRules.ssaFeatures.securityPolicies
              .freezeManagement.freezeDiskInfoPost.frozenDisks;
          if (affectedEl.checked) {
            targetArr.push(affectedData);
          } else {
            targetArr.splice(targetArr.indexOf(affectedData), 1);
          }
          updateAikariPLSRulesToRemote(
            "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost.frozenDisks",
            targetArr,
            "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost"
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
        associateVal: [
          "ssaFeatures.securityPolicies.freezeManagement.freezeDiskInfoPost.frozenDisks",
        ],
        listenerType: "aikari",
      },
    ],
  },
  {
    id: 1,
    categoryName: "软件信息",
    child: [
      {
        index: 0,
        id: "enableSoftwareReportPostOverride",
        type: "switch",
        name: "启用软件信息上报覆写",
        description:
          '覆写上报的软件信息, 可自定义集控端 "设备管控" - <设备名> - "软件列表" 下的信息显示',
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: false,
        warning: true,
        warningContent: '此功能与 "弹窗拦截" 等无关',
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return false;
          return global.__HUGO_AURA__.aikariRules.deviceInfo.software
            .softwareReportPost.enabled;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (!global.__HUGO_AURA__.aikariRules) return;

          global.__HUGO_AURA__.aikariRules.deviceInfo.software.softwareReportPost.enabled =
            newVal;
          updateAikariPLSRulesToRemote(
            "deviceInfo.software.softwareReportPost.enabled",
            newVal,
            "deviceInfo.software.softwareReportPost"
          );
          return true;
        },
      },
      {
        index: 1,
        id: "enableSoftwareReportPostSetAsEmpty",
        type: "switch",
        name: "清空软件上报列表",
        description: "将上报列表置空, 集控端将无法看到任何已安装应用",
        reactive: true,
        reactiveVal: ["root.ruleSettings"],
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: false,
        associateVal: ["deviceInfo.software.softwareReportPost.enabled"],
        auraIf: () => true,
        auraDisable: () => {
          if (!global.__HUGO_AURA__.aikariRules) return { value: true };

          return {
            value:
              !global.__HUGO_AURA__.aikariRules.deviceInfo.software
                .softwareReportPost.enabled,
            tooltip: "启用软件信息上报覆写以继续",
          };
        },
        defaultValue: true,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariRules) return true;
          return global.__HUGO_AURA__.aikariRules.deviceInfo.software
            .softwareReportPost.setAsEmpty;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          if (!global.__HUGO_AURA__.aikariRules) return;

          global.__HUGO_AURA__.aikariRules.deviceInfo.software.softwareReportPost.setAsEmpty =
            newVal;
          updateAikariPLSRulesToRemote(
            "deviceInfo.software.softwareReportPost.setAsEmpty",
            newVal,
            "deviceInfo.software.softwareReportPost"
          );
          return true;
        },
      },
    ],
  },
];

module.exports = { deviceInfoPostSettings };
