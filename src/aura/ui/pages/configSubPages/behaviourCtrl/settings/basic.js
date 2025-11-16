const REQUIRE_BASE = ".";

const {
  updateAikariConfigToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

const basicSettings = [
  {
    id: 0,
    categoryName: "可访问性",
    child: [
      {
        index: 0,
        id: "aikarWsPreferPort",
        type: "input",
        subType: "number",
        name: "Aikari WS 默认监听端口",
        description: "Aikari WebSocket 服务器默认监听的端口",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: false,
        warning: true,
        warningContent: "Aikari 仍会在默认端口被占用时, 自动随机端口重试",
        associateVal: null,
        auraIf: () => true,
        defaultValue: "",
        placeHolder: "输入端口号 (10000 ~ 65535)",
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.wsPreferPort;
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal)
            return { valid: false, hint: "请输入端口号" };

          const numberNewVal = Number(newVal);
          if (
            numberNewVal === NaN ||
            !(10000 <= numberNewVal) ||
            !(newVal <= 65535)
          ) {
            return { valid: false, hint: "请输入合法的端口号 (10000 ~ 65535)" };
          }

          global.__HUGO_AURA__.aikariSettings.wsPreferPort = numberNewVal;
          updateAikariConfigToRemote("wsPreferPort", numberNewVal);
          return { valid: true };
        },
      },
      {
        index: 1,
        id: "aikariForceRegenWsTlsCert",
        type: "switch",
        name: "重新生成 WS TLS 证书",
        description: "Aikari 将在下次启动时重新生成用于 WebSocket 的 TLS 证书",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: true,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (!global.__HUGO_AURA__.aikariSettings) return "";
          return global.__HUGO_AURA__.aikariSettings.tls.regenWsCertNextLaunch;
        },
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return false;

          global.__HUGO_AURA__.aikariSettings.tls.regenWsCertNextLaunch =
            newVal;
          updateAikariConfigToRemote("tls.regenWsCertNextLaunch", newVal);
          return true;
        },
      },
    ],
  },
];

module.exports = { basicSettings };
