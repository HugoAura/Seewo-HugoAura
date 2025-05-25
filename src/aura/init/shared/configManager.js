const fs = require('fs');
const path = require('path');
const os = require('os');

const deepMerge = (target, source) => {
  const result = JSON.parse(JSON.stringify(target));

  if (!source || typeof source !== 'object') {
    return {};
  }

  const keysToDelete = [];

  Object.keys(result).forEach((key) => {
    if (!(key in source)) {
      keysToDelete.push(key);
    } else if (
      typeof result[key] === 'object' &&
      result[key] !== null &&
      typeof source[key] === 'object' &&
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
    this.configPath = path.join(
      os.homedir(),
      'Documents',
      'HugoAura',
      'config.json'
    );
    this.defaultConfigPath = path.join(__dirname, 'default.json');
  }

  getHugoAuraConfigPath() {
    return path.dirname(this.configPath);
  }

  getConfigPath() {
    return this.configPath;
  }

  getDefaultConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.defaultConfigPath, 'utf8'));
    } catch (err) {
      console.warn(
        '[HugoAura / Config] No default config found, using empty config'
      );
      return { rewrite: {} };
    }
  }

  ensureConfigExists() {
    if (global.__HUGO_AURA__.configInit) return;
    const hugoAuraPath = this.getHugoAuraConfigPath();
    if (!fs.existsSync(hugoAuraPath)) {
      console.log('[HugoAura / Config] Creating HugoAura directory');
      fs.mkdirSync(hugoAuraPath, { recursive: true });
    }

    if (!fs.existsSync(this.configPath)) {
      console.log('[HugoAura / Config] Creating default config file');
      const defaultConfig = this.getDefaultConfig();
      this.writeConfig(defaultConfig);
    }
  }

  readConfig() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      console.log('[HugoAura / Config] Successfully loaded config:', config);
      return config;
    } catch (err) {
      console.error('[HugoAura / Config] Failed to read config:', err);
      return this.getDefaultConfig();
    }
  }

  writeConfig(config) {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf8'
      );
      return true;
    } catch (err) {
      console.error('[HugoAura / Config] Failed to write config:', err);
      return false;
    }
  }

  loadConfig() {
    let defaultConfig = this.getDefaultConfig();
    let config = {};
    try {
      if (fs.existsSync(this.configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        if (global.__HUGO_AURA__.configInit) {
          config = userConfig;
          return userConfig;
        } else {
          config = deepMerge(userConfig, defaultConfig);
          console.log('[HugoAura / Config] Merged with user config');
          this.writeConfig(config);
        }
      }
    } catch (err) {
      console.error('[HugoAura / Config] Failed to load user config:', err);
      config = defaultConfig;
    }

    return config;
  }
}

module.exports = new ConfigManager();
