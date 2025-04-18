const __AURA_VERSION__ = "0.1.0-beta";

(() => {
  if (!global.__HUGO_AURA__) {
    global.__HUGO_AURA__ = {
      configInit: true, // preload 始终比 hook 晚, 默认 config 已初始化
      version: __AURA_VERSION__,
    };
  }

  if (!global.__HUGO_AURA_UI_FUNCTIONS__) {
    global.__HUGO_AURA_UI_FUNCTIONS__ = {};
  }

  if (!global.__HUGO_AURA_UI_REACTIVES__) {
    global.__HUGO_AURA_UI_REACTIVES__ = {};
  }

  const configManager = require("../aura/init/shared/configManager");
  const WebpackHook = require("../aura/init/preload/webpackHook");

  console.log(`[HugoAura / AppHook / Preload] Preparing...`);

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
        document.dispatchEvent(configUpdateEvent);
        console.log(
          `[HugoAura / Config] Config changed at path: ${[...path, prop].join(
            "."
          )}, new value: ${value}`
        );
        configManager.writeConfig(window.__HUGO_AURA_CONFIG__);
        return true;
      },
    });
  };

  const initialConfig = configManager.readConfig();
  window.__HUGO_AURA_CONFIG__ = createConfigProxy(initialConfig);

  window.__HUGO_AURA_HOOK__ = {};
  const webpackHook = new WebpackHook();
  webpackHook.installHook(window, initialConfig);

  console.log(`[HugoAura / AppHook / DONE] Hooks installed`);
})();
