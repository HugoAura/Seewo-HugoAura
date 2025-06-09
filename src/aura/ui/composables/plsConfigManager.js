// @ts-check

const __SCOPE = "assistant / rendererCommon";

const IPC_METHOD_BASE = "$aura.pls";

const updatePlsStatusFromLocal = async () => {
  const plsStatus = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getPlsStats`)
  ).data;
  global.__HUGO_AURA__.plsStats = plsStatus;
  return plsStatus;
};

const updatePlsSettingsFromLocal = async () => {
  const plsSettings = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getPlsSettings`)
  ).data;
  global.__HUGO_AURA__.plsSettings = plsSettings;
  return plsSettings;
};

const updatePlsRulesFromLocal = async () => {
  const plsRules = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getPlsRules`)
  ).data;
  global.__HUGO_AURA__.plsRules = plsRules;
  return plsRules;
};

const { genRandomHex } = require("../../utils/crypto");

/**
 *
 * @param {string} configKey
 * @param {any} configValue
 */
const updatePlsConfigToRemote = async (configKey, configValue) => {
  const configLevels = configKey.split(".");
  /** @type {Record<any, any>} */
  // @ts-expect-error
  let localUpdateTarget =
    configLevels[0] === "ruleSettings"
      ? global.__HUGO_AURA__.plsRules
      : global.__HUGO_AURA__.plsSettings;
  for (const level of configLevels.slice(0, -1)) {
    localUpdateTarget = localUpdateTarget[level];
  }
  localUpdateTarget[configLevels.slice(-1)[0]] = configValue;

  const plsConfigUpdateEvent = new CustomEvent("onPLSConfigUpdate", {
    detail: {
      path: configLevels,
      value: configValue,
    },
  });
  document.dispatchEvent(plsConfigUpdateEvent);

  /**
   * @type {ClientPLSRequest}
   */
  const data = {
    method: "config.action.updateConfig",
    data: {
      key: configKey,
      value: configValue,
    },
    eventId: genRandomHex(), // 不用 crypto, 因为会带来不必要的性能开销
  };

  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.ws.sendWsMessage`, data);
  global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.syncPlsConfig`, {
    basic: global.__HUGO_AURA__.plsSettings,
    rules: global.__HUGO_AURA__.plsRules,
  });
};

module.exports = {
  updatePlsRulesFromLocal,
  updatePlsStatusFromLocal,
  updatePlsSettingsFromLocal,
  updatePlsConfigToRemote,
};
