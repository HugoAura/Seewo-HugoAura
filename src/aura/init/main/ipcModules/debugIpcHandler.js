// @ts-check

const __SCOPE = "main";

/**
 * 
 * @param {import("electron").IpcMain} ipcMain 
 */
const applyDebugIpcHandler = (ipcMain) => {
  const methodBase = "$aura.debug";

  ipcMain.handle(`${methodBase}.getLogDirAsync`, (_evt, _arg) => {
    return {
      success: true,
      data: global.__HUGO_AURA__.logDir,
    };
  });
};

module.exports = { applyDebugIpcHandler };
