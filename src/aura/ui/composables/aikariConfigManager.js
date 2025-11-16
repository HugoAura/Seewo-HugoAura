// @ts-check

const __SCOPE = "assistant / rendererCommon";

const IPC_METHOD_BASE = "$aura.aikari";

const updateAikariStatusFromLocal = async () => {
  const aikariStatus = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getAikariStatus`)
  ).data;
  global.__HUGO_AURA__.aikariStats = aikariStatus;
  return aikariStatus;
};

const updateAikariSettingsFromLocal = async () => {
  const aikariSettings = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getAikariSettings`)
  ).data;
  global.__HUGO_AURA__.aikariSettings = aikariSettings;
  return aikariSettings;
};

const updateAikariRulesFromLocal = async () => {
  const aikariRules = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getAikariRules`)
  ).data;
  global.__HUGO_AURA__.aikariRules = aikariRules;
  return aikariRules;
};

const { genRandomHex } = require("../../utils/crypto");

/**
 *
 * @param {string} configKey
 * @param {any} configValue
 */
const updateAikariConfigToRemote = async (
  configKey,
  configValue,
  module = "launcher",
  writeToDisk = true
) => {
  const configLevels = configKey.split(".");

  const aikariConfigUpdateEvent = new CustomEvent("onAikariConfigUpdate", {
    detail: {
      path: configLevels,
      value: configValue,
    },
  });
  document.dispatchEvent(aikariConfigUpdateEvent);
  const settingsEntries = document.getElementsByClassName(
    "aura-settings-entry"
  );
  if (settingsEntries.length > 0) {
    Array.from(settingsEntries).forEach((entry) => {
      entry.dispatchEvent(aikariConfigUpdateEvent);
    });
  }

  /**
   * @type {ClientAikariRequest}
   */
  const data = {
    method: "config.actions.updateConfig",
    data: {
      key: configKey,
      value: configValue,
      write: writeToDisk,
    },
    eventId: genRandomHex(), // 不用 crypto, 因为会带来不必要的性能开销
    module: module,
  };

  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.ws.sendWsMessage`, data);
  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.syncAikariConfig`, {
    basic: global.__HUGO_AURA__.aikariSettings,
    rules: global.__HUGO_AURA__.aikariRules,
  });
};

// [!] Will be deprecated
const updateAikariPLSRulesToRemote = async (
  configKey,
  configValue,
  affiliated,
  writeToDisk = true
) => {
  const configLevels = configKey.split(".");

  const aikariRuleConfigUpdateEvent = new CustomEvent("onAikariConfigUpdate", {
    detail: {
      path: configLevels,
      value: configValue,
    },
  });
  document.dispatchEvent(aikariRuleConfigUpdateEvent);
  const settingsEntries = document.getElementsByClassName(
    "aura-settings-entry"
  );
  if (settingsEntries.length > 0) {
    Array.from(settingsEntries).forEach((entry) => {
      entry.dispatchEvent(aikariRuleConfigUpdateEvent);
    });
  }

  /**
   * @type {ClientAikariRequest}
   */
  const data = {
    method: "config.rules.updateConfig",
    data: {
      key: configKey,
      value: configValue,
      write: writeToDisk,
      affiliated,
    },
    eventId: genRandomHex(),
    module: "pls",
  };

  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.ws.sendWsMessage`, data);
  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.syncAikariConfig`, {
    basic: global.__HUGO_AURA__.aikariSettings,
    rules: global.__HUGO_AURA__.aikariRules,
  });
};

module.exports = {
  updateAikariRulesFromLocal,
  updateAikariStatusFromLocal,
  updateAikariSettingsFromLocal,
  updateAikariConfigToRemote,
  updateAikariPLSRulesToRemote,
};
