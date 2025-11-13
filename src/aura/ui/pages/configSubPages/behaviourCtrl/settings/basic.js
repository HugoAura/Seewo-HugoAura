const REQUIRE_BASE = ".";

const {
  updateAikariConfigToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

const reusableChkFn = {
  checkRelativePath: () => {
    if (newVal === "" || !newVal)
      return { valid: false, hint: "请输入证书路径" };

    if (newVal.includes(":/") || newVal.includes(":\\")) {
      return { valid: false, hint: "请输入相对路径, 而非绝对路径" };
    }

    if (newVal.includes("\\")) {
      return {
        valid: false,
        hint: '请输入正确的路径, 使用 "/" 作为路径符',
      };
    }

    return {
      valid: true,
    };
  },
};

const basicSettings = [
  {
    id: 0,
    categoryName: "可访问性",
    child: [
      {
        index: 0,
        id: "plsListenPort",
        type: "input",
        subType: "number",
        name: "PLS WS 默认监听端口",
        description: "PLS 的 WebSocket 服务器将默认监听指定的端口",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: false,
        warning: true,
        warningContent: "PLS 仍会在默认端口被占用时, 自动随机端口重试",
        associateVal: null,
        auraIf: () => true,
        defaultValue: "",
        placeHolder: "输入端口号 (10000 ~ 65535)",
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.wsPort;
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal)
            return { valid: false, hint: "请输入端口号" };

          const numberNewVal = Number(newVal);
          if (numberNewVal === NaN || !(10000 <= numberNewVal) || !(newVal <= 65535)) {
            return { valid: false, hint: "请输入合法的端口号 (10000 ~ 65535)" };
          }

          global.__HUGO_AURA__.aikariSettings.wsPort = numberNewVal;
          updateAikariConfigToRemote("wsPort", numberNewVal);
          return { valid: true };
        },
      },
      {
        index: 1,
        id: "plsCertPath",
        type: "input",
        subType: "text",
        name: "WSS TLS 证书相对路径",
        description: "PLS 将使用指定路径下的证书启动 WSS 服务器",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: true,
        tip: true,
        tipTitle:
          '路径相对于 "%PROGRAMDATA%\\HugoAura\\Aura-PLS\\", 使用 "/" 作为路径符',
        associateVal: null,
        auraIf: () => true,
        defaultValue: "",
        placeHolder: "输入相对路径, 例如: config/vme50/cert.crt",
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.certPath;
        },
        callbackFn: (newVal) => {
          const validate = reusableChkFn.checkRelativePath();
          if (!validate.valid) {
            return validate;
          }

          global.__HUGO_AURA__.aikariSettings.certPath = newVal;
          updateAikariConfigToRemote("certPath", newVal);
          return { valid: true };
        },
      },
      {
        index: 2,
        id: "plsCertPath",
        type: "input",
        subType: "text",
        name: "WSS TLS 证书私钥相对路径",
        description: "PLS 将使用指定路径下的私钥启动 WSS 服务器",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: true,
        tip: true,
        tipTitle:
          '路径相对于 "%PROGRAMDATA%\\HugoAura\\Aura-PLS\\", 使用 "/" 作为路径符',
        warning: true,
        warningContent: "请使用 PEM 格式的密钥",
        associateVal: null,
        auraIf: () => true,
        defaultValue: "",
        placeHolder: "输入相对路径, 例如: config/vme50/cert.key",
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.keyPath;
        },
        callbackFn: (newVal) => {
          const validate = reusableChkFn.checkRelativePath();
          if (!validate.valid) {
            return validate;
          }

          global.__HUGO_AURA__.aikariSettings.keyPath = newVal;
          updateAikariConfigToRemote("keyPath", newVal);
          return { valid: true };
        },
      },
      {
        index: 3,
        id: "plsRegenCertAftRelaunch",
        type: "switch",
        name: "重新生成 TLS 证书",
        description: "PLS 将在下次启动时重新生成 TLS 证书",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        AikariRequired: true,
        restartAikari: true,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.regenCert;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return false;

          global.__HUGO_AURA__.aikariSettings.regenCert = newVal;
          updateAikariConfigToRemote("regenCert", newVal);
          return true;
        },
      },
    ],
  },
];

module.exports = { basicSettings };
