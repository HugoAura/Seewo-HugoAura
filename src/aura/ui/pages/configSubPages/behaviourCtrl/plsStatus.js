if (!global.__HUGO_AURA_UI_FUNCTIONS__.subConfig)
  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig = {};

if (!global.__HUGO_AURA_UI_REACTIVES__.subConfig)
  global.__HUGO_AURA_UI_REACTIVES__.subConfig = {};

(() => {
  const REQUIRE_BASE = "../../aura/ui/pages/configSubPages/behaviourCtrl";
  const IPC_METHOD_BASE = "$aura.pls";

  const lifecycleStatus = {
    installed: false,
    detached: false,
    svcInstalled: false,
    svcRunning: false,
  };

  global.__HUGO_AURA_UI_REACTIVES__.subConfig.plsStatus = {
    toastAutoHideTimeout: null,
  };

  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus = {
    updateToast: async (
      variant,
      title,
      body = null,
      closable = true,
      autoHide = true,
      hideAfter = 3000
    ) => {
      const toastRootEl = document.getElementById("plsStatusNotifyToast");
      const toastHeaderEl = document.getElementById(
        "plsStatusNotifyToastTitle"
      );
      const toastBodyEl = document.getElementById("plsStatusNotifyToastBody");

      const bsToastIns = bootstrap.Toast.getOrCreateInstance(toastRootEl);
      if (bsToastIns.isShown) {
        bsToastIns.hide();
        const timeout =
          global.__HUGO_AURA_UI_REACTIVES__.subConfig.plsStatus
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
        global.__HUGO_AURA_UI_REACTIVES__.subConfig.plsStatus.toastAutoHideTimeout =
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
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                "warning",
                "正在更新",
                null,
                false,
                false,
                null
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.refreshPlsStatus();
            };
            break;
          case "Download":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.downloadPLSBin();
            };
            break;

          // ↓ 这边的确可以把这些全都合并到一个可复用 fn 里去, 但没必要
          // 如果后续要引入错误视觉反馈, 合并到单个 fn 反而会增加实现复杂度
          case "Install":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateOperationBtnStatus(
                "Install",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                "info",
                "正在请求安装",
                null,
                false,
                false,
                null
              );
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.plsLifecycleControl`,
                { target: "instSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcInstalled = true;
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "success",
                  "服务安装成功",
                  null,
                  true,
                  true,
                  2000
                );
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "error",
                  "服务安装失败",
                  "<p>检查日志以获取详细信息</p>",
                  true,
                  false,
                  null
                );
              }
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
            };
            break;
          case "Uninstall":
            if (btnContent === "删除内核") {
              btnEl.onclick = async () => {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateOperationBtnStatus(
                  "Uninstall",
                  true
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "warning",
                  "正在删除内核",
                  null,
                  false,
                  false,
                  null
                );
                const ret = await ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.plsLifecycleControl`,
                  { target: "rmBin" }
                );
                if (ret.success) {
                  lifecycleStatus.installed = false;
                  lifecycleStatus.svcInstalled = false;
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                    "success",
                    "内核已删除",
                    null,
                    true,
                    true,
                    2000
                  );
                } else {
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                    "error",
                    "内核删除失败",
                    "<p>检查日志以获取详细信息</p>",
                    true,
                    false,
                    null
                  );
                }
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
              };
            } else {
              btnEl.onclick = async () => {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateOperationBtnStatus(
                  "Uninstall",
                  true
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
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
                    `${IPC_METHOD_BASE}.plsLifecycleControl`,
                    { target: "stopSvc" }
                  );
                  if (!stopRet.success) {
                    global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                      "error",
                      "服务卸载失败: 无法停止服务",
                      "<p>检查日志以获取详细信息</p><p>您可以尝试手动停止 PLS 服务</p>",
                      true,
                      false,
                      null
                    );
                  } else {
                    lifecycleStatus.svcRunning = false;
                  }
                }
                const ret = await ipcRenderer.invoke(
                  `${IPC_METHOD_BASE}.plsLifecycleControl`,
                  { target: "rmSvc" }
                );
                if (ret.success) {
                  lifecycleStatus.svcInstalled = false;
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                    "success",
                    "服务卸载成功",
                    null,
                    true,
                    true,
                    2000
                  );
                } else {
                  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                    "error",
                    "服务卸载失败",
                    "<p>检查日志以获取详细信息</p>",
                    true,
                    false,
                    null
                  );
                }
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
              };
            }

            break;
          case "Start":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateOperationBtnStatus(
                "Start",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                "info",
                "正在请求启动",
                null,
                false,
                false,
                null
              );
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.plsLifecycleControl`,
                { target: "startSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcRunning = true;
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "success",
                  "PLS 已启动",
                  null,
                  true,
                  true,
                  2000
                );
                await global.__HUGO_AURA_GLOBAL__.utils.sleep(100);
                await ipcRenderer.invoke(`${IPC_METHOD_BASE}.retryPlsConnect`);
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "error",
                  "PLS 启动失败",
                  "<p>检查 PLS 日志目录以获取详细信息</p>",
                  true,
                  false,
                  null
                );
              }
            };
            break;
          case "Stop":
            btnEl.onclick = async () => {
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateOperationBtnStatus(
                "Stop",
                true
              );
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                "info",
                "正在请求停止",
                null,
                false,
                false,
                null
              );
              const ret = await ipcRenderer.invoke(
                `${IPC_METHOD_BASE}.plsLifecycleControl`,
                { target: "stopSvc" }
              );
              if (ret.success) {
                lifecycleStatus.svcRunning = false;
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "success",
                  "PLS 已停止",
                  null,
                  true,
                  true,
                  2000
                );
              } else {
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
                  "error",
                  "PLS 停止失败",
                  null,
                  true,
                  false,
                  null
                );
                global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
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
      const curPlsStats = await updatePlsStatusFromLocal();

      const acIdInst = "acs-bc-psp-installStatus-container";
      const atIdInst = "acs-bc-psp-installStatus-text";
      switch (lifecycleStatus.installed) {
        case true:
          if (!lifecycleStatus.svcInstalled) {
            updateStatusEl(acIdInst, atIdInst, "WARNING", "已下载, 服务未安装");
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Uninstall",
              false,
              "删除内核"
            );
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Start", true);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Stop", true);
          } else {
            updateStatusEl(acIdInst, atIdInst, "SUCCESS", "已安装");
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", true);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Uninstall",
              false,
              "卸载服务"
            );
          }
          break;
        case false:
          updateStatusEl(acIdInst, atIdInst, "PENDING", "未下载");
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Download", false);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", true);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Uninstall", true);
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
        switch (lifecycleStatus.svcRunning || curPlsStats.launched) {
          case true:
            if (curPlsStats.status !== "notReady") {
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
      switch (curPlsStats.connected) {
        case true:
          updateStatusEl(acIdConn, atIdConn, "SUCCESS", "已连接");
          break;
        case false:
          if (curPlsStats.status !== "notReady") {
            updateStatusEl(acIdConn, atIdConn, "FAILED", "连接失败");
          } else {
            updateStatusEl(acIdConn, atIdConn, "PENDING", "等待启动");
          }
          break;
      }

      if (curPlsStats.version && curPlsStats.version !== "未知") {
        const versionTextEl = document.getElementById(
          "acs-bc-psp-version-text"
        );
        versionTextEl.textContent = "v" + curPlsStats.version;
      }
    },

    refreshPlsStatus: async (init = false) => {
      const binExistsRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.getPlsBinExists`
      );
      if (binExistsRet.success && binExistsRet.data.isExists) {
        lifecycleStatus.installed = true;
      } else {
        lifecycleStatus.installed = false;
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
          "error",
          "请下载 PLS 内核以继续",
          null,
          true,
          true,
          3000
        );
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
        return;
      }

      const isDetachedRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.plsLifecycleQuery`,
        { target: "isDetached" }
      );
      if (isDetachedRet.success && isDetachedRet.result) {
        lifecycleStatus.detached = true;
      } else {
        lifecycleStatus.detached = false;
      }

      const isSvcInstalledRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.plsLifecycleQuery`,
        { target: "isSvcInstalled" }
      );
      if (isSvcInstalledRet.success && isSvcInstalledRet.result) {
        lifecycleStatus.svcInstalled = true;
      } else {
        lifecycleStatus.svcInstalled = false;
      }

      const isSvcRunningRet = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.plsLifecycleQuery`,
        { target: "isSvcStart" }
      );
      if (isSvcRunningRet.success && isSvcRunningRet.result) {
        lifecycleStatus.svcRunning = true;
      } else {
        lifecycleStatus.svcRunning = false;
      }

      if (init) {
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
        return;
      }

      const updateOperationBtnStatus =
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus
          .updateOperationBtnStatus;
      updateOperationBtnStatus("Refresh", true);
      const result = await ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.retryPlsConnect`
      );
      if (result.success && result.status === "Retrying") {
        updateOperationBtnStatus("Refresh", true, "正在重连");

        ipcRenderer.once(
          `${IPC_METHOD_BASE}.post.updateRetryStatus`,
          async (_evt, arg) => {
            await global.__HUGO_AURA_GLOBAL__.utils.sleep(50);
            updateOperationBtnStatus("Refresh", false, "刷新状态");
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
              arg.success ? "success" : "error",
              arg.success ? "更新成功" : "连接失败",
              null,
              true,
              true,
              3000
            );
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatusContent();
          }
        );
      } else if (result.success && result.status === "Already") {
        updateOperationBtnStatus("Refresh", false, "刷新状态");
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateToast(
          "success",
          "更新成功",
          null,
          true,
          true,
          3000
        );
      }
    },

    downloadPLSBin: async () => {
      const GLOBAL_FUNCTIONS =
        global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus;
      GLOBAL_FUNCTIONS.updateOperationBtnStatus("Download", true, "正在检查");
      GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", true);
      const CUR_CHANNEL = `${IPC_METHOD_BASE}.post.reportPlsDownloadStatus`;
      await ipcRenderer.invoke(`${IPC_METHOD_BASE}.ensurePlsInstallDir`);
      GLOBAL_FUNCTIONS.updateToast(
        "info",
        "准备开始下载...",
        null,
        true,
        true,
        2000
      );
      GLOBAL_FUNCTIONS.updateOperationBtnStatus("Download", true, "等待下载");

      const callbackFn = (_evt, info) => {
        switch (info.status) {
          case "failed":
            GLOBAL_FUNCTIONS.updateToast(
              "error",
              "下载失败",
              `<p>${
                info.message ? info.message : "检查日志以获取错误信息"
              }</p>`,
              true,
              true,
              5000
            );
            ipcRenderer.off(CUR_CHANNEL, callbackFn);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
            break;
          case "done":
            GLOBAL_FUNCTIONS.updateToast(
              "success",
              "下载成功",
              null,
              true,
              true,
              2500
            );
            ipcRenderer.off(CUR_CHANNEL, callbackFn);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Download",
              true,
              "下载内核"
            );
            lifecycleStatus.installed = true;
            GLOBAL_FUNCTIONS.updateStatusContent();
            break;
          case "waiting":
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Download",
              true,
              "等待中..."
            );
            break;
          case "progressing":
            GLOBAL_FUNCTIONS.updateOperationBtnStatus(
              "Download",
              true,
              `下载 ${Math.round(info.progress)}%`
            );
            break;
        }
      };

      ipcRenderer.on(CUR_CHANNEL, callbackFn);

      ipcRenderer.invoke(`$aura.pls.downloadPls`, {
        channel: "stable",
        reportTo: "assistant",
      });
    },
  };

  const GLOBAL_FUNCTIONS =
    global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus;

  const {
    updatePlsStatusFromLocal,
  } = require(`${REQUIRE_BASE}/../../../composables/plsConfigManager`);

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
          "acs-bc-pls-status-page-status-area pending";
        break;
      case "SUCCESS":
        areaContainerEl.className =
          "acs-bc-pls-status-page-status-area success";
        break;
      case "FAILED":
        areaContainerEl.className = "acs-bc-pls-status-page-status-area failed";
        break;
      case "WARNING":
        areaContainerEl.className =
          "acs-bc-pls-status-page-status-area warning";
        break;
      case "INFO":
        areaContainerEl.className = "acs-bc-pls-status-page-status-area info";
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
    GLOBAL_FUNCTIONS.refreshPlsStatus(true);
    document.addEventListener("onPLSStatsUpdate", () => {
      GLOBAL_FUNCTIONS.updateStatusContent();
    });
  };

  onMounted();
})();
