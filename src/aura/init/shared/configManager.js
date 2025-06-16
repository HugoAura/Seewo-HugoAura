// @ts-check

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const childProc = require("child_process");

const RegistryManagerClass = require("./registryManager");
const registryManager = new RegistryManagerClass();

// Constants

const CRYPTO_SETTINGS_AES = {
  mode: "aes-256-gcm",
  keyLength: 32,
  keyIter: 100000,
  ivLength: 12,
  tagLength: 16,
  saltLength: 16,
  obfuscateStr: "eCybsseK",
  hash: "sha256",
};
const LMAK_SETTINGS_BASE = "EncSettings\\LMAK";

/**
 *
 * @param {Record<any, any>} target
 * @param {Record<any, any>} source
 * @returns
 */
const deepMerge = (target, source) => {
  const result = JSON.parse(JSON.stringify(target));

  if (!source || typeof source !== "object") {
    return {};
  }

  const keysToDelete = [];

  Object.keys(result).forEach((key) => {
    if (!(key in source)) {
      keysToDelete.push(key);
    } else if (
      typeof result[key] === "object" &&
      result[key] !== null &&
      typeof source[key] === "object" &&
      source[key] !== null
    ) {
      result[key] = deepMerge(result[key], source[key]);
      if (Object.keys(result[key]).length === 0) {
        keysToDelete.push(key);
      }
    }
  });

  keysToDelete.forEach((key) => {
    delete result[key];
  });

  Object.keys(source).forEach((key) => {
    if (!(key in result)) {
      result[key] = JSON.parse(JSON.stringify(source[key]));
    }
  });

  return result;
};

class ConfigManager {
  constructor() {
    this.configDir = path.join(global.__HUGO_AURA__.logDir, "..");
    this.configPath = path.join(this.configDir, "config.json");
    this.encConfigPath = path.join(this.configDir, ".cache_2eafc8d0.dat"); // (雾
    /* ↑ 不使用 .tmp 扩展名, 不然容易真被清理了 */
    this.defaultConfigPath = path.join(__dirname, "default.json");
    this.useEncConfig = false;
    this.isConfigReadFailed = false;
    this.side = "unknown";

    if (fs.existsSync(this.configPath)) {
      this.useEncConfig = false;
    } else {
      this.useEncConfig = true;
    }

    if (global.__HUGO_AURA_EVENT_BUS__) {
      // Expect always true
      global.__HUGO_AURA_EVENT_BUS__.on(
        "$aura.config.updateConfigEncSettings",
        (/** @type {boolean} */ newVal) => {
          this.useEncConfig = newVal;
        }
      );
    }
  }

  migrateOldConfigFile() {
    if (this.configDir === path.join(os.homedir(), "Documents", "HugoAura")) {
      return;
    }
    const oldConfigPath = path.join(
      os.homedir(),
      "Documents",
      "HugoAura",
      "config.json"
    );
    const oldEncConfigPath = path.join(
      os.homedir(),
      "Documents",
      "HugoAura",
      ".cache_2eafc8d0.dat"
    );
    if (fs.existsSync(oldConfigPath)) {
      fs.copyFileSync(oldConfigPath, this.configPath);
      fs.unlinkSync(oldConfigPath);
    } else if (fs.existsSync(oldEncConfigPath)) {
      fs.copyFileSync(oldEncConfigPath, this.encConfigPath);
      fs.unlinkSync(oldEncConfigPath);
      this.useEncConfig = true;
    }

    console.log(
      `[HugoAura / Config] Moved old config file to ${this.configDir}`
    );
  }

  getHugoAuraConfigPath() {
    return path.dirname(
      this.useEncConfig ? this.encConfigPath : this.configPath
    );
  }

  getConfigPath() {
    return this.useEncConfig ? this.encConfigPath : this.configPath;
  }

  getDefaultConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.defaultConfigPath, "utf8"));
    } catch (err) {
      console.warn(
        "[HugoAura / Config] No default config found, using empty config"
      );
      return { rewrite: {} };
    }
  }

  ensureConfigExists() {
    if (global.__HUGO_AURA__.configInit) return;
    const hugoAuraPath = this.getHugoAuraConfigPath();
    if (!fs.existsSync(hugoAuraPath)) {
      console.log("[HugoAura / Config] Creating HugoAura directory");
      fs.mkdirSync(hugoAuraPath, { recursive: true });
    }

    if (!fs.existsSync(this.configPath) && !fs.existsSync(this.encConfigPath)) {
      console.log("[HugoAura / Config] Creating default config file");
      const defaultConfig = this.getDefaultConfig();
      this.writeConfig(defaultConfig);
    }
  }

  readConfig() {
    try {
      let config = {};
      if (this.useEncConfig) {
        const hashedPasswdResultObj = this.retrieveEncPassword();
        if (hashedPasswdResultObj.success && hashedPasswdResultObj.data) {
          config = this.decryptConfig(hashedPasswdResultObj.data).data;

          if (!config) {
            this.isConfigReadFailed = true;
            return this.getDefaultConfig(); // should be changed, too
          }
        } else {
          console.error("[HugoAura / Config / ERROR] Failed to decrypt config");
          this.isConfigReadFailed = true;
          return this.getDefaultConfig(); // This behaviour should be changed later
        }
      } else {
        config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      }
      // console.log("[HugoAura / Config] Successfully loaded config:", config);
      if (this.isConfigReadFailed) this.isConfigReadFailed = false;
      return config;
    } catch (err) {
      console.error("[HugoAura / Config] Failed to read config:", err);
      this.isConfigReadFailed = true;
      return this.getDefaultConfig();
    }
  }

  /**
   *
   * @param {Record<any, any>} config
   * @returns {Promise<boolean>}
   */
  async writeConfig(config) {
    try {
      if (this.useEncConfig) {
        const hashedPasswdResultObj = await this.retrieveEncPasswordAsync();
        if (hashedPasswdResultObj.success && hashedPasswdResultObj.data) {
          this.encryptConfig(config, hashedPasswdResultObj.data);
        } else {
          console.error(
            "[HugoAura / Config / Write / ERROR] Failed to write config: Retrieve enc password failed"
          );
          return false;
        }
      } else {
        fs.writeFileSync(
          this.configPath,
          JSON.stringify(config, null, 2),
          "utf8"
        );
      }

      if (this.side === "renderer") {
        global.ipcRenderer.send("$aura.config.refreshMainConfig");
      }

      return true;
    } catch (err) {
      console.error("[HugoAura / Config] Failed to write config:", err);
      return false;
    }
  }

  loadConfig() {
    let defaultConfig = this.getDefaultConfig();
    let config = {};
    try {
      if (fs.existsSync(this.configPath) || fs.existsSync(this.encConfigPath)) {
        const userConfig = this.readConfig();
        if (global.__HUGO_AURA__.configInit) {
          config = userConfig;
          return userConfig;
        } else {
          config = deepMerge(userConfig, defaultConfig);
          console.log("[HugoAura / Config] Merged with user config");
          this.writeConfig(config);
        }
      }
    } catch (err) {
      console.error("[HugoAura / Config] Failed to load user config:", err);
      this.isConfigReadFailed = true;
      config = defaultConfig;
    }

    return config;
  }

  priv_getMacAddr() {
    const netInf = os.networkInterfaces();
    const realInfs = Object.keys(netInf).filter(
      (key) =>
        !key.includes("Pseudo") &&
        !key.includes("Loopback") &&
        !key.includes("Virtual") &&
        !key.includes("Tunnel") &&
        !key.includes("Cisco") &&
        !key.includes("VPN")
    );

    /**
     *
     * @param {string[]} infNames
     * @param {Record<string, any>} infObj
     * @returns
     */
    const getValidInfMac = (infNames, infObj) => {
      for (const name of infNames) {
        const target = infObj[name][0];
        const isValid = !target.internal && target.mac !== "00:00:00:00:00:00";
        if (isValid) {
          return target.mac;
        }
      }
      return null;
    };

    const rawInfMac = getValidInfMac(realInfs, netInf);
    const macAddr = rawInfMac
      ? rawInfMac.replace(/:/g, "").toUpperCase()
      : null;
    return macAddr;
  }

  /**
   *
   * @param {SHA256EncryptedPassword} password
   */
  async saveEncPassword(password) {
    let macAddr = this.priv_getMacAddr();
    let fallbackToStaticKey = false;

    if (!macAddr) {
      console.warn(
        "[HugoAura / Config / LMK] No valid network inf found, fallback to static key."
      );
      macAddr = Buffer.from(crypto.randomBytes(6))
        .toString("hex")
        .toUpperCase();
    }

    const randomSalt = crypto.randomBytes(CRYPTO_SETTINGS_AES.saltLength);
    const key = crypto.scryptSync(macAddr, randomSalt, 32);
    const iv = crypto.randomBytes(CRYPTO_SETTINGS_AES.ivLength);

    const cipherIns = crypto.createCipheriv(CRYPTO_SETTINGS_AES.mode, key, iv, {
      // @ts-expect-error
      authTagLength: CRYPTO_SETTINGS_AES.tagLength,
    });

    let encryptedPassword = cipherIns.update(password, "utf-8", "hex");
    encryptedPassword += cipherIns.final("hex");

    const authTagHex = cipherIns.getAuthTag().toString("hex");
    const ivHex = iv.toString("hex");
    const saltHex = randomSalt.toString("hex");

    await registryManager.createOrUpdateRegKey(
      LMAK_SETTINGS_BASE,
      "LMAK_Value",
      encryptedPassword,
      true
    );
    await registryManager.createOrUpdateRegKey(
      LMAK_SETTINGS_BASE,
      "LMAK_IV",
      ivHex,
      true
    );
    await registryManager.createOrUpdateRegKey(
      LMAK_SETTINGS_BASE,
      "LMAK_Salt",
      saltHex,
      true
    );
    await registryManager.createOrUpdateRegKey(
      LMAK_SETTINGS_BASE,
      "LMAK_AuthTag",
      authTagHex,
      true
    );

    if (fallbackToStaticKey) {
      await registryManager.createOrUpdateRegKey(
        LMAK_SETTINGS_BASE,
        "LMAK_FakeMac",
        macAddr,
        true
      );
    }

    return true;
  }

  retrieveEncPassword() {
    try {
      const authTagHex = registryManager.readRegKeySync(
        LMAK_SETTINGS_BASE,
        "LMAK_AuthTag",
        true
      )?.data;
      const ivHex = registryManager.readRegKeySync(
        LMAK_SETTINGS_BASE,
        "LMAK_IV",
        true
      )?.data;
      const saltHex = registryManager.readRegKeySync(
        LMAK_SETTINGS_BASE,
        "LMAK_Salt",
        true
      )?.data;
      const encPasswdHex = registryManager.readRegKeySync(
        LMAK_SETTINGS_BASE,
        "LMAK_Value",
        true
      )?.data;
      let isStaticKey = false;
      let macAddr = null;

      try {
        macAddr = registryManager.readRegKeySync(
          LMAK_SETTINGS_BASE,
          "LMAK_FakeMac",
          true
        )?.data;
        if (!macAddr) {
          isStaticKey = false;
        } else {
          isStaticKey = true;
        }
      } catch {
        isStaticKey = false;
      }

      if (!isStaticKey) {
        macAddr = this.priv_getMacAddr();

        if (!macAddr) {
          console.error(
            "[HugoAura / Config / ERROR] Failed to retrieve password from reg: MAC Address invalid."
          );
          return {
            success: false,
            data: null,
            error: new Error("Mac is null or undefined"),
          };
        }
      }

      if (!saltHex || !ivHex || !authTagHex || !encPasswdHex) {
        console.error(
          "[HugoAura / Config / ERROR] Failed to retrieve password from reg: Reg keys invalid."
        );
        return {
          success: false,
          data: null,
          error: new Error("Reg key invalid"),
        };
      }
      const salt = Buffer.from(saltHex, "hex");
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const encPasswd = Buffer.from(encPasswdHex, "utf-8").toString();

      const key = crypto.scryptSync(macAddr, salt, 32);
      const decipherIns = crypto.createDecipheriv(
        CRYPTO_SETTINGS_AES.mode,
        key,
        iv,
        {
          // @ts-expect-error
          authTagLength: CRYPTO_SETTINGS_AES.tagLength,
        }
      );

      decipherIns.setAuthTag(authTag);

      const result = Buffer.concat([
        decipherIns.update(encPasswd, "hex"),
        decipherIns.final(),
      ]).toString();

      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (e) {
      console.error(
        "[HugoAura / Config / ERROR] Unexpected error occurred while retrieving password from reg, error:",
        e
      );
      return {
        success: false,
        data: null,
        error: e,
      };
    }
  }

  async retrieveEncPasswordAsync() {
    try {
      const authTagHex = (
        await registryManager.readRegKey(
          LMAK_SETTINGS_BASE,
          "LMAK_AuthTag",
          true
        )
      ).data;
      const ivHex = (
        await registryManager.readRegKey(LMAK_SETTINGS_BASE, "LMAK_IV", true)
      ).data;
      const saltHex = (
        await registryManager.readRegKey(LMAK_SETTINGS_BASE, "LMAK_Salt", true)
      ).data;
      const encPasswdHex = (
        await registryManager.readRegKey(LMAK_SETTINGS_BASE, "LMAK_Value", true)
      ).data;
      let isStaticKey = false;
      let macAddr = null;

      try {
        macAddr = (
          await registryManager.readRegKey(
            LMAK_SETTINGS_BASE,
            "LMAK_FakeMac",
            true
          )
        ).data;
        if (!macAddr) {
          isStaticKey = false;
        } else {
          isStaticKey = true;
        }
      } catch {
        isStaticKey = false;
      }

      if (!isStaticKey) {
        macAddr = this.priv_getMacAddr();

        if (!macAddr) {
          console.error(
            "[HugoAura / Config / ERROR] Failed to retrieve password from reg: MAC Address invalid."
          );
          return {
            success: false,
            data: null,
            error: new Error("Mac is null or undefined"),
          };
        }
      }

      if (!saltHex || !ivHex || !authTagHex || !encPasswdHex) {
        console.error(
          "[HugoAura / Config / ERROR] Failed to retrieve password from reg: Reg keys invalid."
        );
        return {
          success: false,
          data: null,
          error: new Error("Reg key invalid"),
        };
      }
      const salt = Buffer.from(saltHex, "hex");
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const encPasswd = Buffer.from(encPasswdHex, "utf-8").toString();

      const key = crypto.scryptSync(macAddr, salt, 32);
      const decipherIns = crypto.createDecipheriv(
        CRYPTO_SETTINGS_AES.mode,
        key,
        iv,
        {
          // @ts-expect-error
          authTagLength: CRYPTO_SETTINGS_AES.tagLength,
        }
      );

      decipherIns.setAuthTag(authTag);

      const result = Buffer.concat([
        decipherIns.update(encPasswd, "hex"),
        decipherIns.final(),
      ]).toString();

      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (e) {
      console.error(
        "[HugoAura / Config / ERROR] Unexpected error occurred while retrieving password from reg, error:",
        e
      );
      return {
        success: false,
        data: null,
        error: e,
      };
    }
  }

  async clearEncPasswdRegKey() {
    await registryManager.delRegKey(LMAK_SETTINGS_BASE, null);
  }

  /**
   *
   * @param {Record<any, any>} configData
   * @param {SHA256EncryptedPassword} passwd
   */
  encryptConfig(configData, passwd) {
    registryManager.initRegistrySync();
    const salt = crypto.randomBytes(CRYPTO_SETTINGS_AES.saltLength);
    const key = crypto.pbkdf2Sync(
      passwd,
      salt,
      CRYPTO_SETTINGS_AES.keyIter,
      CRYPTO_SETTINGS_AES.keyLength,
      CRYPTO_SETTINGS_AES.hash
    );
    const iv = crypto.randomBytes(CRYPTO_SETTINGS_AES.ivLength);

    const cipherIns = crypto.createCipheriv(CRYPTO_SETTINGS_AES.mode, key, iv, {
      // @ts-expect-error
      authTagLength: CRYPTO_SETTINGS_AES.tagLength,
    });

    const stringifyConfigData = JSON.stringify(configData);
    let encryptedCfg = cipherIns.update(stringifyConfigData, "utf-8", "hex");
    encryptedCfg += cipherIns.final("hex");
    const authTag = cipherIns.getAuthTag();

    /** @type {EncryptedConfig} */
    const encConfigFinal = {};
    encConfigFinal.content = encryptedCfg;
    encConfigFinal.authTag = authTag.toString("base64");
    encConfigFinal.salt = salt.toString("base64");
    encConfigFinal.iv = iv.toString("base64");

    const base64EncConfig =
      CRYPTO_SETTINGS_AES.obfuscateStr +
      Buffer.from(JSON.stringify(encConfigFinal)).toString("base64");

    try {
      fs.writeFileSync(this.encConfigPath, base64EncConfig, "utf-8");
      try {
        fs.unlinkSync(this.configPath);
      } catch {
        console.debug("[HugoAura / Config] Dec config not exists, skipping...");
      }

      if (!this.useEncConfig) this.useEncConfig = true;
      return true;
    } catch (err) {
      console.error(
        "[HugoAura / Config] Failed to write encrypted config:",
        err
      );
      console.error(
        "[HugoAura / Config] Pending config data:",
        base64EncConfig
      );
      return false;
    }
  }

  /**
   *
   * @param {SHA256EncryptedPassword} passwd
   * @returns {{success: boolean, data: AuraConfig}}
   */
  decryptConfig(passwd) {
    try {
      const FAILED_RET = {
        success: false,
        data: {},
      };

      let base64EncConfig = null;

      try {
        if (!fs.existsSync(this.encConfigPath)) {
          return FAILED_RET;
        }
        base64EncConfig = fs.readFileSync(this.encConfigPath, "utf-8");
      } catch (err) {
        console.error(
          "[HugoAura / Config] Failed to read encrypted config:",
          err
        );
        return FAILED_RET;
      }

      if (base64EncConfig) {
        const strip64EncCfg = base64EncConfig.split(
          CRYPTO_SETTINGS_AES.obfuscateStr
        )[1];
        const encryptCfg = Buffer.from(strip64EncCfg, "base64").toString(
          "utf-8"
        );
        /** @type {null | EncryptedConfig} */
        let parsedEncCfg = null;
        try {
          parsedEncCfg = JSON.parse(encryptCfg);
        } catch (err) {
          console.error(
            "[HugoAura / Config] Failed to parse encrypted config:",
            err
          );
          console.error("[HugoAura / Config] Pending data:", encryptCfg);
        }
        if (parsedEncCfg === null) return FAILED_RET;

        const salt = Buffer.from(parsedEncCfg.salt, "base64");
        const iv = Buffer.from(parsedEncCfg.iv, "base64");

        const authTag = Buffer.from(parsedEncCfg.authTag, "base64");

        const key = crypto.pbkdf2Sync(
          passwd,
          salt,
          CRYPTO_SETTINGS_AES.keyIter,
          CRYPTO_SETTINGS_AES.keyLength,
          CRYPTO_SETTINGS_AES.hash
        );

        const decipherIns = crypto.createDecipheriv(
          CRYPTO_SETTINGS_AES.mode,
          key,
          iv,
          {
            // @ts-expect-error
            authTagLength: CRYPTO_SETTINGS_AES.tagLength,
          }
        );

        decipherIns.setAuthTag(authTag);

        const stringifyDecCfg = Buffer.concat([
          decipherIns.update(parsedEncCfg.content, "hex"),
          decipherIns.final(),
        ]).toString();

        /** @type {null | Record<any, any>} */
        let decConfig = null;
        try {
          decConfig = JSON.parse(stringifyDecCfg);
        } catch (err) {
          console.error(
            "[HugoAura / Config] Failed to parse decrypted config:",
            err
          );
          console.error("[HugoAura / Config] Pending data:", decConfig);
          return FAILED_RET;
        }
        if (decConfig === null) return FAILED_RET;

        // console.debug(decConfig);

        return {
          success: true,
          data: decConfig,
        };
      } else {
        console.error(
          "[HugoAura / Config] Unexpected error occurred while decrypting config: base64EncConfig is undefined"
        );
        return FAILED_RET;
      }
    } catch (e) {
      console.error(
        "[HugoAura / Config] Unexpected error occurred while decrypting config:",
        e
      );
      return {
        success: false,
        data: {},
      };
    }
  }

  /**
   *
   * @param {Record<any, any> | null} curConfig
   * @param {SHA256EncryptedPassword | undefined | null} passwd
   * @returns {Promise<{success: boolean}>}
   */
  async switchToDecConfig(curConfig, passwd = null) {
    let decConfig = null;
    if (!curConfig && passwd) {
      const getDecConfigResult = this.decryptConfig(passwd);
      if (
        !getDecConfigResult?.success ||
        !getDecConfigResult.data ||
        Object.keys(getDecConfigResult.data).length === 0
      ) {
        console.error(
          "[HugoAura / Config] Failed to switch to decrypted config: Error decrypting config"
        );
        return {
          success: false,
        };
      }
      decConfig = getDecConfigResult.data;
    }

    this.useEncConfig = false;
    await this.clearEncPasswdRegKey();
    // @ts-expect-error
    this.writeConfig(curConfig ? curConfig : decConfig);
    try {
      fs.unlinkSync(this.encConfigPath);
    } catch {
      console.debug("[HugoAura / Config] Enc config not exists, skipping...");
    }
    global.__HUGO_AURA_EVENT_BUS__.emit(
      "$aura.config.updateConfigEncSettings",
      false
    );
    if (this.side === "renderer") {
      global.ipcRenderer.invoke("$aura.config.setConfigEncSettings", {
        target: false,
      });
      global.ipcRenderer.invoke("$aura.config.dispatchConfigFromRenderer", {
        data: JSON.stringify(curConfig),
      });
    }
    return {
      success: true,
    };
  }
}

module.exports = ConfigManager;
