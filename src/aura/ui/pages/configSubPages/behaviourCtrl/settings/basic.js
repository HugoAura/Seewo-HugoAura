const REQUIRE_BASE = ".";

const path = require("path");

const AIKARI_ROOT_DIR = path.join("C:\\ProgramData", "HugoAura", "Aikari");

const {
  updateAikariConfigToRemote,
  updateAikariTelemetryConfigToRemote,
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
  {
    id: 1,
    categoryName: "分析",
    child: [
      {
        index: 0,
        id: "aikariTelemetryCtrl",
        type: "switch",
        name: "启用错误收集与分析",
        description: "启用后, Aikari 将在发生错误时上报自托管 Sentry",
        reactive: true,
        reactiveVal: ["root.settings"],
        restart: false,
        reload: false,
        aikariRequired: false,
        restartAikari: false,
        warning: true,
        warningContent:
          "我们不会收集您的设备用户名、管家内的学校名等信息, 也不会保存您的 IP 地址, 所有上传的数据仅供调试使用, 不会与任何第三方共享",
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          if (
            !global.__HUGO_AURA__.aikariSettings ||
            !global.__HUGO_AURA__.aikariStats.connected
          ) {
            const fs = require("fs");
            return fs.existsSync(
              path.join(AIKARI_ROOT_DIR, ".telemetryEnabled")
            );
          } else {
            return global.__HUGO_AURA__.aikariSettings.telemetryEnabled;
          }
        },
        callbackFn: (newVal) => {
          if (
            !global.__HUGO_AURA__.aikariSettings ||
            !global.__HUGO_AURA__.aikariStats.connected
          ) {
            if (newVal) {
              const fs = require("fs");
              fs.appendFile(
                path.join(AIKARI_ROOT_DIR, ".telemetryEnabled"),
                "",
                (err) => {
                  if (err) console.warn(err);
                }
              );
              return true;
            } else {
              const fs = require("fs");
              try {
                fs.unlinkSync(path.join(AIKARI_ROOT_DIR, ".telemetryEnabled"));
                return true;
              } catch (err) {
                console.error("Error removing telemetry flag: ", err);
              }
            }
          } else {
            global.__HUGO_AURA__.aikariSettings.telemetryEnabled = newVal;
            updateAikariTelemetryConfigToRemote(newVal);
            return true;
          }
        },
      },
      {
        index: 1,
        id: "aikariTelemetryId",
        type: "button",
        style: "outline",
        name: "Aikari Telemetry ID",
        reactive: true,
        reactiveVal: ["telemetry"],
        restart: false,
        reload: false,
        aikariRequired: true,
        restartAikari: false,
        warning: true,
        warningContent: "此标识符完全在初始化时随机生成, 与设备特征无关",
        associateVal: ["telemetry"],
        auraIf: () => true,
        alwaysEnable: true,
        buttonContent: "复制",
        valueGetter: async () => {
          if (!global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl)
            global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl = {};
          const getIdPromise = new Promise((resolve) => {
            setTimeout(() => {
              const fs = require("fs");
              const telemetryIdPath = path.join(
                AIKARI_ROOT_DIR,
                ".telemetryId"
              );
              if (fs.existsSync(telemetryIdPath)) {
                const fileContent = fs
                  .readFileSync(telemetryIdPath, { encoding: "utf-8" })
                  .trim();

                global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl.telemetryId =
                  fileContent;
                resolve("标识符: " + fileContent);
              }
              global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl.telemetryId =
                null;
              resolve("未能获取标识符, Aikari 未安装或未初始化");
            }, 1000);
          });
          return await getIdPromise;
        },
        callbackFn: async (event) => {
          if (
            global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl
              .telemetryId
          ) {
            await navigator.clipboard.writeText(
              global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrl
                .telemetryId
            );
            event.target.textContent = "已复制";
          } else {
            event.target.textContent = "复制失败";
          }
        },
      },
    ],
  },
];

module.exports = { basicSettings };
