// @ts-check

const { BrowserWindow } = require("electron");

const composables = {
  getBrowserWindowInstance: (windowKey) => {
    if (!global.__HUGO_AURA__.hookedWindows) return null;
    const hookedWindowIns = global.__HUGO_AURA__.hookedWindows.get(windowKey);
    if (!hookedWindowIns) return undefined;
    const browserWindowIns = BrowserWindow.fromWebContents(
      hookedWindowIns.webContents
    );
    return browserWindowIns;
  },
};

/**
 *
 * @param {import("electron").IpcMain} ipcMain
 */
const applyBaseIpcHandler = (ipcMain) => {
  const methodBase = "$aura.base";

  ipcMain.on(
    `${methodBase}.minimizeWindow`,
    /**
     *
     * @param {import("electron").IpcMainEvent} _event
     * @param {{ targetWindowKey: string }} arg
     */
    (_event, arg) => {
      const browserWindowIns = composables.getBrowserWindowInstance(
        arg.targetWindowKey
      );
      if (!browserWindowIns) return;

      browserWindowIns.minimize();
    }
  );

  ipcMain.on(
    `${methodBase}.closeWindow`,
    /**
     *
     * @param {import("electron").IpcMainEvent} _event
     * @param {{ targetWindowKey: string }} arg
     */
    (_event, arg) => {
      const browserWindowIns = composables.getBrowserWindowInstance(
        arg.targetWindowKey
      );
      if (!browserWindowIns) return;

      browserWindowIns.close();
    }
  );

  ipcMain.handle(`${methodBase}.getAuraDirAsync`, (_evt, _arg) => {
    return {
      success: true,
      data: global.__HUGO_AURA__.auraDir,
    };
  });

  ipcMain.on(`${methodBase}.getAuraDirSync`, (event, _arg) => {
    event.returnValue = {
      success: true,
      data: global.__HUGO_AURA__.auraDir,
    };
  });
};

module.exports = { applyBaseIpcHandler };
