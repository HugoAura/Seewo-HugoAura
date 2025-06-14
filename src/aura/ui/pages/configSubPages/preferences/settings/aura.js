// @ts-check

const functions = {
  /**
   *
   * @param {"enc" | "update"} mode
   * @param {SHA256EncryptedPassword | null} password
   */
  handleEnableConfigEncryption: async (mode, password) => {
    let exiPassword = "";
    if (!password) {
      exiPassword =
        global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordWithSalt;
    }

    switch (mode) {
      case "enc":
        ipcRenderer.invoke("$aura.config.setConfigEncSettings", {
          target: true,
        });
        global.ipcRenderer.invoke("$aura.config.dispatchConfigFromRenderer", {
          data: JSON.stringify(global.__HUGO_AURA_CONFIG__),
        });
        global.__HUGO_AURA_CONFIG_MGR__.encryptConfig(
          global.__HUGO_AURA_CONFIG__,
          password ? password : exiPassword
        );
        global.__HUGO_AURA_CONFIG_MGR__.saveEncPassword(
          password ? password : exiPassword
        );
        break;
      case "update":
        const result = await global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
          global.__HUGO_AURA_CONFIG__,
          null
        );
        if (result.success) {
          ipcRenderer.invoke("$aura.config.setConfigEncSettings", {
            target: true,
          });
          global.ipcRenderer.invoke("$aura.config.dispatchConfigFromRenderer", {
            data: JSON.stringify(global.__HUGO_AURA_CONFIG__),
          });
          global.__HUGO_AURA_CONFIG_MGR__.encryptConfig(
            global.__HUGO_AURA_CONFIG__,
            password ? password : exiPassword
          );
          global.__HUGO_AURA_CONFIG_MGR__.saveEncPassword(
            password ? password : exiPassword
          );
        } else {
          // TODO: Error handling
        }
        break;
    }
  },

  /**
   *
   * @param {SHA256EncryptedPassword} password
   */
  handle2ndPasswordPrompt: async (password) => {
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
    // @ts-expect-error
    acsDialogAreaEl.style = "";
    acpDialogTitleEl.textContent = "请再次输入密码";
    await window.__HUGO_AURA_GLOBAL__.utils.sleep(50);
    acpAppBarEl.classList.add("color-reverse");
    acsDialogAreaEl.classList.remove("acp-ada-hidden");

    const showFailedAnimation = async (el) => {
      el.classList.remove("invalid");
      await window.__HUGO_AURA_GLOBAL__.utils.sleep(50);
      el.classList.add("invalid"); // Custom Anim
      el.classList.add("is-invalid"); // Bootstrap
    };

    let resolveFn = null;
    const awaitCompletePromise = new Promise((resolve) => {
      resolveFn = resolve;
    });

    const handleExit = async () => {
      const result = await awaitCompletePromise;
      if (result) {
        return { valid: true };
      } else {
        const inputEl = document.getElementById("auraSettingsPasswd");
        // @ts-expect-error
        inputEl.value = "";
        return { valid: false, hint: "未能验证密码, 请重试" };
      }
    };

    const verifyPassword = async (_clickEvt) => {
      const inputEl = document.getElementById("acp-auth-user-input");
      const acpDialogTitleEl = document.getElementsByClassName(
        "acp-auth-dialog-title"
      )[0];
      // @ts-expect-error
      const userPasswdInput = inputEl.value;
      if (!userPasswdInput) {
        showFailedAnimation(inputEl);
        acpDialogTitleEl.textContent = "密码不能为空";
      }

      const crypto = require("crypto");
      const encPasswd = crypto
        .createHash("sha512")
        .update(userPasswdInput + "EndlessX")
        .digest("hex")
        .toUpperCase();

      if (encPasswd === password) {
        await global.__HUGO_AURA_UI_FUNCTIONS__.config.hideAndResetAuthDialog();

        global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordWithSalt =
          password;
        if (global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig) {
          functions.handleEnableConfigEncryption("update", password);
        }
        if (resolveFn) resolveFn(true);
        return;
      } else {
        showFailedAnimation(inputEl);
        acpDialogTitleEl.textContent = "请再试一次";
        return;
      }
    };

    // @ts-expect-error
    acpDialogConfirmBtnEl.onclick = verifyPassword;
    // @ts-expect-error
    acpDialogCancelBtnEl.onclick = (_evt) => {
      if (resolveFn) resolveFn(false);
      global.__HUGO_AURA_UI_FUNCTIONS__.config.handleNavBack();
    };

    return await handleExit();
  },

  getCurAccessMethodCount: () => {
    const fallbackMethods =
      global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
        .fallbackAccessMethods;
    const fallbackMethodsKeys = Object.keys(fallbackMethods);

    let enabledCount = 0;

    for (const method of fallbackMethodsKeys) {
      if (fallbackMethods[method]) {
        enabledCount += 1;
      }
    }

    if (global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod.showEntryIcon) {
      enabledCount += 1;
    }

    return enabledCount;
  },
};

