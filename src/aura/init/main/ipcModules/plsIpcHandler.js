// @ts-check

const __SCOPE = "main";

const fs = require("fs");
const path = require("path");

/**
 *
 * @param {import("../../../types/main/electron").AuraIPCMain} ipcMain
 */
const applyPlsIpcHandler = (ipcMain) => {
  const methodBase = "$aura.pls";

  const isPlsDetached = process.argv.includes("--pls-detach");

  global.__HUGO_AURA__.plsStats = {
    installed: false,
    launched: false,
    detached: isPlsDetached,
    connected: false,
    version: "未知",
    status: "dead",
    authToken: global.__HUGO_AURA_CONFIG__.plsToken,
  };

  ipcMain.handle(
    `${methodBase}.getPlsFolderExists`,
    /**
     *
     * @returns {{ success: boolean; data: { isExists: boolean }; error?: Error }}
     */
    (_event, _arg) => {
      const plsFolderPath = path.join(__dirname, "../../../proxy");
      try {
        const result = fs.existsSync(plsFolderPath);
        return {
          success: true,
          data: { isExists: result },
        };
      } catch (e) {
        return {
          success: false,
          data: { isExists: false },
          error: e,
        };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.getPlsStats`,
    /**
     *
     * @returns {{ success: boolean; data: PLSStatus; }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.plsStats,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updatePlsStats`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {PLSStatus} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.plsStats = arg;
      ipcMain.send("assistant", `${methodBase}.post.onPlsStatsUpdate`, arg);
      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.getPlsSettings`,
    /**
     *
     * @returns {{ success: boolean; data: Record<any, any> }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.plsSettings,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updatePlsSettings`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {Record<any, any>} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.plsSettings = arg;
      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.getPlsRules`,
    /**
     *
     * @returns {{ success: boolean; data: Record<any, any> }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.plsRules,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updatePlsRules`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {Record<any, any>} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.plsRules = arg;
      return {
        success: true,
      };
    }
  );

  ipcMain.on(
    `${methodBase}.ws.broadcastMessageRecv`,
    /**
     *
     * @param {import("electron").IpcMainEvent} _event
     * @param {PLSResponse} arg
     */
    (_event, arg) => {
      ipcMain.send("assistant", `${methodBase}.ws.post.onNewMsgRecv`, arg);
    }
  );

  ipcMain.handle(
    `${methodBase}.ws.sendWsMessage`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {ClientPLSRequest} arg
     */
    (_event, arg) => {
      ipcMain.send(
        "desktopAssistant",
        `${methodBase}.ws.post.onReqSendMsg`,
        arg
      );
    }
  );

  ipcMain.handle(
    `${methodBase}.syncPlsConfig`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} event
     * @param {{ basic: Record<any, any>, rules: Record<any, any> }} arg
     */
    (event, arg) => {
      global.__HUGO_AURA__.plsRules = arg.rules;
      global.__HUGO_AURA__.plsSettings = arg.basic;

      ipcMain.send("*", `${methodBase}.syncPlsConfig`, arg, event.sender);

      return {
        success: true,
      };
    }
  );
};

module.exports = { applyPlsIpcHandler };
