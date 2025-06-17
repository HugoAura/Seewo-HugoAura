// @ts-check

const fs = require("fs");
const path = require("path");

class WindowHooksManager {
  loadHooks() {
    if (
      global.__HUGO_AURA__.windowHooks &&
      Object.keys(global.__HUGO_AURA__.windowHooks).length !== 0
    ) {
      return global.__HUGO_AURA__.windowHooks;
    }

    const hooksPath = path.join(__dirname, "../../../aura/mainProcess/hooks");

    /** @type {import("../../types/main/core").UIHooksMap} */
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
            `[HugoAura / Init / WDH] Loaded main process hook for window: ${targetWindow}`
          );
        } catch (err) {
          console.error(
            `[HugoAura / Init / WDH / Error] Failed to load main process hook ${file}:`,
            err
          );
        }
      });
    } catch (err) {
      console.error(
        "[HugoAura / Init / WDH / Error] Failed to read hooks directory:",
        err
      );
    }

    global.__HUGO_AURA__.windowHooks = hooks;
    return hooks;
  }

  initHookForWindow(
    windowName,
    centralIns,
    mainProcessAppInstance,
    browserWindowInstance
  ) {
    const stripWindowName = windowName.split("_")[0];

    if (!global.__HUGO_AURA__.windowHooks) return;

    if (!global.__HUGO_AURA__.windowHooks.has(stripWindowName)) {
      console.log(
        `[HugoAura / Init / WDH] Window ${windowName} has no corresponding main process hooks, ignoring...`
      );
      return;
    }

    const { hookFunc } = global.__HUGO_AURA__.windowHooks.get(stripWindowName);
    hookFunc(
      centralIns,
      mainProcessAppInstance,
      browserWindowInstance,
      windowName
    );

    console.log(
      `[HugoAura / Init / WDH / Success / ${windowName}] Main process hook initialized.`
    );
  }
}

module.exports = WindowHooksManager;
