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
  // @ts-ignore
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
    const sendDataToWebContents = (key, chan, targetData) => {
      const webContents =
        global.__HUGO_AURA__.hookedWindows.get(key).webContents;

      if (grep !== webContents) webContents.send(chan, targetData);
    };

    if (windowKey === "*") {
      for (const perWindow of global.__HUGO_AURA__.hookedWindows.keys()) {
        sendDataToWebContents(perWindow, channel, data);
      }
    } else {
      const isWindowValid = global.__HUGO_AURA__.hookedWindows.has(windowKey);
      if (!isWindowValid) {
        throw new Error(
          `[HugoAura / Main / IPC / ERROR] Unknown windowKey: ${windowKey}`
        );
      }

      sendDataToWebContents(windowKey, channel, data);
    }
  };

  const { applyPlsIpcHandler } = require("./ipcModules/plsIpcHandler");

  ipcMain.handle("$aura.base.restartApplication", async () => {
    app.relaunch();
    app.exit(0);
  });

  applyPlsIpcHandler(ipcMain);
};

module.exports = { buildIpcMain };
