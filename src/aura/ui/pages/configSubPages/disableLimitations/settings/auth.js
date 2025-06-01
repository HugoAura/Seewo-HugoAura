const authSettings = [
  {
    id: 0,
    categoryName: "身份验证",
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
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].enabled = newVal;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        }
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
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        defaultValue: "none",
        templates: ["customPassword", "bypass", "none"],
        templateLabels: ["自定义", "任意", "不修改"],
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].type;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].type = newVal;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        }
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
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        defaultValue: "",
        placeHolder: "留空表示不修改, 保留已设置值",
        valueGetter: () => {
          return "";
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
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
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        }
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
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        defaultValue: "hybrid",
        templates: ["default", "hybrid", "remoteOnly", "passwordOnly"],
        templateLabels: ["默认", "混合", "仅二维码", "仅密码"],
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].authModeRewrite;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        callbackFn: (newVal) => {
          global.__HUGO_AURA_CONFIG__.rewrite[
            "vendor/passwordValidation"
          ].authModeRewrite = newVal;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        }
      },
    ],
  },
  {
    id: 1,
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
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.devTools;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.devTools = newVal;
        },
        // 添加密码验证逻辑
        beforeOpen: async () => {
          const { ipcRenderer } = require('electron');
          const inputPassword = prompt('请输入配置页面访问密码：');
          if (!inputPassword) return false;
          const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('md5').update(inputPassword + __config.customPassword.salt).digest('hex');
          return hashedPassword === __config.customPassword.passwordWithSalt;
        }
      },
    ],
  },
];

module.exports = { authSettings };
