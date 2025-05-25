(() => {
  const REQUIRE_BASE = "../../aura/ui/pages/configSubPages/behaviourCtrl";
  const IPC_METHOD_BASE = "$aura.pls";

  const {
    updatePlsStatusFromLocal,
  } = require(`${REQUIRE_BASE}/../../../composables/plsConfigManager`);

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

  const updateStatus = async () => {
    const curPlsStats = await updatePlsStatusFromLocal();

    const acIdInst = "acs-bc-psp-installStatus-container";
    const atIdInst = "acs-bc-psp-installStatus-text";
    switch (curPlsStats.installed) {
      case true:
        updateStatusEl(acIdInst, atIdInst, "SUCCESS", "已安装");
        break;
      case false:
        updateStatusEl(acIdInst, atIdInst, "PENDING", "未安装");
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
      const versionTextEl = document.getElementById("acs-bc-psp-version-text");
      versionTextEl.textContent = "v" + curPlsStats.version;
    }
  };

  const onMounted = () => {
    updateStatus();
  };

  onMounted();
})();
