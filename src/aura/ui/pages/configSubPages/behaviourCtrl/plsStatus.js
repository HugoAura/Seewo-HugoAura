if (!global.__HUGO_AURA_UI_FUNCTIONS__.subConfig)
  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig = {};

(() => {
  const REQUIRE_BASE = "../../aura/ui/pages/configSubPages/behaviourCtrl";
  const IPC_METHOD_BASE = "$aura.pls";

  global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus = {
    updateOperationBtnStatus: async (btnName, side, btnContent = null) => {
      const btnEl = document.getElementById(`acsBcPsp-operBtn-${btnName}`);
      if (!btnEl) return false;
      btnEl.setAttribute("aura-disabled", side ? "true" : "false");
      if (btnContent) {
        const btnPEl = btnEl.getElementsByTagName("p")[0];
        btnPEl.textContent = btnContent;
      }
      if (side) {
        btnEl.onclick = () => {};
      } else {
        switch (btnName) {
          case "Refresh":
            btnEl.onclick = () =>
              global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.refreshPlsStatus();
            break;
          case "Download":
            break;
          case "Install":
            break;
          case "Uninstall":
            break;
          default:
            break;
        }
      }
      return true;
    },

    updateStatus: async () => {
      const curPlsStats = await updatePlsStatusFromLocal();

      const acIdInst = "acs-bc-psp-installStatus-container";
      const atIdInst = "acs-bc-psp-installStatus-text";
      switch (curPlsStats.installed) {
        case true:
          updateStatusEl(acIdInst, atIdInst, "SUCCESS", "已安装");
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", false);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Uninstall", false);
          break;
        case false:
          updateStatusEl(acIdInst, atIdInst, "PENDING", "未安装");
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Install", true);
          GLOBAL_FUNCTIONS.updateOperationBtnStatus("Uninstall", true);
      }

      const acIdLaunch = "acs-bc-psp-launchStatus-container";
      const atIdLaunch = "acs-bc-psp-launchStatus-text";
      switch (curPlsStats.launched) {
        case true:
          updateStatusEl(acIdLaunch, atIdLaunch, "SUCCESS", "已启动");
          break;
        case false:
          updateStatusEl(acIdLaunch, atIdLaunch, "PENDING", "未启动");
          break;
      }

      const acIdConn = "acs-bc-psp-connStatus-container";
      const atIdConn = "acs-bc-psp-connStatus-text";
      switch (curPlsStats.connected) {
        case true:
          updateStatusEl(acIdConn, atIdConn, "SUCCESS", "已连接");
          break;
        case false:
          updateStatusEl(acIdConn, atIdConn, "FAILED", "连接失败");
          break;
      }

      if (curPlsStats.version && curPlsStats.version !== "未知") {
        const versionTextEl = document.getElementById(
          "acs-bc-psp-version-text"
        );
        versionTextEl.textContent = "v" + curPlsStats.version;
      }
    },

    refreshPlsStatus: async () => {
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
          async (_evt, _arg) => {
            await global.__HUGO_AURA_GLOBAL__.utils.sleep(50);
            updateOperationBtnStatus("Refresh", false, "刷新状态");
            global.__HUGO_AURA_UI_FUNCTIONS__.subConfig.plsStatus.updateStatus();
          }
        );
      } else if (result.success && result.status === "Already") {
        updateOperationBtnStatus("Refresh", false, "刷新状态");
      }
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
      default:
        return false;
    }
    areaContainerText.textContent = text ? text : "";
    return true;
  };

  const onMounted = () => {
    GLOBAL_FUNCTIONS.updateOperationBtnStatus("Refresh", false);
    initBsTooltip();
    GLOBAL_FUNCTIONS.updateStatus();
    document.addEventListener("onPLSStatsUpdate", () => {
      GLOBAL_FUNCTIONS.updateStatus();
    });
  };

  onMounted();
})();
