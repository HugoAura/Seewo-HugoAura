global.__HUGO_AURA_UI_REACTIVES__.config = {
  isInSubPage: false,
  currentActiveSubPage: "",
};

global.__HUGO_AURA_UI_FUNCTIONS__.config = {
  handleNavBack: () => {
    if (global.__HUGO_AURA_UI_REACTIVES__.config.isInSubPage) {
      global.__HUGO_AURA_UI_FUNCTIONS__.config.toggleSubConfig(
        global.__HUGO_AURA_UI_REACTIVES__.config.currentActiveSubPage,
        false
      );
    } else {
      global.__HUGO_AURA_UI_FUNCTIONS__.config.hideConfigPage();
    }
  },

  hideConfigPage: async () => {
    const defaultHeader = document.getElementsByClassName(
      "index__header__16DmR2a5"
    )[0];
    defaultHeader.style = "-webkit-app-region: drag;";

    const auraConfigPageRoot = document.getElementsByClassName(
      "aura-config-page-root"
    )[0];
    auraConfigPageRoot.className =
      "aura-config-page-root-inactive aura-config-page-root";

    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);

    window.__HUGO_AURA_LOADER__["Aura.UI.Assistant.Config"].active = false;
  },

  toggleSubConfig: (subPage, side) => {
    if (side === global.__HUGO_AURA_UI_REACTIVES__.config.isInSubPage) return;
    if (!side) {
      side = !global.__HUGO_AURA_UI_REACTIVES__.config.isInSubPage;
    }

    const operationContainerEl = document.getElementsByClassName(
      "aura-config-page-operation-container"
    )[0];
    side
      ? operationContainerEl.classList.add("hide-other-operations")
      : operationContainerEl.classList.remove("hide-other-operations");

    const operationElArr = document.getElementsByClassName(
      "aura-config-page-operation-el"
    );
    let pendingSubPageId = "";
    switch (subPage) {
      case "disableLimitations":
        side
          ? operationElArr[0].classList.add("preserve-operation")
          : operationElArr[0].classList.remove("preserve-operation");
        pendingSubPageId = "Aura.UI.Assistant.Config.DisableLimitations";
        break;
      default:
        break;
    }

    const operationAreaEl = document.getElementsByClassName(
      "aura-config-page-operation-area"
    )[0];
    if (side) {
      operationAreaEl.classList.add("subpage-expanded");
    } else {
      operationAreaEl.style = "flex: 15;";
      operationAreaEl.classList.remove("subpage-expanded");
      setTimeout(() => {
        operationAreaEl.style = "";
      }, 500);
    }

    const statusContainerEl = document.getElementsByClassName(
      "aura-config-page-status-container"
    )[0];
    if (side) {
      statusContainerEl.classList.add(
        "aura-config-page-status-container-hidden"
      );
    } else {
      setTimeout(() => {
        statusContainerEl.classList.remove(
          "aura-config-page-status-container-hidden"
        );
      }, 500);
    }

    setTimeout(
      () => {
        window.__HUGO_AURA_LOADER__[pendingSubPageId].active = side;
      },
      side ? 0 : 500
    );

    global.__HUGO_AURA_UI_REACTIVES__.config.currentActiveSubPage = side
      ? subPage
      : "";

    global.__HUGO_AURA_UI_REACTIVES__.config.isInSubPage = side;
  },
};

(() => {
  const applyVersionInfo = () => {
    const nodeVersionEl = document.getElementById("nodeVersion");
    const electronVersionEl = document.getElementById("electronVersion");
    const hugoVersionEl = document.getElementById("hugoVersion");
    const auraVersionEl = document.getElementById("auraVersion");

    nodeVersionEl.textContent = window.process.versions.node;
    electronVersionEl.textContent = window.process.versions.electron;
    hugoVersionEl.textContent = window.CUSTOM_CONFIG.root
      .replace(/\\/g, "/")
      .split("SeewoService_")[1]
      .split("/")[0];
    auraVersionEl.textContent = window.__HUGO_AURA__.version;
  };

  const showVersionContainerAnimation = () => {
    const leftSidePane = document.getElementById("leftStatusContainer");
    const rightSidePane = document.getElementById("rightStatusContainer");
    leftSidePane.className = "aura-config-page-status-side left-side";
    rightSidePane.className = "aura-config-page-status-side right-side";

    const descriptionEl = document.getElementsByClassName(
      "aura-config-page-status-description"
    )[0];
    descriptionEl.className = "aura-config-page-status-description";
  };

  const showHeaderAnimation = () => {
    const headerEl = document.getElementsByClassName(
      "aura-config-page-header-area"
    )[0];
    headerEl.className = "aura-config-page-header-area";
  };

  const showOperationsAnimation = () => {
    const operationElArr = document.getElementsByClassName(
      "aura-config-page-operation-el"
    );
    let timeout = 0;
    Array.from(operationElArr).forEach((el) => {
      setTimeout(() => {
        el.className = "operation-el-show aura-config-page-operation-el";
      }, timeout);
      timeout += 150;
    });
  };

  const showAnimation = async () => {
    const defaultHeader = document.getElementsByClassName(
      "index__header__16DmR2a5"
    )[0];

    const auraConfigPageRoot = document.getElementsByClassName(
      "aura-config-page-root"
    )[0];
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(200);
    auraConfigPageRoot.className = "aura-config-page-root";

    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
    defaultHeader.style = "display: none;";
    showVersionContainerAnimation();
    showHeaderAnimation();
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
    showOperationsAnimation();
  };

  const onMounted = () => {
    applyVersionInfo();

    showAnimation();
  };

  onMounted();
})();
