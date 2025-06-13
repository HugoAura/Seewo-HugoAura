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
  handlePLSDownload: async (channel, callbackFn, binPath) => {
    // TODO: Channel selection
    const apiInfo = global.__HUGO_AURA_API__;

    const getVerPromise = new Promise(async (resolveGetVerReq) => {
      // ↓ 目前 channel param 没有什么用处
      for (const apiDomain of apiInfo.domains) {
        const reqPromise = new Promise((resolveHttpRequest) => {
          nodeHttps
            .get(
              `${apiDomain}${apiInfo.plsUpdate}?channel=${channel}`,
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
        message: "未能获取 PLS 版本信息, 所有 API 域名均无法连接",
      });
      return false;
    }

    const plsVersionInfo = rawResInfo.data;

    let deviceArch = process.env.PROCESSOR_ARCHITEW6432
      ? process.env.PROCESSOR_ARCHITEW6432
      : process.env.PROCESSOR_ARCHITECTURE;
    // @ts-expect-error
    deviceArch = deviceArch.toLowerCase();

    if (!Object.keys(plsVersionInfo.data.downloadUrl).includes(deviceArch)) {
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
      plsVersionInfo.data.downloadUrl[deviceArch],
      binPath,
      (...args) => {
        if (args[0].status === "done") {
          if (global.__HUGO_AURA__.plsStats) {
            global.__HUGO_AURA__.plsStats.installed = true;
            global.__HUGO_AURA__.plsStats.status = "dead";
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
const applyPlsIpcHandler = (ipcMain) => {
  const methodBase = "$aura.pls";

  const PLS_INSTALL_DIR = path.join("C:\\Program Files", "HugoAura PLS", "bin");
  const PLS_BIN_PATH = path.join(PLS_INSTALL_DIR, "HugoAura-PLS.exe");
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

        if (global.__HUGO_AURA__.plsStats?.status === "notInstalled") {
          global.__HUGO_AURA__.plsStats.status = "dead";
        }

        return {
          success: true,
          data: { isExists: result },
        };
      } catch (e) {
        // @ts-expect-error
        global.__HUGO_AURA__.plsStats.status = "notInstalled";
        return {
          success: false,
          data: { isExists: false },
          error: e,
        };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.ensurePlsInstallDir`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {any} _arg
     * @returns {{ success: boolean; data: { alreadyExists: boolean; createdDir: string; }; error?: Error }}
     */
    (_event, _arg) => {
      const alreadyExists = fs.existsSync(PLS_INSTALL_DIR);
      if (alreadyExists) {
        return {
          success: true,
          data: {
            alreadyExists: true,
            createdDir: PLS_INSTALL_DIR,
          },
        };
      }

      try {
        fs.mkdirSync(PLS_INSTALL_DIR);
        return {
          success: true,
          data: {
            alreadyExists: false,
            createdDir: PLS_INSTALL_DIR,
          },
        };
      } catch (error) {
        return {
          success: false,
          data: {
            alreadyExists: false,
            createdDir: PLS_INSTALL_DIR,
          },
          error: error,
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

      switch (arg.target) {
        case "instSvc":
          return await functions.execCommand(
            logHeader,
            PLS_BIN_PATH,
            "--startup auto install"
          );
        case "rmSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "remove");
        case "startSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "start");
        case "stopSvc":
          return await functions.execCommand(logHeader, PLS_BIN_PATH, "stop");
        case "rmBin":
          const unlinkPromise = new Promise((resolve) => {
            fs.unlink(PLS_BIN_PATH, (error) => {
              if (error) {
                resolve({
                  success: false,
                  errorObj: error,
                });
                console.error(
                  `${logHeader} Failed to remove PLS bin, error:`,
                  error
                );
                return false;
              }

              resolve({
                success: true,
                errorObj: null,
              });
              return true;
            });
          });

          const unlinkRet = await unlinkPromise;

          return unlinkRet;
        default:
          return { success: false, errorObj: new Error("Method not found") };
      }
    }
  );

  ipcMain.handle(
    `${methodBase}.downloadPls`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _evt
     * @param {{channel?: "stable" | "alpha", reportTo?: import("../../../types/main/core").WindowName}} arg
     * @returns {void}
     */
    (_evt, arg) => {
      const channel = arg.channel ? arg.channel : "stable";
      const reportWin = arg.reportTo ? arg.reportTo : "assistant";
      functions.handlePLSDownload(
        channel,
        (status) => {
          ipcMain.send(
            reportWin,
            `${methodBase}.post.reportPlsDownloadStatus`,
            status
          );
        },
        PLS_BIN_PATH
      );
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
