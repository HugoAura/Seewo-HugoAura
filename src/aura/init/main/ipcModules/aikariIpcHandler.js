// @ts-check

const __SCOPE = "main";

const { exec, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
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
  handleAikariDlAndInstall: async (channel, callbackFn, binPath) => {
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
        message:
          "未能获取 Aikari 版本信息, 所有 API 域名均无法连接, 建议前往 GitHub 下载安装包并自行安装",
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
        message: `不支持的处理器架构, 检测到的架构: "${deviceArch}"`,
      });
      return false;
    }

    const downloadFilePromise = new Promise((resolve) => {
      fsComposables.downloadFile(
        aikariVersionInfo.data.downloadUrl[deviceArch],
        binPath,
        (...args) => {
          if (args[0].status === "done") {
            resolve(true);
          } else if (args[0].status === "failed") {
            resolve(false);
          }

          callbackFn(...args);
        }
      );
    });

    const dlResult = await downloadFilePromise;

    if (dlResult) {
      callbackFn({
        id: "INSTALL_STAGE",
        progress: 5,
        status: "waiting",
        dlUrl: null,
        savePath: null,
        message: "准备运行 Aikari 安装程序...",
      });

      const runInstPromise = new Promise((resolve) => {
        exec(
          `"${binPath}" /VERYSILENT /SUPPRESSMSGBOXES /LOG="${binPath}\\..\\Aikari-Install.log"`,
          (err, stdout, stderr) => {
            if (err) {
              console.error(
                `[HugoAura / Main / Aikari IPC Handler / Install Aikari] Error running installer: ${stderr}`
              );
              resolve({ success: false });
            }
            resolve({ success: true });
          }
        );
      });

      callbackFn({
        id: "INSTALL_STAGE",
        progress: 15,
        status: "progressing",
        dlUrl: null,
        savePath: null,
        message: "正在安装 Aikari...",
      });

      const instResult = await runInstPromise;

      callbackFn({
        id: "INSTALL_STAGE",
        progress: 100,
        status: instResult.success ? "done" : "failed",
        dlUrl: null,
        savePath: null,
        message: instResult.success
          ? "Aikari 安装成功"
          : "安装失败, 请检查 %TEMP%/Aikari-Install-Temp 下的安装日志",
      });

      if (instResult.success) {
        if (global.__HUGO_AURA__.aikariStats) {
          global.__HUGO_AURA__.aikariStats.installed = true;
          global.__HUGO_AURA__.aikariStats.status = "dead";
        }
      }

      fs.unlinkSync(binPath);
    }
  },
  clearHostFileItem: async () => {
    const AIKARI_HOST_STR =
      "127.11.45.14 iot-broker-mis.seewo.com # This line is generated by HugoAura-Aikari, please do not edit or delete it";
    const hostPath = path.join(
      process.env.SystemRoot || "C:\\WINDOWS",
      "System32",
      "drivers",
      "etc",
      "hosts"
    );
    if (fs.existsSync(hostPath)) {
      try {
        const content = fs.readFileSync(hostPath, "utf-8");
        const lines = content.split(/\r?\n/);
        const newContent = lines.filter((line) => {
          const shouldKeep = !line.includes(AIKARI_HOST_STR);
          if (!shouldKeep) {
            console.log(
              `[HugoAura / IPC / Aikari] Cleaned hosts file item: ${line}`
            );
          }
          return shouldKeep;
        });
        if (lines.length === newContent.length) {
          return false;
        }
        const newData = newContent.join(os.EOL);
        fs.writeFileSync(hostPath, newData, "utf-8");
        return true;
      } catch (err) {
        console.error(
          "[HugoAura / IPC / Aikari] Error cleaning hosts file: ",
          err
        );
        return false;
      }
    } else {
      return false;
    }
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

  const AIKARI_TEMP_DL_DIR = path.join(
    require("os").tmpdir(),
    "Aikari-Install-Temp"
  );
  const AIKARI_TEMP_INSTALLER_FILENAME = path.join(
    AIKARI_TEMP_DL_DIR,
    "Aikari-Installer.exe"
  );

  // Prev PLS Cfg
  const OLD_PLS_INSTALL_DIR = path.join(
    "C:\\Program Files",
    "HugoAura PLS",
    "bin"
  );
  const OLD_PLS_SVC_NAME = "HugoAuraPLS";

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
          await functions.clearHostFileItem();
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
     * @returns {Promise<void>}
     */
    async (_evt, arg) => {
      if (fs.existsSync(AIKARI_TEMP_DL_DIR)) {
        try {
          fs.unlinkSync(AIKARI_TEMP_DL_DIR);
        } catch (err) {
          console.error(err);
        }
      } else {
        fs.mkdirSync(AIKARI_TEMP_DL_DIR);
      }
      if (fs.existsSync(OLD_PLS_INSTALL_DIR)) {
        try {
          execSync(`sc stop ${OLD_PLS_SVC_NAME}`);
          execSync(`sc delete ${OLD_PLS_SVC_NAME}`);
        } catch (err) {
          // ...
        }
        try {
          fs.unlinkSync(OLD_PLS_INSTALL_DIR);
        } catch (err) {
          // ...
        }
      }
      const channel = arg.channel ? arg.channel : "stable";
      const reportWin = arg.reportTo ? arg.reportTo : "assistant";
      functions.handleAikariDlAndInstall(
        channel,
        (status) => {
          ipcMain.send(
            reportWin,
            `${methodBase}.post.reportAikariInstallStep`,
            status
          );
        },
        AIKARI_TEMP_INSTALLER_FILENAME
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
    `${methodBase}.forceReloadKeepAliveWin`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {any} arg
     */
    (_event, arg) => {
      ipcMain.send(
        "auraWsKeepAlive",
        `${methodBase}.post.onForceReloadRequested`,
        arg
      );

      return { success: true };
    }
  );

  ipcMain.handle(
    `${methodBase}.post.updateRetryStatus`,

    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _event
     * @param {{ success: boolean; message: string }} arg
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
