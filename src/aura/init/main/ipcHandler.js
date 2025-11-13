// @ts-check

const __SCOPE = "main";

/**
 *
 * @param {import("electron")} electron
 */
const buildIpcMain = (electron) => {
  const { app } = electron;
  /**
   * @type {import("../../types/main/electron").AuraIPCMain}
   */
  // @ts-expect-error
  const ipcMain = electron.ipcMain;

  /**
   *
   * @param {string} windowKey
   * @param {string} channel
   * @param {any} data
   * @param {import("electron").WebContents?} grep
   */
  ipcMain.send = (windowKey, channel, data, grep = null) => {
    /**
     *
     * @param {string} key
     * @param {string} chan
     * @param {any} targetData
     */
    if (!global.__HUGO_AURA__.hookedWindows) {
      return {
        success: false,
      };
    }

    const sendDataToWebContents = (key, chan, targetData) => {
      const webContents =
        // @ts-expect-error
        global.__HUGO_AURA__.hookedWindows.get(key)?.webContents;

      if (!webContents) {
        console.error(
          `[HugoAura / Main / IPC / ERROR] Failed sending data to ${key}: WebContents not found`
        );
        return {
          success: false,
        };
      }

      if (grep !== webContents) {
        webContents.send(chan, targetData);
      }

      return {
        success: true,
      };
    };

    if (windowKey === "*") {
      for (const perWindow of global.__HUGO_AURA__.hookedWindows.keys()) {
        sendDataToWebContents(perWindow, channel, data);
      }
    } else {
      const isWindowValid = global.__HUGO_AURA__.hookedWindows.has(windowKey);
      if (!isWindowValid) {
        console.warn(
          `[HugoAura / Main / IPC / WARN] Unknown windowKey: ${windowKey}, window may not have started yet.`
        );
        return {
          success: false,
        };
      }

      sendDataToWebContents(windowKey, channel, data);
    }
  };

  const { applyBaseIpcHandler } = require("./ipcModules/baseIpcHandler");
  const { applyDebugIpcHandler } = require("./ipcModules/debugIpcHandler");
  const { applyConfigIpcHandler } = require("./ipcModules/configIpcHandler");
  const { applyFsIpcHandler } = require("./ipcModules/fsIpcHandler");
  const { applyAikariIpcHandler } = require("./ipcModules/aikariIpcHandler");

  ipcMain.handle("$aura.base.restartApplication", async () => {
    app.relaunch();
    app.exit(0);
  });

  applyBaseIpcHandler(ipcMain);
  applyDebugIpcHandler(ipcMain);
  applyConfigIpcHandler(ipcMain);
  applyFsIpcHandler(ipcMain);
  applyAikariIpcHandler(ipcMain);
};

module.exports = { buildIpcMain };
