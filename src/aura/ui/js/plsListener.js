(() => {
  const IPC_METHOD_BASE = "$aura.pls";
  const REQUIRE_BASE = "../../aura/ui";
  const __SCOPE = "assistant";
  const {
    updatePlsStatusFromLocal,
  } = require(`${REQUIRE_BASE}/composables/plsConfigManager`);

  const setupListeners = () => {
    if (!global.ipcRenderer)
      global.ipcRenderer = require("electron").ipcRenderer;

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onPlsStatsUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.plsStats = arg;
        document.dispatchEvent(
          new CustomEvent("onPLSStatsUpdate", {
            detail: {
              connected: arg.connected,
            },
          })
        );
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onPlsSettingsUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.plsSettings = arg;
        document.dispatchEvent(
          new CustomEvent("onPLSConfigUpdate", {
            detail: {
              path: ["root", "settings"],
              value: arg,
            },
          })
        );
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onPlsRulesUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.plsRules = arg;
        document.dispatchEvent(
          new CustomEvent("onPLSConfigUpdate", {
            detail: {
              path: ["root", "ruleSettings"],
              value: arg,
            },
          })
        );
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.updateRetryStatus`,
      (_event, arg) => {
        document.dispatchEvent(
          new CustomEvent("onPLSStatsUpdate", {
            detail: {
              connected: arg.success,
            },
          })
        );
        if (
          global.__HUGO_AURA_LOADER__["Aura.UI.Assistant.Config.BehaviourCtrl"]
            .active
        ) {
          setTimeout(() => {
            global.__HUGO_AURA_GLOBAL__.utils.refreshBsTooltip();
          }, 500);
        }
      }
    );
  };

  updatePlsStatusFromLocal();
  setupListeners();
})();