const auraSettings = [
  {
    id: 0,
    categoryName: "安全性",
    child: [
      {
        index: 0,
        id: "enableAuraSettingsPasswd",
        type: "switch",
        name: "启用访问密码",
        description: "启用后, Aura 设置 UI 需要输入密码才可访问",
        restart: false,
        reload: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.settingsPasswordEnabled =
            newVal;
          if (
            newVal &&
            global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig
          ) {
            functions.handleEnableConfigEncryption("enc", null);
          } else if (
            !newVal &&
            global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig
          ) {
            await global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
              global.__HUGO_AURA_CONFIG__,
              null
            );
          }
        },
      },
      {
        index: 1,
        id: "enableConfigEncryption",
        type: "switch",
        name: "加密配置文件",
        description: "启用后, 本地配置文件将加密保存",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "配置文件将以 AES-256-GCM 加密算法在本地保存",
        warning: true,
        warningContent: "这可能导致性能问题",
        associateVal: ["auraSettings.settingsPasswordEnabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig = newVal;
          if (newVal) {
            functions.handleEnableConfigEncryption("enc", null);
          } else {
            await global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
              global.__HUGO_AURA_CONFIG__,
              null
            );
          }
        },
      },
      {
        index: 2,
        id: "auraSettingsPasswd",
        type: "input",
        subType: "password",
        name: "访问密码",
        description: "此密码将用于访问 Aura 设置 UI",
        restart: false,
        reload: false,
        tip: true,
        tipTitle: "密码将在本地使用 SHA512 加盐存储",
        associateVal: ["auraSettings.settingsPasswordEnabled"],
        auraIf: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        defaultValue: "",
        placeHolder: "留空表示不修改, 保留已设置值",
        valueGetter: () => {
          return "";
        },
        callbackFn: async (newVal) => {
          if (newVal === "" || !newVal) return { valid: true };
          if (newVal.length < 8)
            return { valid: false, hint: "请输入至少 8 位密码" };

          const hasNumber = /[0-9]/.test(newVal);
          const hasLetter = /[a-zA-Z]/.test(newVal);
          const hasSpecial = /[^a-zA-Z0-9]/.test(newVal);

          const typeCount = [hasNumber, hasLetter, hasSpecial].filter(
            Boolean
          ).length;

          if (typeCount < 2) {
            return {
              valid: false,
              hint: "请包含数字 / 字母 / 特殊字符中的至少 2 种",
            };
          }

          const crypto = require("crypto");
          const result = crypto
            .createHash("sha512")
            .update(newVal + "EndlessX")
            .digest("hex")
            .toUpperCase();

          return await functions.handle2ndPasswordPrompt(result);
        },
      },
    ],
  },
  {
    id: 1,
    categoryName: "访问方式",
    child: [
      {
        index: 0,
        id: "showEntryIcon",
        type: "switch",
        name: "显示 HugoAura 设置图标",
        description: "控制 HugoAura 设置入口图标在管家首页的显示状态",
        restart: false,
        reload: true,
        tip: true,
        tipTitle: "禁用后, HugoAura 图标将不会出现在主页右上角",
        associateVal: [
          "auraSettings.uiAccessMethod.fallbackAccessMethods.hotkey",
          "auraSettings.uiAccessMethod.fallbackAccessMethods.touch",
        ],
        auraIf: () => {
          return true;
        },
        auraDisable: () => {
          const fallbackMethods =
            global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
              .fallbackAccessMethods;
          const fallbackMethodsKeys = Object.keys(fallbackMethods);
          let anyEnabled = false;

          for (const method of fallbackMethodsKeys) {
            if (fallbackMethods[method]) {
              anyEnabled = true;
              break;
            }
          }

          return {
            value: !anyEnabled,
            tooltip: !anyEnabled ? "至少启用一个备选访问方式" : "",
          };
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
            .showEntryIcon;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod.showEntryIcon =
            newVal;
        },
      },
      {
        index: 1,
        id: "allowHotkeyAccess",
        type: "switch",
        name: "使用快捷键打开 HugoAura 设置 UI",
        description:
          "启用后, 在管家首页按下 Ctrl + Shift + A 以打开 HugoAura 设置",
        restart: false,
        reload: true,
        associateVal: [
          "auraSettings.uiAccessMethod.showEntryIcon",
          "auraSettings.uiAccessMethod.fallbackAccessMethods.hotkey",
          "auraSettings.uiAccessMethod.fallbackAccessMethods.touch",
        ],
        auraIf: () => {
          return true;
        },
        auraDisable: () => {
          const enableCount = functions.getCurAccessMethodCount();
          if (
            enableCount < 2 &&
            !global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
              .showEntryIcon &&
            global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
              .fallbackAccessMethods.hotkey
          ) {
            return { value: true, tooltip: "无法禁用所有访问方式" };
          } else {
            return { value: false };
          }
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
            .fallbackAccessMethods.hotkey;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod.fallbackAccessMethods.hotkey =
            newVal;
        },
      },
      {
        index: 2,
        id: "allowTouchAccess",
        type: "switch",
        name: "使用触摸手势打开 HugoAura 设置 UI",
        description:
          "启用后, 在管家首页连击 7 次右上角信息栏 ( i ) 中的版本号区域以打开 HugoAura 设置",
        restart: false,
        reload: true,
        tip: true,
        tipTitle: "请在 10 秒钟内完成连击操作, 否则计时器将被重置",
        associateVal: [
          "auraSettings.uiAccessMethod.showEntryIcon",
          "auraSettings.uiAccessMethod.fallbackAccessMethods.hotkey",
          "auraSettings.uiAccessMethod.fallbackAccessMethods.touch",
        ],
        auraIf: () => {
          return true;
        },
        auraDisable: () => {
          const enableCount = functions.getCurAccessMethodCount();
          if (
            enableCount < 2 &&
            !global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
              .showEntryIcon &&
            global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
              .fallbackAccessMethods.touch
          ) {
            return { value: true, tooltip: "无法禁用所有访问方式" };
          } else {
            return { value: false };
          }
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
            .fallbackAccessMethods.touch;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod.fallbackAccessMethods.touch =
            newVal;
        },
      },
    ],
  },
  {
    id: 2,
    categoryName: "外观",
    child: [
      {
        index: 0,
        id: "actionBtnsOnRight",
        type: "switch",
        name: "顶栏操作类按钮右置",
        description: "启用后, 顶栏的<b>返回首页按钮</b>将靠右放置",
        restart: false,
        reload: false,
        auraIf: () => {
          return true;
        },
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings.appearance.appBar
            .actionBtnsOnRight;
        },
        callbackFn: async (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.appearance.appBar.actionBtnsOnRight =
            newVal;
          global.__HUGO_AURA_UI_FUNCTIONS__.config.initCustomUIProps(true);
        },
      },
    ],
  },
];

module.exports = { auraSettings };
