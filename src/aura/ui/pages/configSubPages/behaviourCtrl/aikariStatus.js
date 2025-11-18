if (!global.__HUGO_AURA_UI_FUNCTIONS__.subConfig)
  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig = {};

if (!global.__HUGO_AURA_UI_REACTIVES__.subConfig)
  global.__HUGO_AURA_UI_REACTIVES__.subConfig = {};

(() => {
  const REQUIRE_BASE = "../../aura/ui/pages/configSubPages/behaviourCtrl";
  const IPC_METHOD_BASE = "$aura.aikari";

  const appRawCmds = require(`${REQUIRE_BASE}/../../../composables/rawCmdExec/app`);

  const lifecycleStatus = {
    installed: false,
    detached: false,
    svcInstalled: false,
    svcRunning: false,
  };

  global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus = {
    toastAutoHideTimeout: null,
    curDlTaskId: null,
  };

  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus = {
    openLink: async (link) => {
      const childProc = require("child_process");
      childProc.spawn("cmd.exe", [`/k start ${link}`]);
    },

    getRetryStatusDescByErrId: (errIdString) => {
      switch (errIdString) {
        case "E_AUTH_TOKEN_GET_FAILED":
          return `<p>Aikari 注册表访问失败, 这是一个极为罕见的问题</p>
<p>请检查 HKEY_USERS\\.DEFAULT 是否存在, 并反馈至 GitHub Issues</p>`;
        case "E_WS_CONN_FAILED_AFT_MULTIPLE_TRIES":
          return `<p>在多次尝试连接后仍然失败, 请检查服务是否已启动</p>`;
        case "E_IS_LOADING":
        case "E_START_WAIT_FOR_LOADING":
          return `<p>Aikari 正在加载中, 请稍作等待</p>`; // 此提示理论上在当前版本不会出现
        case "E_RETRY_PENDING":
          return `<p>正在尝试重连中, 请勿重复操作</p>`;
        case "E_NOT_INSTALLED":
          return `<p>Aikari 未安装, 请安装后继续</p>`;
        default:
          return null;
      }
    },

    updateToast: async (
      variant,
      title,
      body = null,
      closable = true,
      autoHide = true,
      hideAfter = 3000
    ) => {
      const toastRootEl = document.getElementById("aikariStatusNotifyToast");
      const toastHeaderEl = document.getElementById(
        "aikariStatusNotifyToastTitle"
      );
      const toastBodyEl = document.getElementById(
        "aikariStatusNotifyToastBody"
      );

      const bsToastIns = bootstrap.Toast.getOrCreateInstance(toastRootEl);
      if (bsToastIns.isShown) {
        bsToastIns.hide();
        const timeout =
          global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus
            .toastAutoHideTimeout;
        if (timeout) {
          clearTimeout(timeout);
        }
        await global.__HUGO_AURA_GLOBAL__.utils.sleep(160);
      }

      toastRootEl.setAttribute("variant", variant);
      toastHeaderEl.innerHTML = title;
      if (body) {
        toastBodyEl.innerHTML = body;
        toastRootEl.classList.remove("body-display-none");
      } else {
        toastRootEl.classList.add("body-display-none");
      }

      toastRootEl.setAttribute("closable", closable.toString());

      bsToastIns.show();
      if (autoHide && hideAfter) {
        global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus.toastAutoHideTimeout =
          setTimeout(() => {
            bsToastIns.hide();
          }, hideAfter);
      }
    },

    updateOperationBtnStatus: async (
      btnName,
      isDisabled,
      btnContent = null
    ) => {
      const btnEl = document.getElementById(`acsBcPsp-operBtn-${btnName}`);
      if (!btnEl) return false;
      btnEl.setAttribute("aura-disabled", isDisabled ? "true" : "false");
      if (btnContent) {
        const btnPEl = btnEl.getElementsByTagName("p")[0];
        btnPEl.textContent = btnContent;
      }
      if (isDisabled) {
        btnEl.onclick = () => {};
      } else {
        switch (btnName) {
          case "Refresh":
            btnEl.onclick = () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                "warning",
                "正在更新",
                null,
                false,
                false,
                null
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.refreshAikariStatus();
            };
            break;
          case "Install":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.downloadAndInstallAikariBin();
            };
            break;

          // ↓ 这边的确可以把这些全都合并到一个可复用 fn 里去, 但没必要
          // 如果后续要引入错误视觉反馈, 合并到单个 fn 反而会增加实现复杂度
          case "InstallSvc":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateOperationBtnStatus(
                "InstallSvc",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                "info",
                "正在请求安装",
                null,
                false,
                false,
                null
              );
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                { target: "instSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcInstalled = true;
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "success",
                  "服务安装成功",
                  null,
                  true,
                  true,
                  2000
                );
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "error",
                  "服务安装失败",
                  `<p>${ret.errorObj}</p>`,
                  true,
                  false,
                  null
                );
              }
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
            };
            break;
          case "UninstallSvc":
            if (btnContent === "卸载应用") {
              btnEl.onclick = async () => {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateOperationBtnStatus(
                  "UninstallSvc",
                  true
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "warning",
                  "正在卸载 Aikari",
                  `<p>
                    请在弹出窗口中完成操作
                  </p>`,
                  false,
                  false,
                  null
                );
                const ret = await ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                  { target: "uninst" }
                );
                if (ret.success) {
                  lifecycleStatus.installed = false;
                  lifecycleStatus.svcInstalled = false;
                  global.__HUGO_AURA__.aikariStats.installed = false;
                  global.__HUGO_AURA__.aikariStats.connected = false;
                  global.__HUGO_AURA__.aikariStats.launched = false;
                  ipcRenderer.invoke(
                    `${IPC_METHOD_BASE}.updateAikariStatus`,
                    global.__HUGO_AURA__.aikariStats
                  );
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                    "success",
                    "Aikari 已完成卸载",
                    null,
                    true,
                    true,
                    2000
                  );
                } else {
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                    "error",
                    "Aikari 卸载失败",
                    `<p>
                      ${ret.errorObj ? ret.errorObj : "检查日志以获取详细信息"}
                    </p>`,
                    true,
                    false,
                    null
                  );
                }
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
              };
            } else {
              btnEl.onclick = async () => {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateOperationBtnStatus(
                  "UninstallSvc",
                  true
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "info",
                  lifecycleStatus.svcRunning
                    ? "正在停止服务并卸载"
                    : "正在请求卸载",
                  null,
                  false,
                  false,
                  null
                );
                if (lifecycleStatus.svcRunning) {
                  const stopRet = await ipcRenderer.invoke(
                    `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                    { target: "stopSvc" }
                  );
                  if (!stopRet.success) {
                    global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                      "error",
                      "服务卸载失败: 无法停止服务",
                      `<p>${
                        stopRet.errorObj
                          ? stopRet.errorObj
                          : "检查日志以获取详细信息"
                      }</p>
                      <p>
                        您可以尝试手动停止 Aikari 服务
                      </p>`,
                      true,
                      false,
                      null
                    );
                  } else {
                    lifecycleStatus.svcRunning = false;
                  }
                }
                const ret = await ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                  { target: "uninstSvc" }
                );
                if (ret.success) {
                  lifecycleStatus.svcRunning = false;
                  lifecycleStatus.svcInstalled = false;
                  global.__HUGO_AURA__.aikariStats.connected = false;
                  global.__HUGO_AURA__.aikariStats.launched = false;
                  ipcRenderer.invoke(
                    `${IPC_METHOD_BASE}.updateAikariStatus`,
                    global.__HUGO_AURA__.aikariStats
                  );
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                    "success",
                    "服务卸载成功",
                    null,
                    true,
                    true,
                    2000
                  );
                } else {
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                    "error",
                    "服务卸载失败",
                    "<p>检查日志以获取详细信息</p>",
                    true,
                    false,
                    null
                  );
                }
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
              };
            }

            break;
          case "Start":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateOperationBtnStatus(
                "Start",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                "info",
                "正在请求启动",
                null,
                false,
                false,
                null
              );
              const isHostNotInit =
                await global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.showWarnToastIfHostsNotInitialized();
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                { target: "startSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcRunning = true;
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
                if (!isHostNotInit) {
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                    "success",
                    "Aikari 已启动",
                    null,
                    true,
                    true,
                    2000
                  );
                }
                await global.__HUGO_AURA_GLOBAL__.utils.sleep(100);
                await ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.retryAikariConnect`
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "error",
                  "Aikari 启动失败",
                  "<p>检查 Aikari 日志目录以获取详细信息</p>",
                  true,
                  false,
                  null
                );
              }
            };
            break;
          case "Stop":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateOperationBtnStatus(
                "Stop",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                "info",
                "正在请求停止",
                null,
                false,
                false,
                null
              );
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.aikariLifecycleControl`,
                { target: "stopSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcRunning = false;
                global.__HUGO_AURA__.aikariStats.launched = false;
                global.__HUGO_AURA__.aikariStats.version = "unknown";
                global.__HUGO_AURA__.aikariStats.status = "dead";

                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "success",
                  "Aikari 已停止",
                  null,
                  true,
                  true,
                  2000
                );
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
                  "error",
                  "Aikari 停止失败",
                  null,
                  true,
                  false,
                  null
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
              }
            };
            break;
          default:
            break;
        }
      }
      return true;
    },

    updateStatusContent: async () => {
      const curAikariStats = await updateAikariStatusFromLocal();

      if (curAikariStats.status === "downloading") {
        GLOBAL_FUNCTIONS.downloadAndInstallAikariBin(true);
      }

      const acIdInst = "acs-bc-psp-installStatus-container";
      const atIdInst = "acs-bc-psp-installStatus-text";
      switch (lifecycleStatus.installed) {
        case true:
          if (!lifecycleStatus.svcInstalled) {
            updateStatusEl(
              acIdInst,
              atIdInst,
              "WARNING",
              "应用已安装, 服务未安装"
            );
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("InstallSvc", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "UninstallSvc",
              false,
              "卸载应用"
            );
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", true);
          } else {
            updateStatusEl(
              acIdInst,
              atIdInst,
              "SUCCESS",
              "应用已安装, 服务已安装"
            );
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("InstallSvc", true);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "UninstallSvc",
              false,
              "卸载服务"
            );
          }
          break;
        case false:
          updateStatusEl(acIdInst, atIdInst, "PENDING", "未下载");
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", false);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("InstallSvc", true);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("UninstallSvc", true);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", true);
      }

      const acIdLaunch = "acs-bc-psp-launchStatus-container";
      const atIdLaunch = "acs-bc-psp-launchStatus-text";

      if (lifecycleStatus.detached) {
        updateStatusEl(acIdLaunch, atIdLaunch, "INFO", "已分离");
        GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
        GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", true);
      } else if (lifecycleStatus.svcInstalled && lifecycleStatus.installed) {
        switch (lifecycleStatus.svcRunning || curAikariStats.launched) {
          case true:
            if (curAikariStats.status !== "notReady") {
              updateStatusEl(acIdLaunch, atIdLaunch, "SUCCESS", "已启动");
              GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
              GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", false);
            } else {
              updateStatusEl(acIdLaunch, atIdLaunch, "WARNING", "启动中");
              GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
              GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", false);
            }
            break;
          case false:
            updateStatusEl(acIdLaunch, atIdLaunch, "PENDING", "未启动");
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", true);
            break;
        }
      }

      const acIdConn = "acs-bc-psp-connStatus-container";
      const atIdConn = "acs-bc-psp-connStatus-text";
      switch (curAikariStats.connected) {
        case true:
          updateStatusEl(acIdConn, atIdConn, "SUCCESS", "已连接");
          break;
        case false:
          if (curAikariStats.status !== "notReady") {
            updateStatusEl(acIdConn, atIdConn, "FAILED", "连接失败");
          } else {
            updateStatusEl(acIdConn, atIdConn, "PENDING", "等待启动");
          }
          break;
      }

      const versionTextEl = document.getElementById("acs-bc-psp-version-text");
      if (curAikariStats.version && curAikariStats.version !== "unknown") {
        versionTextEl.textContent = curAikariStats.version;
      } else {
        versionTextEl.textContent = "不可用";
      }
    },

    showWarnToastIfHostsNotInitialized: async () => {
      const dnsModule = require("dns");
      const lookupPromise = new Promise((resolve) => {
        dnsModule.lookup("iot-broker-mis.seewo.com", (err, result) => {
          resolve(err ? err : result);
        });
      });
      const result = await lookupPromise;
      if (result) {
        if (!result.startsWith("127.")) {
          global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
            "error",
            "警告: 页面即将刷新",
            `<p>您似乎是首次运行 Aikari, 基于 Aikari PLS 模块的实现原理, 我们需要修改 Hosts 文件并重启 SeewoCore 进程以开始拦截流量。</p>
            <p>重启 SeewoCore 进程会导致管家前端页面<b>在重启完成后自动发生刷新</b>, 因此稍后请留意此变更。</p>`,
            true,
            false,
            null
          );
          return true;
        }
      }
    },

    refreshAikariStatus: async (init = false) => {
      const isDetachedRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.aikariLifecycleQuery`,
        { target: "isDetached" }
      );
      if (isDetachedRet.success && isDetachedRet.result) {
        lifecycleStatus.detached = true;
      } else {
        lifecycleStatus.detached = false;
      }

      const binExistsRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.getIfAikariBinExists`
      );
      if (
        (binExistsRet.success && binExistsRet.data.isExists) ||
        lifecycleStatus.detached
      ) {
        lifecycleStatus.installed = true;
        global.__HUGO_AURA__.aikariStats.installed = true;
        ipcRenderer.invoke(
          `${IPC_METHOD_BASE}.updateAikariStatus`,
          global.__HUGO_AURA__.aikariStats
        );
      } else {
        lifecycleStatus.installed = false;
        global.__HUGO_AURA__.aikariStats.installed = false;
        ipcRenderer.invoke(
          `${IPC_METHOD_BASE}.updateAikariStatus`,
          global.__HUGO_AURA__.aikariStats
        );
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
          "error",
          "请下载 Aikari 内核以继续",
          null,
          true,
          true,
          3000
        );
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
        return;
      }

      const isSvcInstalledRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.aikariLifecycleQuery`,
        { target: "isSvcInstalled" }
      );
      if (isSvcInstalledRet.success && isSvcInstalledRet.result) {
        lifecycleStatus.svcInstalled = true;
      } else {
        lifecycleStatus.svcInstalled = false;
      }

      const isSvcRunningRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.aikariLifecycleQuery`,
        { target: "isSvcStart" }
      );
      if (isSvcRunningRet.success && isSvcRunningRet.result) {
        lifecycleStatus.svcRunning = true;
      } else {
        lifecycleStatus.svcRunning = false;
      }

      if (init) {
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
        return;
      }

      const updateOperationBtnStatus =
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus
          .updateOperationBtnStatus;
      updateOperationBtnStatus("Refresh", true);
      const result = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.retryAikariConnect`
      );
      if (result.success && result.status === "Retrying") {
        updateOperationBtnStatus("Refresh", true, "正在重连");

        let isRefreshCompleted = false;

        ipcRenderer.once(
          `${IPC_METHOD_BASE}.post.updateRetryStatus`,
          async (_evt, arg) => {
            await global.__HUGO_AURA_GLOBAL__.utils.sleep(50);
            updateOperationBtnStatus("Refresh", false, "刷新状态");
            isRefreshCompleted = true;
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
              arg.success ? "success" : "error",
              arg.success ? "更新成功" : "连接失败",
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.getRetryStatusDescByErrId(
                arg.message
              ),
              true,
              true,
              5000
            );
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateStatusContent();
          }
        );

        setTimeout(() => {
          if (!isRefreshCompleted) {
            ipcRenderer.invoke(`${IPC_METHOD_BASE}.forceReloadKeepAliveWin`);
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
              "error",
              "连接控制器无响应, 强制重载中...",
              null,
              true,
              true,
              4000
            );
          }
        }, 8000);
      } else if (result.success && result.status === "Already") {
        updateOperationBtnStatus("Refresh", false, "刷新状态");
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.updateToast(
          "success",
          "更新成功",
          null,
          true,
          true,
          3000
        );
      }
    },

    /**
     *
     * @param {boolean} isShow
     */
    switchPBarShowStatus: (isShow) => {
      const operAreaEl = document.getElementsByClassName(
        "acs-bc-psp-operations-container"
      )[0];
      const pBarAreaEl = document.getElementsByClassName(
        "acs-bc-psp-download-progress-area"
      )[0];
      const pBarDescEl = document.getElementById("acsBcPspDownloadPbarDesc");
      const pBarSelfEl = document.getElementById("acsBcPspDownloadPbarEl");

      if (isShow) {
        pBarAreaEl.classList.remove("acs-bc-psp-dl-pbar-hidden");
        operAreaEl.classList.add("acs-bc-psp-oper-ctnr-hidden");
        pBarDescEl.textContent = "等待中...";
        pBarSelfEl.style["width"] = "0";
      } else {
        pBarAreaEl.classList.add("acs-bc-psp-dl-pbar-hidden");
        operAreaEl.classList.remove("acs-bc-psp-oper-ctnr-hidden");
      }

      return true;
    },

    updatePBarStatus: async (
      progress = null,
      desc = null,
      type = null,
      isCancelShown = null
    ) => {
      const pBarDescEl = document.getElementById("acsBcPspDownloadPbarDesc");
      const pBarSelfEl = document.getElementById("acsBcPspDownloadPbarEl");
      const pBarBtnEl = document.getElementById(
        "acsBcPspDownloadPbarCancelBtn"
      );
      if (progress) {
        pBarSelfEl.style["width"] = `${progress}%`;
      }

      if (type) {
        pBarSelfEl.classList.remove("bg-success");
        pBarSelfEl.classList.remove("bg-warning");
        pBarSelfEl.classList.remove("bg-danger");
        if (type !== "normal") {
          pBarSelfEl.classList.add(`bg-${type}`);
        }
      }

      if (desc) {
        pBarDescEl.innerHTML = desc;
      }

      if (isCancelShown !== null) {
        if (isCancelShown) {
          pBarBtnEl.classList.remove("hidden");
        } else {
          pBarBtnEl.classList.add("hidden");
        }
      }
    },

    downloadAndInstallAikariBin: async (retrieveMode = false) => {
      const GLOBAL_FUNCTIONS =
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus;
      const CUR_CHANNEL = `${IPC_METHOD_BASE}.post.reportAikariInstallStep`;

      if (!retrieveMode) {
        GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", true, "正在检查");
        GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", true);
        await ipcRenderer.invoke(`${IPC_METHOD_BASE}.ensureAikariInstallDir`);
        GLOBAL_FUNCTIONS.updateToast(
          "info",
          "准备开始下载...",
          null,
          true,
          false,
          undefined
        );
        GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", true);
      } else {
        GLOBAL_FUNCTIONS.updateToast(
          "info",
          "正在恢复下载状态",
          null,
          true,
          false,
          undefined
        );
      }

      GLOBAL_FUNCTIONS.switchPBarShowStatus(true);
      GLOBAL_FUNCTIONS.updatePBarStatus(0, "等待中...", "normal", false);

      const callbackFn = (_evt, info) => {
        switch (info.status) {
          case "failed":
            if (info.id === "PRECHECK_STAGE") {
              GLOBAL_FUNCTIONS.updatePBarStatus(
                100,
                info.message,
                "danger",
                false
              );
            } else if (info.id !== "INSTALL_STAGE") {
              GLOBAL_FUNCTIONS.updateToast(
                "error",
                "下载失败",
                `<p>${
                  info.message ? info.message : "检查日志以获取错误信息"
                }</p><p>
                ${info.errorObj ? info.errorObj : ""}
                </p>`,
                true,
                true,
                5000
              );

              GLOBAL_FUNCTIONS.updatePBarStatus(
                100,
                "下载时发生错误",
                "danger",
                false
              );
            } else {
              GLOBAL_FUNCTIONS.updateToast(
                "error",
                "安装失败",
                `<p>${
                  info.message
                    ? info.message
                    : "检查 HugoAura 日志或安装器日志 (%TEMP%/Aikari-Install-Temp) 以获取错误信息"
                }</p><p>
                ${info.errorObj ? info.errorObj : ""}
                </p>`,
                true,
                true,
                15000
              );

              GLOBAL_FUNCTIONS.updatePBarStatus(
                100,
                `发生错误: ${info.message}`,
                "danger",
                false
              );
            }

            setTimeout(() => {
              GLOBAL_FUNCTIONS.switchPBarShowStatus(false);
            }, 1000);

            ipcRenderer.off(CUR_CHANNEL, callbackFn);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Install",
              false,
              "下载应用"
            );
            break;
          case "done":
            if (info.id !== "INSTALL_STAGE") {
              GLOBAL_FUNCTIONS.updateToast(
                "success",
                "下载成功",
                null,
                true,
                true,
                2500
              );

              GLOBAL_FUNCTIONS.updatePBarStatus(
                100,
                "下载成功",
                "success",
                false
              );
              break;
            } else {
              GLOBAL_FUNCTIONS.updateToast(
                "success",
                "安装成功",
                null,
                true,
                true,
                2500
              );

              GLOBAL_FUNCTIONS.updatePBarStatus(
                100,
                "Aikari 安装成功",
                "success",
                false
              );

              setTimeout(() => {
                GLOBAL_FUNCTIONS.switchPBarShowStatus(false);
              }, 1000);

              ipcRenderer.off(CUR_CHANNEL, callbackFn);
              GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
              GLOBAL_FUNCTIONS.updateOperationBtnStatus(
                "Install",
                true,
                "下载应用"
              );
              lifecycleStatus.installed = true;
              global.__HUGO_AURA__.aikariStats.installed = true;
              setTimeout(() => {
                ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.updateAikariStatus`,
                  global.__HUGO_AURA__.aikariStats
                );
                GLOBAL_FUNCTIONS.updateStatusContent();
              }, 500);
              break;
            }
          case "waiting":
            GLOBAL_FUNCTIONS.updatePBarStatus(
              0,
              info.message ? info.message : "正在连接",
              "normal"
            );
            if (
              (!global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus
                .curDlTaskId ||
                global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus
                  .curDlTaskId !== info.id) &&
              info.id !== "INSTALL_STAGE"
            ) {
              global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus.curDlTaskId =
                info.id;
            }
            break;
          case "progressing":
            if (info.id !== "INSTALL_STAGE") {
              const roundProgress = Math.round(info.progress);
              GLOBAL_FUNCTIONS.updatePBarStatus(
                roundProgress,
                `正在下载中... ${roundProgress}% (${(
                  info.curBytes /
                  1024 /
                  1024
                ).toFixed(2)}MB / ${(info.totalBytes / 1024 / 1024).toFixed(
                  2
                )}MB)`, // POWERED BY PRETTIER
                "normal",
                true
              );
            } else {
              GLOBAL_FUNCTIONS.updatePBarStatus(
                info.progress,
                `正在安装 Aikari...`,
                "normal",
                false
              );
            }
            break;
          case "struggling":
            GLOBAL_FUNCTIONS.updatePBarStatus(100, info.message, "warning");
            break;
          case "cancelled":
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Install",
              false,
              "下载应用"
            );
            break;
        }
      };

      const isVcRedistInstalledPrecheck = await appRawCmds.checkVcRedistInst();
      if (!isVcRedistInstalledPrecheck.installed) {
        callbackFn(null, {
          id: "PRECHECK_STAGE",
          progress: 100,
          status: "failed",
          dlUrl: null,
          savePath: null,
          message: "Visual C++ Redist 2015~2022 未安装",
        });

        setTimeout(() => {
          GLOBAL_FUNCTIONS.updateToast(
            "error",
            "发生错误",
            `<p>Aikari 需要 Visual C++ Redist 2015~2022 运行时以启动</p>
          <p>请访问
          <a href="javascript:global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus.openLink('https://aka.ms/vc14/vc_redist.${isVcRedistInstalledPrecheck.arch}.exe')">此链接</a>
          以下载并安装运行时</p>`,
            true,
            false,
            undefined
          );
        }, 500);

        return;
      }

      ipcRenderer.on(CUR_CHANNEL, callbackFn);

      ipcRenderer.invoke(`${IPC_METHOD_BASE}.downloadAndInstallAikari`, {
        channel: "stable",
        reportTo: "assistant",
      });
    },

    cancelDownloadTask: async () => {
      const taskId =
        global.__HUGO_AURA_UI_REACTIVES__.subConfig.aikariStatus.curDlTaskId;

      if (!taskId) {
        GLOBAL_FUNCTIONS.updateToast(
          "error",
          "操作取消失败",
          "<p>未能获取当前的下载任务 ID</p>",
          true,
          true,
          3000
        );
        return false;
      }

      const result = await ipcRenderer.invoke(
        "$aura.fs.dl.cancelDownloadTask",
        { targetTaskId: taskId }
      );

      if (result.success) {
        GLOBAL_FUNCTIONS.updateToast(
          "success",
          "操作取消成功",
          null,
          true,
          true,
          2000
        );
        GLOBAL_FUNCTIONS.switchPBarShowStatus(false);
        return true;
      } else {
        GLOBAL_FUNCTIONS.updateToast(
          "error",
          "操作取消失败",
          `<p>错误代码: ${result.error}</p>`,
          true,
          true,
          3000
        );
        return false;
      }
    },
  };

  const GLOBAL_FUNCTIONS =
    global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.aikariStatus;

  const {
    updateAikariStatusFromLocal,
  } = require(`${REQUIRE_BASE}/../../../composables/aikariConfigManager`);

  const initBsTooltip = () => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const _tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  };

  const updateStatusEl = (
    areaContainerId,
    areaTextId,
    target,
    text = false
  ) => {
    const areaContainerEl = document.getElementById(areaContainerId);
    const areaContainerText = document.getElementById(areaTextId);
    switch (target) {
      case "PENDING":
        areaContainerEl.className =
          "acs-bc-aikari-status-page-status-area pending";
        break;
      case "SUCCESS":
        areaContainerEl.className =
          "acs-bc-aikari-status-page-status-area success";
        break;
      case "FAILED":
        areaContainerEl.className =
          "acs-bc-aikari-status-page-status-area failed";
        break;
      case "WARNING":
        areaContainerEl.className =
          "acs-bc-aikari-status-page-status-area warning";
        break;
      case "INFO":
        areaContainerEl.className =
          "acs-bc-aikari-status-page-status-area info";
        break;
      default:
        return false;
    }
    areaContainerText.textContent = text ? text : "";
    return true;
  };

  const onMounted = () => {
    initBsTooltip();
    GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
    GLOBAL_FUNCTIONS.refreshAikariStatus(true);

    const eventListener = () => {
      GLOBAL_FUNCTIONS.updateStatusContent();
    };
    document.addEventListener("onAikariStatsUpdate", eventListener);
    global.__HUGO_AURA_GLOBAL__.utils.createOnLeaveEvtListener(
      "onAikariStatsUpdate",
      eventListener
    );
  };

  onMounted();
})();
