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
        const result = global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
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
      console.debug(result);
      if (result) {
        console.debug("ret true");
        return { valid: true };
      } else {
        console.debug("ret false");
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
        tip: true,
        tipTitle: "启用访问密码将自动加密配置文件",
        associateVal: null,
        auraIf: () => true,
        defaultValue: false,
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.auraSettings
            .settingsPasswordEnabled;
        },
        callbackFn: (newVal) => {
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
            global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
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
        callbackFn: (newVal) => {
          if (typeof newVal !== "boolean") return;
          global.__HUGO_AURA_CONFIG__.auraSettings.encryptConfig = newVal;
          if (newVal) {
            functions.handleEnableConfigEncryption("enc", null);
          } else {
            global.__HUGO_AURA_CONFIG_MGR__.switchToDecConfig(
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
    categoryName: "外观",
    child: [],
  },
];

module.exports = { auraSettings };
