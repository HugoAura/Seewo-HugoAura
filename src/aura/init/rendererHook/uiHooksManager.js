// @ts-check

const fs = require("fs");
const path = require("path");

class RendererHooksManager {
  loadHooks() {
    if (
      global.__HUGO_AURA__.uiHooks &&
      Object.keys(global.__HUGO_AURA__.uiHooks).length !== 0
    ) {
      return global.__HUGO_AURA__.uiHooks;
    }

    const hooksPath = path.join(__dirname, "../../../aura/ui/hookDefinitions");

    /** @type {import("../../types/main/core").HooksMap} */
    const hooks = new Map();

    try {
      const files = fs.readdirSync(hooksPath);
      files.forEach((file) => {
        if (!file.endsWith(".js")) return;

        try {
          const hook = require(path.join(hooksPath, file));
          /** @type {import("../../types/main/core").WindowName} */
          const targetWindow = hook.windowName || path.basename(file, ".js");
          hooks.set(targetWindow, hook);
          console.log(
            `[HugoAura / Init / RDH] Loaded ui hook for window: ${targetWindow}`
          );
        } catch (err) {
          console.error(
            `[HugoAura / Init / RDH / Error] Failed to load ui hook ${file}:`,
            err
          );
        }
      });
    } catch (err) {
      console.error(
        "[HugoAura / Init / RDH / Error] Failed to ui hooks directory:",
        err
      );
    }

    global.__HUGO_AURA__.uiHooks = hooks;
    return hooks;
  }

  /**
   *
   * @param {import("../../types/main/core").WindowName} windowKey
   * @param {import("../../types/main/core").HookedWindow} hookedWindowProps
   */
  cleanupWindow(windowKey, hookedWindowProps) {
    console.log(
      `[HugoAura / Cleanup / RDH / ${windowKey}] Window destroyed, cleaning up...`
    );

    if (hookedWindowProps) {
      const { webContents, domReadyListener, destroyedListener } =
        hookedWindowProps;
      webContents.removeListener("dom-ready", domReadyListener);
      webContents.removeListener("destroyed", destroyedListener);
    }

    global.__HUGO_AURA__.hookedWindows.delete(windowKey);
  }

  /**
   *
   * @param {import("electron").WebContents} webContents
   * @param {import("../../types/render/uiHook").UIHookConfigFin} hookConfig
   * @param {import("../../types/main/core").WindowName} windowName
   * @returns
   */
  handleWindowHook(webContents, hookConfig, windowName) {
    if (!hookConfig) return;

    /** @type {import("../../types/main/core").WindowName} */
    const windowKey = `${hookConfig.windowName || windowName}`;
    if (global.__HUGO_AURA__.hookedWindows.has(windowKey)) {
      console.log(
        `[HugoAura / Init / RDH] Duplicate ui hook for ${windowKey}, ignoring...`
      );
      return;
    }

    console.log(`[HugoAura / Init / RDH] UI Hook is initializing for ${windowKey}...`);
    console.log(
      `[HugoAura / Init / RDH] UI Hook loaded at: ${new Date().toISOString()}`
    );

    const domReadyListener = () => {
      try {
        console.log(
          `[HugoAura / RDH / Verb / ${windowKey}] Loading injection script...`
        );

        const injectionScript = fs
          .readFileSync(path.join(__dirname, "./injection.js"), "utf8")
          .replace('"__TEMPLATE_TARGETS__"', JSON.stringify(hookConfig.targets))
          .replace(
            '"__TEMPLATE_GLOBAL_STYLES__"',
            JSON.stringify(hookConfig.globalStyles || [])
          )
          .replace(
            '"__TEMPLATE_GLOBAL_JS__"',
            JSON.stringify(hookConfig.globalJS || [])
          )
          .replace("__TEMPLATE_ON_LOADED__", hookConfig.onLoaded || "");

        webContents
          .executeJavaScript(injectionScript, true)
          .then(() =>
            console.log(
              `[HugoAura / RDH / Done / ${windowKey}] Injection script executed`
            )
          )
          .catch((err) =>
            console.error(
              `[HugoAura / RDH / Error / ${windowKey}] Failed to execute injection script:`,
              err
            )
          );
      } catch (err) {
        console.error(
          `[HugoAura / RDH / Error / ${windowKey}] Failed to load UI hook:`,
          err
        );
      }
    };

    const destroyedListener = () => {
      this.cleanupWindow(
        windowKey,
        global.__HUGO_AURA__.hookedWindows.get(windowKey)
      );
    };

    webContents.on("dom-ready", domReadyListener);
    webContents.on("destroyed", destroyedListener);

    global.__HUGO_AURA__.hookedWindows.set(windowKey, {
      webContents,
      domReadyListener,
      destroyedListener,
    });

    console.log(
      `[HugoAura / Init / RDH / Success / ${windowKey}] UI Hook initialized.`
    );
  }
}

module.exports = RendererHooksManager;
