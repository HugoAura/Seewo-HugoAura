// @ts-check

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const childProc = require("child_process");

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
    this.configDir = path.join(os.homedir(), "Documents", "HugoAura");
    this.configPath = path.join(this.configDir, "config.json");
    this.encConfigPath = path.join(this.configDir, ".cache_2eafc8d0.dat"); // (雾
    /* ↑ 不使用 .tmp 扩展名, 不然容易真被清理了 */
    this.defaultConfigPath = path.join(__dirname, "default.json");
  }

  getHugoAuraConfigPath() {
    return path.dirname(this.configPath);
  }

  getConfigPath() {
    return this.configPath;
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

    if (!fs.existsSync(this.configPath)) {
      console.log("[HugoAura / Config] Creating default config file");
      const defaultConfig = this.getDefaultConfig();
      this.writeConfig(defaultConfig);
    }
  }

  readConfig() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      console.log("[HugoAura / Config] Successfully loaded config:", config);
      return config;
    } catch (err) {
      console.error("[HugoAura / Config] Failed to read config:", err);
      return this.getDefaultConfig();
    }
  }

  /**
   *
   * @param {Record<any, any>} config
   * @returns
   */
  writeConfig(config) {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        "utf8"
      );
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
      if (fs.existsSync(this.configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
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
      config = defaultConfig;
    }

    return config;
  }

  /**
   *
   * @param {Record<any, any>} configData
   * @param {string} passwd
   */
  encryptConfig(configData, passwd) {
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
      // fs.rmSync(this.configPath);

      const _hideFileProc = childProc.spawnSync(
        "cmd.exe",
        ["/c", "attrib", "+h", this.encConfigPath],
        {
          stdio: "inherit",
        }
      );
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
   * @param {string} passwd
   * @returns
   */
  decryptConfig(passwd) {
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
      const encryptCfg = Buffer.from(strip64EncCfg, "base64").toString("utf-8");
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

      let stringifyDecCfg = Buffer.concat([
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

      console.debug(decConfig);
    }
  }
}

module.exports = new ConfigManager();
