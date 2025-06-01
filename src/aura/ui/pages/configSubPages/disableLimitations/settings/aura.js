const auraSettings = [
  {
    id: 0,
    categoryName: "安全性",
    child: [
      {
        index: 0,
        id: "enableAuraSettingsPasswd",
        type: "switch",
        name: "启用访问密码",
        description: "启用后, Aura 设置 UI 需要输入密码才可访问",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "在 0.1.1-beta 版本发布后, 启用访问密码将加密配置文件",
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordEnabled =
            newVal;
          // TODO: Trigger enc config
        },
      },
      {
        index: 1,
        id: "auraSettingsPasswd",
        type: "input",
        subType: "password",
        name: "访问密码",
        description: "此密码将用于访问 Aura 设置 UI",
        restart: false,
        reload: false,
        associateVal: ["auraSettings.settingsPasswordEnabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        defaultValue: "",
        placeHolder: "留空表示不修改, 保留已设置值",
        valueGetter: () => {
          return "";
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal) return { valid: true };
          if (newVal.length < 8)
            return { valid: false, hint: "请输入至少 8 位密码" };

          const hasNumber = /[0-9]/.test(newVal);
          const hasLetter = /[a-zA-Z]/.test(newVal);
          const hasSpecial = /[^a-zA-Z0-9]/.test(newVal);

          const typeCount = [hasNumber, hasLetter, hasSpecial].filter(
            Boolean
          ).length;

          if (typeCount < 2) {
            return {
              valid: false,
              hint: "请包含数字 / 字母 / 特殊字符中的至少 2 种",
            };
          }

          const crypto = require("crypto");
          const result = crypto
            .createHash("sha512")
            .update(newVal + "EndlessX")
            .digest("hex")
            .toUpperCase();
          global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordWithSalt =
            result;
          return { valid: true };
        },
      },
    ],
  },
  {
    id: 1,
    categoryName: "外观",
    child: [
      {
        index: 0,
        id: "enablePasswdDialogBlur",
        type: "switch",
        name: "密码验证框毛玻璃效果",
        description: "启用后, 密码验证时, 背景将具有毛玻璃效果",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "不建议在较旧 (如 i5 8 代) 机型上开启, 可能导致性能问题",
        associateVal: null,
        auraIf: () => true,
        defaultValue: true,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.appearance
            .enablePasswdDialogBlur;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.appearance.enablePasswdDialogBlur =
            newVal;
        },
      },
    ],
  },
];

module.exports = { auraSettings };
