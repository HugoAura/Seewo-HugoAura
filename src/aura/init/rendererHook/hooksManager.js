const fs = require("fs");
const path = require("path");

class HooksManager {
  loadHooks() {
    if (global.__HUGO_AURA__.hooks) {
      return global.__HUGO_AURA__.hooks;
    }

    const hooksPath = path.join(__dirname, "../../../aura/ui/hooks");
    const hooks = new Map();

    try {
      const files = fs.readdirSync(hooksPath);
      files.forEach((file) => {
        if (!file.endsWith(".js")) return;

        try {
          const hook = require(path.join(hooksPath, file));
          const targetWindow = hook.windowName || path.basename(file, ".js");
          hooks.set(targetWindow, hook);
          console.log(
            `[HugoAura / Init] Loaded hook for window: ${targetWindow}`
          );
        } catch (err) {
          console.error(
            `[HugoAura / Init / Error] Failed to load hook ${file}:`,
            err
          );
        }
      });
    } catch (err) {
      console.error(
        "[HugoAura / Init / Error] Failed to read hooks directory:",
        err
      );
    }

    global.__HUGO_AURA__.hooks = hooks;
    return hooks;
  }

  cleanupWindow(windowKey, listeners) {
    console.log(
      `[HugoAura / Cleanup / ${windowKey}] Window destroyed, cleaning up...`
    );

    if (listeners) {
      const { webContents, domReadyListener, destroyedListener } = listeners;
      webContents.removeListener("dom-ready", domReadyListener);
      webContents.removeListener("destroyed", destroyedListener);
    }

    global.__HUGO_AURA__.hookedWindows.delete(windowKey);
  }

  handleWindowHook(webContents, hookConfig, windowName) {
    if (!hookConfig) return;

    const windowKey = `${hookConfig.windowName || windowName}`;
    if (global.__HUGO_AURA__.hookedWindows.has(windowKey)) {
      console.log(
        `[HugoAura / Init] Duplicate hook for ${windowKey}, ignoring...`
      );
      return;
    }

    console.log(`[HugoAura / Init] Hook is initializing for ${windowKey}...`);
    console.log(
      `[HugoAura / Init] Hook loaded at: ${new Date().toISOString()}`
    );

    const domReadyListener = () => {
      try {
        console.log(
          `[HugoAura / UI / Verb / ${windowKey}] Loading injection script...`
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
              `[HugoAura / UI / Done / ${windowKey}] Injection script executed`
            )
          )
          .catch((err) =>
            console.error(
              `[HugoAura / UI / Error / ${windowKey}] Failed to execute injection script:`,
              err
            )
          );
      } catch (err) {
        console.error(
          `[HugoAura / UI / Error / ${windowKey}] Failed to load UI hook:`,
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
      `[HugoAura / Init / Success / ${windowKey}] Hook initialized successfully!`
    );
  }
}

module.exports = HooksManager;
