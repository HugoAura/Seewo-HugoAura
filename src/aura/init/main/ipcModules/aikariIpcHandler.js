// @ts-check

const __SCOPE = "main";

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const nodeHttps = require("https");
const { fsComposables } = require("./fsIpcHandler");

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
    const processedPath = binPath.includes(" ") ? `"${binPath}"` : binPath;
    return new Promise((resolve) => {
      exec(`${processedPath} ${command}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`${logHeader} Failed to execute command:`, error);
          resolve({ success: false, errorObj: error });
          return;
        }
        resolve({ success: true });
      });
    });
  },

  /**
   *
   * @param {"stable" | "alpha"} channel
   * @param {(arg: DownloadTask) => any} callbackFn
   * @param {string} binPath
   */
  handleAikariDownload: async (channel, callbackFn, binPath) => {
    // TODO: Channel selection
    const apiInfo = global.__HUGO_AURA_API__;

    const getVerPromise = new Promise(async (resolveGetVerReq) => {
      // ↓ 目前 channel param 没有什么用处
      for (const apiDomain of apiInfo.domains) {
        const reqPromise = new Promise((resolveHttpRequest) => {
          nodeHttps
            .get(
              `${apiDomain}${apiInfo.aikariUpdate}?channel=${channel}`,
              (rep) => {
                let dataChunk = "";
                rep.on("data", (chunk) => {
                  dataChunk += chunk;
                });

                rep.on("end", () => {
                  let parsedData = {};
                  try {
                    parsedData = JSON.parse(dataChunk);
                  } catch (e) {
                    callbackFn({
                      id: "",
                      progress: 0,
                      status: "struggling",
                      dlUrl: null,
                      savePath: null,
                      message: `数据解析失败, 正在尝试 API 域名 ${
                        apiInfo.domains[apiInfo.domains.indexOf(apiDomain) + 1]
                      } ...`,
                      errorObj: e,
                    });

                    setTimeout(() => {
                      resolveHttpRequest({
                        success: false,
                        errorObj: e,
                      });
                    }, 1000);
                    return;
                  }

                  resolveHttpRequest({
                    success: true,
                    data: parsedData,
                  });
                  return;
                });
              }
            )
            .on("error", (e) => {
              callbackFn({
                id: "",
                progress: 0,
                status: "struggling",
                dlUrl: null,
                savePath: null,
                message: `连接失败, 正在尝试 API 域名 ${
                  apiInfo.domains[apiInfo.domains.indexOf(apiDomain) + 1]
                } ...`,
                errorObj: e,
              });

              setTimeout(() => {
                resolveHttpRequest({
                  success: false,
                  errorObj: e,
                });
              }, 1000);
            });
        });

        const requestResult = await reqPromise;
        if (requestResult.success) {
          resolveGetVerReq({
            success: true,
            data: requestResult.data,
          });
          break;
        } else {
          continue;
        }
      }

      resolveGetVerReq({
        success: false,
        data: null,
      });
    });

    const rawResInfo = await getVerPromise;
    if (!rawResInfo.success) {
      callbackFn({
        id: "",
        progress: 0,
        status: "failed",
        dlUrl: null,
        savePath: null,
        message: "未能获取 Aikari 版本信息, 所有 API 域名均无法连接",
      });
      return false;
    }

    const aikariVersionInfo = rawResInfo.data;

    let deviceArch = process.env.PROCESSOR_ARCHITEW6432
      ? process.env.PROCESSOR_ARCHITEW6432
      : process.env.PROCESSOR_ARCHITECTURE;
    // @ts-expect-error
    deviceArch = deviceArch.toLowerCase();

    if (!Object.keys(aikariVersionInfo.data.downloadUrl).includes(deviceArch)) {
      callbackFn({
        id: "",
        progress: 0,
        status: "failed",
        dlUrl: null,
        savePath: null,
        message: `处理器架构识别失败, 检测到的架构: ${deviceArch}`,
      });
      return false;
    }

    fsComposables.downloadFile(
      aikariVersionInfo.data.downloadUrl[deviceArch],
      binPath,
      (...args) => {
        if (args[0].status === "done") {
          if (global.__HUGO_AURA__.aikariStats) {
            global.__HUGO_AURA__.aikariStats.installed = true;
            global.__HUGO_AURA__.aikariStats.status = "dead";
          }
        }

        callbackFn(...args);
      }
    );
  },
};

/**
 *
 * @param {import("../../../types/main/electron").AuraIPCMain} ipcMain
 */
const applyAikariIpcHandler = (ipcMain) => {
  const methodBase = "$aura.aikari";

  const AIKARI_DEFAULT_INSTALL_DIR = path.join(
    "C:\\Program Files",
    "HugoAura",
    "Aikari"
  );
  const AIKARI_LAUNCHER_PATH = path.join(
    AIKARI_DEFAULT_INSTALL_DIR,
    "Aikari-Launcher.exe"
  );
  const AIKARI_UNINSTALLER_PATH = path.join(
    AIKARI_DEFAULT_INSTALL_DIR,
    "unins000.exe"
  );
  const AIKARI_SVC_NAME = "HugoAuraAikari";

  const isAikariDetached = process.argv.includes("--aikari-detach");

  global.__HUGO_AURA__.aikariStats = {
    installed: false,
    launched: false,
    detached: isAikariDetached,
    connected: false,
    version: "unknown",
    status: "dead",
    authToken: global.__HUGO_AURA_CONFIG__.aikariToken,
  };

  ipcMain.handle(
    `${methodBase}.getIfAikariBinExists`,
    /**
     *
     * @returns {{ success: boolean; data: { isExists: boolean }; error?: Error }}
     */
    (_event, _arg) => {
      try {
        const result = fs.existsSync(AIKARI_LAUNCHER_PATH);

        if (global.__HUGO_AURA__.aikariStats?.status === "notInstalled") {
          global.__HUGO_AURA__.aikariStats.status = "dead";
        }

        return {
          success: true,
          data: { isExists: result },
        };
      } catch (e) {
        // @ts-expect-error
        global.__HUGO_AURA__.aikariStats.status = "notInstalled";
        return {
          success: false,
          data: { isExists: false },
          error: e,
        };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.ensureAikariInstallDir`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {any} _arg
     * @returns {{ success: boolean; data: { alreadyExists: boolean; createdDir: string; }; error?: Error }}
     */
    (_event, _arg) => {
      const alreadyExists = fs.existsSync(AIKARI_DEFAULT_INSTALL_DIR);
      if (alreadyExists) {
        return {
          success: true,
          data: {
            alreadyExists: true,
            createdDir: AIKARI_DEFAULT_INSTALL_DIR,
          },
        };
      }

      try {
        fs.mkdirSync(AIKARI_DEFAULT_INSTALL_DIR, { recursive: true });
        return {
          success: true,
          data: {
            alreadyExists: false,
            createdDir: AIKARI_DEFAULT_INSTALL_DIR,
          },
        };
      } catch (error) {
        return {
          success: false,
          data: {
            alreadyExists: false,
            createdDir: AIKARI_DEFAULT_INSTALL_DIR,
          },
          error: error,
        };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.getAikariStatus`,
    /**
     *
     * @returns {{ success: boolean; data: import("../../../types/shared/aikari/status").AikariStatus | null | undefined; }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.aikariStats,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updateAikariStatus`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {import("../../../types/shared/aikari/status").AikariStatus} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.aikariStats = arg;
      ipcMain.send("assistant", `${methodBase}.post.onAikariStatsUpdate`, arg);
      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.getAikariSettings`,
    /**
     *
     * @returns {{ success: boolean; data: Record<any, any> | null | undefined }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.aikariSettings,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updateAikariSettings`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {Record<any, any>} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.aikariSettings = arg;
      ipcMain.send(
        "assistant",
        `${methodBase}.post.onAikariSettingsUpdate`,
        arg
      );
      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.getAikariRules`,
    /**
     *
     * @returns {{ success: boolean; data: Record<any, any> | null | undefined }}
     */
    (_event, _arg) => {
      return {
        success: true,
        data: global.__HUGO_AURA__.aikariRules,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.updateAikariRules`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {Record<any, any>} arg
     * @returns
     */
    (_event, arg) => {
      global.__HUGO_AURA__.aikariRules = arg;
      ipcMain.send("assistant", `${methodBase}.post.onAikariRulesUpdate`, arg);
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
     * @param {AikariResponse} arg
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
     * @param {ClientAikariRequest} arg
     */
    (_event, arg) => {
      ipcMain.send(
        "auraWsKeepAlive",
        `${methodBase}.ws.post.onReqSendMsg`,
        arg
      );
    }
  );

  ipcMain.handle(
    `${methodBase}.syncAikariConfig`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} event
     * @param {{ basic: Record<any, any>, rules: Record<any, any> }} arg
     */
    (event, arg) => {
      global.__HUGO_AURA__.aikariRules = arg.rules;
      global.__HUGO_AURA__.aikariSettings = arg.basic;

      ipcMain.send("*", `${methodBase}.syncAikariConfig`, arg, event.sender);

      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    `${methodBase}.aikariLifecycleQuery`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {{ target: import("../../../types/shared/aikari/status").AikariLifecycleType }} arg
     * @returns {Promise<{ success: boolean, result: boolean }>}
     */
    async (_event, arg) => {
      switch (arg.target) {
        case "isDetached":
          return { success: true, result: isAikariDetached };
        case "isSvcInstalled":
          return await functions.querySvcDetail(
            AIKARI_SVC_NAME,
            "SERVICE_NAME"
          );
        case "isSvcStart":
          return await functions.querySvcDetail(AIKARI_SVC_NAME, "RUNNING");
        default:
          console.warn(
            `[HugoAura / IPC / Aikari] <AikariLifecycleQuery> Invalid arg.target: ${arg.target}`
          );
          return {
            success: false,
            result: false,
          };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.aikariLifecycleControl`,
    /**
     *
     * @param {*} _event
     * @param {{ target: import("../../../types/shared/aikari/status").AikariLifecycleControlType }} arg
     * @returns {Promise<{ success: boolean, errorObj?: Error }>}
     */
    async (_event, arg) => {
      const logHeader = "[HugoAura / IPC / Aikari] <AikariLifecycleControl>";

      // TODO: Impl this
      switch (arg.target) {
        case "instSvc":
          return await functions.execCommand(
            logHeader,
            AIKARI_LAUNCHER_PATH,
            "--service install"
          );
        case "uninstSvc": {
          const result = await functions.execCommand(
            logHeader,
            AIKARI_LAUNCHER_PATH,
            "--service uninstall"
          );
          return result;
        }
        case "startSvc":
          return await functions.execCommand(
            logHeader,
            "sc.exe",
            `start ${AIKARI_SVC_NAME}`
          );
        case "stopSvc": {
          const result = await functions.execCommand(
            logHeader,
            "sc.exe",
            `stop ${AIKARI_SVC_NAME}`
          );
          if (result.success && global.__HUGO_AURA__.aikariStats) {
            global.__HUGO_AURA__.aikariStats.connected = false;
            global.__HUGO_AURA__.aikariStats.launched = false;
            global.__HUGO_AURA__.aikariStats.version = "unknown";
            global.__HUGO_AURA__.aikariStats.status = "dead";

            ipcMain.send(
              "assistant",
              `${methodBase}.post.onAikariStatsUpdate`,
              global.__HUGO_AURA__.aikariStats
            );

            ipcMain.send(
              "auraWsKeepAlive",
              `${methodBase}.post.aikariStopped`,
              {}
            );
          }
          return result;
        }
        case "inst":
        // TODO: Impl Aikari INST
        case "uninst":
          return await functions.execCommand(
            logHeader,
            AIKARI_UNINSTALLER_PATH,
            ""
          );
        default:
          return { success: false, errorObj: new Error("Method not found") };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.downloadAndInstallAikari`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _evt
     * @param {{channel?: "stable" | "alpha", reportTo?: import("../../../types/main/core").WindowName}} arg
     * @returns {void}
     */
    (_evt, arg) => {
      const channel = arg.channel ? arg.channel : "stable";
      const reportWin = arg.reportTo ? arg.reportTo : "assistant";
      functions.handleAikariDownload(
        channel,
        (status) => {
          ipcMain.send(
            reportWin,
            `${methodBase}.post.reportAikariInstallStep`,
            status
          );
        },
        AIKARI_LAUNCHER_PATH
      );
    }
  );

  ipcMain.handle(
    `${methodBase}.retryAikariConnect`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {any} arg
     * @returns {{ success: boolean, status: "Already" | "Retrying" }}
     */
    (_event, arg) => {
      if (global.__HUGO_AURA__.aikariStats?.connected) {
        return {
          success: true,
          status: "Already",
        };
      } else {
        ipcMain.send(
          "auraWsKeepAlive",
          `${methodBase}.retryAikariConnect`,
          arg
        );

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

module.exports = { applyAikariIpcHandler };
