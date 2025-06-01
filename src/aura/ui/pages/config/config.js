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
    let preserveOperationIdx = 0;
    switch (subPage) {
      case "disableLimitations":
        preserveOperationIdx = 0;
        pendingSubPageId = "Aura.UI.Assistant.Config.DisableLimitations";
        break;
      case "behaviourCtrl":
        preserveOperationIdx = 1;
        pendingSubPageId = "Aura.UI.Assistant.Config.BehaviourCtrl";
        if (!side) {
          setTimeout(() => {
            global.__HUGO_AURA_LOADER__[
              "Aura.UI.Assistant.Config.BehaviourCtrl.PlsStatus"
            ].active = false;
          }, 500);
        }
        break;
      default:
        break;
    }

    side
      ? operationElArr[preserveOperationIdx].classList.add("preserve-operation")
      : operationElArr[preserveOperationIdx].classList.remove(
          "preserve-operation"
        );

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

  verifyAuthPassword: async () => {
    const showFailedAnimation = async (el) => {
      el.classList.remove("invalid");
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(50);
      el.classList.add("invalid"); // Custom Anim
      el.classList.add("is-invalid"); // Bootstrap
    };

    const inputEl = document.getElementById("acp-auth-user-input");
    const userPasswdInput = inputEl.value;

    if (!userPasswdInput || userPasswdInput.length < 8) {
      showFailedAnimation(inputEl);
      return false;
    }

    const crypto = require("crypto");
    const encPasswd = crypto
      .createHash("sha512")
      .update(userPasswdInput + "EndlessX")
      .digest("hex")
      .toUpperCase();

    if (
      encPasswd ===
      global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordWithSalt
    ) {
      const acsDialogAreaEl = document.getElementsByClassName(
        "aura-config-page-auth-dialog-area"
      )[0];
      acsDialogAreaEl.classList.add("acp-ada-hidden");
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
      acsDialogAreaEl.style = "display: none;";
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(250);
      global.__HUGO_AURA_UI_FUNCTIONS__.config.showSecondPhaseAnim();
      return true;
    } else {
      showFailedAnimation(inputEl);
      return false;
    }
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

  global.__HUGO_AURA_UI_FUNCTIONS__.config.showSecondPhaseAnim = () => {
    showOperationsAnimation();
  };

  const handleSettingsAuth = async () => {
    const isAuthEnabled =
      global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordEnabled;

    if (!isAuthEnabled) {
      showOperationsAnimation();
    } else {
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(50);
      const acsDialogAreaEl = document.getElementsByClassName(
        "aura-config-page-auth-dialog-area"
      )[0];
      acsDialogAreaEl.style = "";
      if (
        global.__HUGO_AURA_CONFIG__.auraSettings.appearance
          .enablePasswdDialogBlur
      ) {
        acsDialogAreaEl.classList.add("blur-enabled");
      }
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
      acsDialogAreaEl.classList.remove("acp-ada-hidden");
    }
  };

  const showAnimation = async () => {
    const auraConfigPageRoot = document.getElementsByClassName(
      "aura-config-page-root"
    )[0];
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(200);
    auraConfigPageRoot.className = "aura-config-page-root";

    const defaultHeader = document.getElementsByClassName(
      "index__header__16DmR2a5"
    )[0];

    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
    defaultHeader.style = "display: none;";
    showVersionContainerAnimation();
    showHeaderAnimation();
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);

    await handleSettingsAuth();
  };

  const onMounted = () => {
    applyVersionInfo();

    showAnimation();
  };

  onMounted();
})();
