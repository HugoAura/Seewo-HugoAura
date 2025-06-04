global.__HUGO_AURA_UI_REACTIVES__.config = {
  isInSubPage: false,
  currentActiveSubPage: "",
  authenticated: false,
  isConfigPendingWrite: false,
};

global.__HUGO_AURA_UI_FUNCTIONS__.config = {
  handleNavBack: () => {
    if (global.__HUGO_AURA_UI_REACTIVES__.config.isInSubPage) {
      const acsDialogAreaEl = document.getElementsByClassName(
        "aura-config-page-auth-dialog-area"
      )[0];
      if (!Array.from(acsDialogAreaEl.classList).includes("acp-ada-hidden")) {
        global.__HUGO_AURA_UI_FUNCTIONS__.config.hideAndResetAuthDialog();
        return;
      }

      if (global.__HUGO_AURA_UI_REACTIVES__.config.isConfigPendingWrite) {
        global.__HUGO_AURA_UI_FUNCTIONS__.config.handleSaveConfig();
      }
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
    if (!global.__HUGO_AURA_UI_REACTIVES__.config.authenticated) return;
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
      case "plugins":
        // To Be Done
        preserveOperationIdx = 2;
        pendingSubPageId = "Aura.UI.Assistant.Config.Plugins";
        break;
      case "preferences":
        preserveOperationIdx = 3;
        pendingSubPageId = "Aura.UI.Assistant.Config.Preferences";
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
      await global.__HUGO_AURA_UI_FUNCTIONS__.config.hideAndResetAuthDialog();
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(250);
      global.__HUGO_AURA_UI_REACTIVES__.config.authenticated = true;
      global.__HUGO_AURA_UI_FUNCTIONS__.config.showSecondPhaseAnim();
      return true;
    } else {
      showFailedAnimation(inputEl);
      return false;
    }
  },

  hideAndResetAuthDialog: async () => {
    const acsDialogAreaEl = document.getElementsByClassName(
      "aura-config-page-auth-dialog-area"
    )[0];
    const acpAppBarEl = document.getElementsByClassName(
      "aura-config-page-header-area"
    )[0];
    const acpDialogTitleEl = document.getElementsByClassName(
      "acp-auth-dialog-title"
    )[0];
    const acpDialogConfirmBtnEl = document.getElementsByClassName(
      "acp-auth-confirm-btn"
    )[0];
    const acpDialogCancelBtnEl = document.getElementsByClassName(
      "acp-auth-cancel-btn"
    )[0];
    const inputEl = document.getElementById("acp-auth-user-input");
    acsDialogAreaEl.classList.add("acp-ada-hidden");
    acpAppBarEl.classList.remove("color-reverse");
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
    acsDialogAreaEl.style = "display: none;";
    acpDialogTitleEl.textContent = "验证您的身份";
    inputEl.value = "";
    inputEl.classList.remove("invalid");
    inputEl.classList.remove("is-invalid");
    acpDialogConfirmBtnEl.onclick = (_evt) => {
      global.__HUGO_AURA_UI_FUNCTIONS__.config.verifyAuthPassword();
    };
    acpDialogCancelBtnEl.onclick = (_evt) => {
      global.__HUGO_AURA_UI_FUNCTIONS__.config.handleNavBack();
    };
  },

  handleACSNShow: async () => {
    const acsnRootEl = document.getElementsByClassName(
      "acp-config-status-notify"
    )[0];
    acsnRootEl.classList.remove("fully-hidden");
    await global.__HUGO_AURA_GLOBAL__.utils.sleep(10);
    acsnRootEl.classList.remove("hidden");
    return true;
  },

  handleSaveConfig: async () => {
    const result = global.__HUGO_AURA_CONFIG_MGR__.writeConfig(
      global.__HUGO_AURA_CONFIG__
    );

    if (result) {
      global.__HUGO_AURA_UI_REACTIVES__.config.isConfigPendingWrite = false;
      const acsnRootEl = document.getElementsByClassName(
        "acp-config-status-notify"
      )[0];
      const acsnMainContentEl = document.getElementsByClassName(
        "acp-config-status-notify-main-content"
      )[0];
      const acsnSuccessEl = document.getElementsByClassName(
        "acp-config-status-notify-success"
      )[0];
      const acsnAreaEl = document.getElementsByClassName(
        "acp-config-status-notify-area"
      )[0];
      acsnMainContentEl.classList.add("acsn-main-content-hidden");
      acsnAreaEl.classList.add("transparent");
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(250);
      acsnMainContentEl.classList.add("acsn-main-content-fully-hidden");
      acsnSuccessEl.classList.remove("acsn-success-fully-hidden");
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(50);
      acsnSuccessEl.classList.remove("acsn-success-hidden");
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(1500);
      acsnRootEl.classList.add("hidden");
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(500);
      acsnRootEl.classList.add("fully-hidden");
      await global.__HUGO_AURA_GLOBAL__.utils.sleep(10);
      // Reset class
      acsnMainContentEl.className = "acp-config-status-notify-main-content";
      acsnAreaEl.className = "acp-config-status-notify-area";
      acsnSuccessEl.className =
        "acp-config-status-notify-success acsn-success-hidden acsn-success-fully-hidden";
      return true;
    } else {
      // TODO: Error handling
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
      global.__HUGO_AURA_UI_REACTIVES__.config.authenticated = true;
      showOperationsAnimation();
    } else {
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(50);
      const acsDialogAreaEl = document.getElementsByClassName(
        "aura-config-page-auth-dialog-area"
      )[0];
      const acpAppBarEl = document.getElementsByClassName(
        "aura-config-page-header-area"
      )[0];
      acsDialogAreaEl.style = "";
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(500);
      acsDialogAreaEl.classList.remove("acp-ada-hidden");
      acpAppBarEl.classList.add("color-reverse");
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
