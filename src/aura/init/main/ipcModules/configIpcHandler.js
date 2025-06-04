// @ts-check

const __SCOPE = "main";

/**
 *
 * @param {import("../../../types/main/electron").AuraIPCMain} ipcMain
 */
const applyConfigIpcHandler = (ipcMain) => {
  const methodBase = "$aura.config";

  const mainEventBus = global.__HUGO_AURA_EVENT_BUS__;

  const ConfigManager = require("../../shared/configManager");
  const configManager = global.__HUGO_AURA_CONFIG_MGR__
    ? global.__HUGO_AURA_CONFIG_MGR__
    : new ConfigManager();

  ipcMain.on(`${methodBase}.refreshMainConfig`, (_event) => {
    mainEventBus.emit("$aura.config.refreshConfig");
  });

  ipcMain.handle(
    `${methodBase}.setConfigEncSettings`,
    (
      /** @type {import("electron").IpcMainInvokeEvent} */ _event,
      /** @type {{ target: boolean }} */ arg
    ) => {
      mainEventBus.emit("$aura.config.updateConfigEncSettings", arg.target);
      return {
        success: true,
      };
    }
  );

  ipcMain.on(`${methodBase}.getConfigFromMainSync`, (event, _arg) => {
    if (
      global.__HUGO_AURA_CONFIG__ &&
      Object.keys(global.__HUGO_AURA_CONFIG__).length !== 0
    ) {
      event.returnValue = {
        success: true,
        data: global.__HUGO_AURA_CONFIG__,
      };
    } else {
      console.warn(
        "[HugoAura / Main / IPC / Config / WARN] Global config var not found!"
      );
      event.returnValue = {
        success: false,
        data: {},
      };
    }
  });

  ipcMain.handle(
    `${methodBase}.dispatchConfigFromRenderer`,
    (_event, /** @type {{data: string, writeConfig?: boolean}} */ arg) => {
      const parsedData = JSON.parse(arg.data);

      global.__HUGO_AURA_CONFIG__ = parsedData;

      if (arg.writeConfig) {
        const result = configManager.writeConfig(parsedData);
        if (!result) {
          return {
            success: false,
          };
        }
      }

      return {
        success: true,
      };
    }
  );
};

module.exports = { applyConfigIpcHandler };
