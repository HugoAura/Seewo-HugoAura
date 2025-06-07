// @ts-check

const __SCOPE = "main";

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const functions = {
  querySvcDetail: (
    /** @type {string} */ svcName,
    /** @type {string} */ findTarget
  ) => {
    return new Promise((resolve) => {
      exec(
        `sc query ${svcName}`,
        { encoding: "utf8" },
        (error, stdout, stderr) => {
          if (error) {
            resolve({
              success: true,
              result: false,
            });
            return;
          }
          if (stdout.includes(findTarget)) {
            resolve({
              success: true,
              result: true,
            });
          } else {
            resolve({
              success: true,
              result: false,
            });
          }
        }
      );
    });
  },

  /**
   *
   * @param {string} logHeader
   * @param {string} binPath
   * @param {string} command
   * @returns {Promise<{ success: boolean, errorObj?: Error }>}
   */
  execCommand: (logHeader, binPath, command) => {
    return new Promise((resolve) => {
      exec(`"${binPath}" ${command}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`${logHeader} Failed to execute command:`, error);
          resolve({ success: false, errorObj: error });
          return;
        }
        resolve({ success: true });
      });
    });
  },
};

/**
 *
 * @param {import("../../../types/main/electron").AuraIPCMain} ipcMain
 */
const applyPlsIpcHandler = (ipcMain) => {
  const methodBase = "$aura.pls";

  const PLS_INSTALL_DIR = path.join("C:\\Program Files", "HugoAura PLS");
  const PLS_BIN_PATH = path.join(PLS_INSTALL_DIR, "bin", "HugoAura-PLS.exe");
  const PLS_SVC_NAME = "HugoAuraPLS";

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
    `${methodBase}.getPlsBinExists`,
    /**
     *
     * @returns {{ success: boolean; data: { isExists: boolean }; error?: Error }}
     */
    (_event, _arg) => {
      try {
        const result = fs.existsSync(PLS_BIN_PATH);
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
     * @returns {{ success: boolean; data: import("../../../types/shared/pls/status").PLSStatus | null | undefined; }}
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
     * @param {import("../../../types/shared/pls/status").PLSStatus} arg
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
     * @returns {{ success: boolean; data: Record<any, any> | null | undefined }}
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
      ipcMain.send("assistant", `${methodBase}.post.onPlsSettingsUpdate`, arg);
      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.getPlsRules`,
    /**
     *
     * @returns {{ success: boolean; data: Record<any, any> | null | undefined }}
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
      ipcMain.send("assistant", `${methodBase}.post.onPlsRulesUpdate`, arg);
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

  ipcMain.handle(
    `${methodBase}.plsLifecycleQuery`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {{ target: import("../../../types/shared/pls/status").PLSLifecycleType }} arg
     * @returns {Promise<{ success: boolean, result: boolean }>}
     */
    async (_event, arg) => {
      switch (arg.target) {
        case "isDetached":
          return { success: true, result: isPlsDetached };
        case "isSvcInstalled":
          return await functions.querySvcDetail(PLS_SVC_NAME, "SERVICE_NAME");
        case "isSvcStart":
          return await functions.querySvcDetail(PLS_SVC_NAME, "RUNNING");
        default:
          console.warn(
            `[HugoAura / IPC / PLS] <plsLifecycleQuery> Invalid arg.target: ${arg.target}`
          );
          return {
            success: false,
            result: false,
          };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.plsLifecycleControl`,
    /**
     *
     * @param {*} _event
     * @param {{ target: import("../../../types/shared/pls/status").PLSLifecycleControlType }} arg
     * @returns {Promise<{ success: boolean, errorObj?: Error }>}
     */
    async (_event, arg) => {
      const logHeader = "[HugoAura / IPC / PLS] <plsLifecycleControl>";

      if (!global.__HUGO_AURA__.plsStats?.installed) {
        return { success: false, errorObj: new Error("PLS not installed") };
      }

      switch (arg.target) {
        case "instSvc":
          return await functions.execCommand(
            logHeader,
            PLS_BIN_PATH,
            "install"
          );
        case "rmSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "remove");
        case "startSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "start");
        case "stopSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "stop");
        default:
          return { success: false, errorObj: new Error("Method not found") };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.retryPlsConnect`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {any} arg
     * @returns {{ success: boolean, status: "Already" | "Retrying" }}
     */
    (_event, arg) => {
      if (global.__HUGO_AURA__.plsStats?.connected) {
        return {
          success: true,
          status: "Already",
        };
      } else {
        ipcMain.send("desktopAssistant", `${methodBase}.retryPlsConnect`, arg);

        return {
          success: true,
          status: "Retrying",
        };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.post.updateRetryStatus`,

    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {{ success: boolean }} arg
     */
    (_event, arg) => {
      ipcMain.send("assistant", `${methodBase}.post.updateRetryStatus`, arg);

      return {
        success: true,
      };
    }
  );
};

module.exports = { applyPlsIpcHandler };
