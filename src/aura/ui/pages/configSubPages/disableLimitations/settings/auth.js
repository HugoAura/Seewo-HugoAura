const authSettings = [
  {
    id: 0,
    categoryName: "管家身份验证",
    child: [
      {
        index: 0,
        id: "enableAuthOverride",
        type: "switch",
        name: "启用身份验证覆写功能",
        description: "覆写希沃管家的身份验证组件, 实现限制解除",
        restart: false,
        reload: true,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].enabled;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].enabled = newVal;
        },
      },
      {
        index: 1,
        id: "authOverrideType",
        type: "radio",
        name: "密码覆写模式",
        description: "自定义密码 / 完全解除密码 / 仅使用学校密码",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: '使用 "任意" 选项后, 仍需输入至少一位密码才能继续操作',
        associateVal: ["rewrite.vendor/passwordValidation.enabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].enabled;
        },
        defaultValue: "none",
        templates: ["customPassword", "bypass", "none"],
        templateLabels: ["自定义", "任意", "不修改"],
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].type;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].type = newVal;
        },
      },
      {
        index: 2,
        id: "customPassword",
        type: "input",
        subType: "password",
        name: "自定义密码",
        description: "设置一个自定义密码, 可与原管理密码共用",
        restart: false,
        reload: false,
        associateVal: [
          "rewrite.vendor/passwordValidation.enabled",
          "rewrite.vendor/passwordValidation.type",
        ],
        auraIf: () => {
          return (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"]
              .enabled &&
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"]
              .type === "customPassword"
          );
        },
        defaultValue: "",
        placeHolder: "留空表示不修改, 保留已设置值",
        valueGetter: () => {
          return "";
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal) return { valid: true };
          if (newVal.length < 6)
            return { valid: false, hint: "请输入至少 6 位密码" };
          const __config =
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require("crypto");
          const result = crypto
            .createHash("md5")
            .update(newVal + __config.customPassword.salt)
            .digest("hex");
          __config.customPassword.passwordWithSalt = result;
          return { valid: true };
        },
      },
      {
        index: 3,
        id: "authModeRewriteType",
        type: "radio",
        name: "验证方式覆写",
        description: "密码 + 二维码混合 / 仅二维码 / 仅密码",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: '一般选择 "混合" 或 "仅密码" 即可',
        associateVal: ["rewrite.vendor/passwordValidation.enabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].enabled;
        },
        defaultValue: "hybrid",
        templates: ["default", "hybrid", "remoteOnly", "passwordOnly"],
        templateLabels: ["默认", "混合", "仅二维码", "仅密码"],
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].authModeRewrite;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].authModeRewrite = newVal;
        },
      },
    ],
  },
  {
    id: 1,
    categoryName: "屏幕锁",
    child: [
      {
        index: 0,
        id: "enableScreenLockOverride",
        type: "switch",
        name: "启用屏幕锁覆写功能",
        description: "覆写希沃管家的屏幕锁组件, 绕过限制",
        restart: false,
        reload: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: true,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].enabled =
            newVal;
        },
      },
      {
        index: 1,
        id: "disableKeyboardHook",
        type: "switch",
        name: "允许快捷键操作",
        description: "屏蔽键盘 DLL Hook, 允许在屏幕锁中操作快捷键",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "此功能正在测试中, 可能并不稳定",
        associateVal: ["rewrite.vendor/screenLock.enabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .disableKeyboardHook;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/screenLock"
          ].disableKeyboardHook = newVal;
        },
      },
      {
        index: 2,
        id: "fastfailScreenLock",
        type: "switch",
        name: "禁用屏幕锁",
        description: "启用本功能后, 屏幕锁将完全无法使用, <b>请注意风险</b>",
        restart: false,
        reload: false,
        warning: true,
        warningContent: "本功能存在极大的被发现风险, 启用前请自估风险",
        associateVal: ["rewrite.vendor/screenLock.fastfail"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .fastfail;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].fastfail =
            newVal;
        },
      },
      {
        index: 3,
        id: "showDirectUnlock",
        type: "switch",
        name: '显示 "直接解锁" 按钮',
        description: '启用后, 屏幕锁下方的解锁类型选择区域可选择 "直接解锁"',
        restart: false,
        reload: false,
        warning: true,
        warningContent: "本功能存在极大的被发现风险, 启用前请自估风险",
        associateVal: [
          "rewrite.vendor/screenLock.enabled",
          "rewrite.vendor/screenLock.fastfail",
        ],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].fastfail
          ) {
            return { value: true, tooltip: '关闭 "禁用屏幕锁" 以继续' };
          }
          return { value: false };
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .showDirectUnlock;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/screenLock"
          ].showDirectUnlock = newVal;
        },
      },
      {
        index: 4,
        id: "clickActBtnToExit",
        type: "switch",
        name: "连击紧急解锁",
        description: '启用后, 连击 10 次 "激活码解锁" 按钮可紧急解锁',
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "不建议关闭本功能, 至少给自己留条出路",
        associateVal: [
          "rewrite.vendor/screenLock.enabled",
          "rewrite.vendor/screenLock.fastfail",
        ],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].fastfail
          ) {
            return { value: true, tooltip: '关闭 "禁用屏幕锁" 以继续' };
          }
          return { value: false };
        },
        defaultValue: true,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .clickBtnToExit;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/screenLock"
          ].clickBtnToExit = newVal;
        },
      },
      {
        index: 5,
        id: "screenLockAuthOverrideType",
        type: "radio",
        name: "认证覆写模式",
        description: "选择一个认证覆写模式, 或不修改认证策略",
        restart: false,
        reload: false,
        associateVal: [
          "rewrite.vendor/screenLock.enabled",
          "rewrite.vendor/screenLock.fastfail",
        ],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .enabled;
        },
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].fastfail
          ) {
            return { value: true, tooltip: '关闭 "禁用屏幕锁" 以继续' };
          }
          return { value: false };
        },
        defaultValue: "none",
        templates: ["customActivationCode", "none"],
        templateLabels: ["自定义激活码", "不修改"],
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
            .authRewriteType;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/screenLock"
          ].authRewriteType = newVal;
        },
      },
      {
        index: 6,
        id: "customActivationCode",
        type: "input",
        subType: "password",
        name: "自定义激活码",
        description: '请在屏幕锁页面下方选择 "激活码解锁" 以使用',
        restart: false,
        reload: false,
        warning: true,
        warningContent: "密码为 6 位纯数字",
        associateVal: [
          "rewrite.vendor/screenLock.enabled",
          "rewrite.vendor/screenLock.authRewriteType",
          "rewrite.vendor/screenLock.fastfail",
        ],
        auraIf: () => {
          return (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].enabled &&
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"]
              .authRewriteType === "customActivationCode"
          );
        },
        auraDisable: () => {
          if (
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"].fastfail
          ) {
            return { value: true, tooltip: '关闭 "禁用屏幕锁" 以继续' };
          }
          return { value: false };
        },
        defaultValue: "",
        placeHolder: "留空表示不修改, 保留已设置值",
        valueGetter: () => {
          return "";
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal) return { valid: true };
          if (newVal.length !== 6)
            return { valid: false, hint: "仅可输入 6 位密码" };
          if (!/^\d+$/.test(newVal)) {
            return { valid: false, hint: "仅允许纯数字密码" };
          }
          const __config =
            global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"];
          const crypto = require("crypto");
          const result = crypto
            .createHash("md5")
            .update(newVal + "auraScreenLockCrack")
            .digest("hex");
          __config.customActivationCode.activationCodeWithSalt = result;
          return { valid: true };
        },
      },
    ],
  },
  {
    id: 2,
    categoryName: "基础设施",
    child: [
      {
        index: 0,
        id: "enableDevTools",
        type: "switch",
        name: "启用开发者工具",
        description: "修改希沃管家的全局配置, 允许打开 DevTools",
        restart: true,
        reload: false,
        tip: true,
        tipTitle: "启用后, 按下 Ctrl + Shift + I 即可打开 DevTools",
        warning: true,
        warningContent:
          "在操作不当的情况下, 有可能造成 DevTools 永久无法激活 (Electron 的 Bug), 此时请使用 Chrome 远程调试",
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.devTools;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.devTools = newVal;
        },
      },
    ],
  },
];

module.exports = { authSettings };
