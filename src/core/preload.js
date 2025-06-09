// @ts-check

const __AURA_VERSION__ = "0.1.1-pre-IV";

(() => {
  if (require.main) return; // 如果只是导入 Aura Version, 不运行闭包逻辑

  // >>> Init Global Vars <<< //
  if (!global.__HUGO_AURA__) {
    global.__HUGO_AURA__ = {
      configInit: true, // preload 始终比 hook 晚, 默认 config 已初始化
      // ↑ 保留此参数的目的 -> 用于 configManager 中, configManager 的行为在 Renderer 和 Main 中是一致的
      version: __AURA_VERSION__,
    };
  }

  if (!global.__HUGO_AURA_UI_FUNCTIONS__) {
    global.__HUGO_AURA_UI_FUNCTIONS__ = {};
  }

  if (!global.__HUGO_AURA_UI_REACTIVES__) {
    global.__HUGO_AURA_UI_REACTIVES__ = {};
  }

  // >>> Init EventBus <<< //
  const EventBus = require("../aura/utils/eventBus");
  if (!global.__HUGO_AURA_EVENT_BUS__) {
    global.__HUGO_AURA_EVENT_BUS__ = new EventBus();
  }

  // >>> Load Modules <<< //
  const ConfigManager = require("../aura/init/shared/configManager");
  const WebpackHook = require("../aura/init/preload/webpackHook");

  const configManager = new ConfigManager();
  configManager.side = "renderer";
  if (!global.__HUGO_AURA_CONFIG_MGR__)
    global.__HUGO_AURA_CONFIG_MGR__ = configManager;

  console.log(`[HugoAura / Preload] Preparing...`);

  /**
   *
   * @param {any} baseObj
   * @param {(string | symbol)[]} path
   * @returns
   */
  const createConfigProxy = (baseObj, path = []) => {
    return new Proxy(baseObj, {
      get(target, prop) {
        if (typeof target[prop] === "object" && target[prop] !== null) {
          return createConfigProxy(target[prop], [...path, prop]);
        }
        return target[prop];
      },
      set(target, prop, value) {
        target[prop] = value;
        const configUpdateEvent = new CustomEvent("onHugoAuraConfigUpdate", {
          detail: {
            path: [...path, prop],
            value,
          },
        });
        const pathName = [...path, prop].join(".");
        document.dispatchEvent(configUpdateEvent);

        const settingsEntries = document.getElementsByClassName(
          "aura-settings-entry"
        );
        if (settingsEntries.length > 0) {
          Array.from(settingsEntries).forEach((entry) => {
            entry.dispatchEvent(configUpdateEvent);
          });
        }
        console.log(
          `[HugoAura / Config] Config changed at path: ${[...path, prop].join(
            "."
          )}, new value: ${value}`
        );

        const isEditingEncSettings = pathName.includes(
          "auraSettings.settingsPassword"
        );

        if (
          isEditingEncSettings &&
          global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig
        ) {
          return true;
        }

        if (!configManager.useEncConfig) {
          configManager.writeConfig(window.__HUGO_AURA_CONFIG__); // 仅非加密 Config 使用即时写入, 否则会导致性能问题
        } else {
          if (global.__HUGO_AURA_UI_REACTIVES__.config) {
            global.__HUGO_AURA_UI_REACTIVES__.config.isConfigPendingWrite = true;
          }
          if (global.__HUGO_AURA_UI_FUNCTIONS__.config?.handleACSNShow) {
            global.__HUGO_AURA_UI_FUNCTIONS__.config.handleACSNShow();
          }
        }
        return true;
      },
    });
  };

  const getConfig = () => {
    /*
    if (configManager.useEncConfig) {
      if (!ipcRenderer) ipcRenderer = require("electron").ipcRenderer;
      const result = ipcRenderer.sendSync("$aura.config.getConfigFromMainSync");
      if (result.success) {
        configManager.isConfigReadFailed = false;
        return result.data;
      } else {
        configManager.isConfigReadFailed = true;
        return configManager.getDefaultConfig();
      }
    } else {
      const result = configManager.readConfig();
      configManager.isConfigReadFailed = false;
      return result;
    }
    */
    // ↑ IPC Renderer 在 Preload 时无法访问, 因此无法从主进程拉取配置
    const result = configManager.readConfig();
    configManager.isConfigReadFailed = false;
    return result;
  };

  // >>> Init Config <<< //
  const initialConfig = getConfig();
  window.__HUGO_AURA_CONFIG__ = createConfigProxy(initialConfig);

  // >>> Init Renderer Hooks <<< //
  window.__HUGO_AURA_HOOK__ = {};
  const webpackHook = new WebpackHook();
  webpackHook.installHook(window, initialConfig);

  // >>> Done <<< //
  console.log(`[HugoAura / AppHook / DONE] Hooks installed`);
  console.log(`[HugoAura / Preload / DONE] Preload done`);
})();

module.exports = { __AURA_VERSION__ };
