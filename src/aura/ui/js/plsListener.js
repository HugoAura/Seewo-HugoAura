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

        const event = new CustomEvent("onPLSStatsUpdate", {
          detail: {
            connected: arg.connected,
          },
        });

        document.dispatchEvent(event);

        const settingsEntries = document.getElementsByClassName(
          "aura-settings-entry"
        );
        if (settingsEntries.length > 0) {
          Array.from(settingsEntries).forEach((entry) => {
            entry.dispatchEvent(event);
          });
        }
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onPlsSettingsUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.plsSettings = arg;

        const event = new CustomEvent("onPLSConfigUpdate", {
          detail: {
            path: ["root", "settings"],
            value: arg,
          },
        });

        document.dispatchEvent(event);

        const settingsEntries = document.getElementsByClassName(
          "aura-settings-entry"
        );
        if (settingsEntries.length > 0) {
          Array.from(settingsEntries).forEach((entry) => {
            entry.dispatchEvent(event);
          });
        }
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onPlsRulesUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.plsRules = arg;

        const event = new CustomEvent("onPLSConfigUpdate", {
          detail: {
            path: ["root", "ruleSettings"],
            value: arg,
          },
        });

        document.dispatchEvent(event);

        const settingsEntries = document.getElementsByClassName(
          "aura-settings-entry"
        );
        if (settingsEntries.length > 0) {
          Array.from(settingsEntries).forEach((entry) => {
            entry.dispatchEvent(event);
          });
        }
      }
    );

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.updateRetryStatus`,
      (_event, arg) => {
        const event = new CustomEvent("onPLSStatsUpdate", {
          detail: {
            connected: arg.success,
          },
        });

        document.dispatchEvent(event);

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
