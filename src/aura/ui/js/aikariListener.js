(() => {
  const IPC_METHOD_BASE = "$aura.aikari";
  const REQUIRE_BASE = "../../aura/ui";
  const __SCOPE = "assistant";
  const {
    updateAikariStatusFromLocal,
  } = require(`${REQUIRE_BASE}/composables/aikariConfigManager`);

  const setupListeners = () => {
    if (!global.ipcRenderer)
      global.ipcRenderer = require("electron").ipcRenderer;

    ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onAikariStatsUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.aikariStats = arg;

        const event = new CustomEvent("onAikariStatsUpdate", {
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
      `${IPC_METHOD_BASE}.post.onAikariSettingsUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.aikariSettings = arg;

        const event = new CustomEvent("onAikariConfigUpdate", {
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
      `${IPC_METHOD_BASE}.post.onAikariRulesUpdate`,
      (_event, arg) => {
        global.__HUGO_AURA__.aikariRules = arg;

        const event = new CustomEvent("onAikariConfigUpdate", {
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
        const event = new CustomEvent("onAikariStatsUpdate", {
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

  updateAikariStatusFromLocal();
  setupListeners();
})();
