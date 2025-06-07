// @ts-check

const IPC_METHOD_BASE = "$aura.pls";

/**
 *
 * @param {PLSPush} parsedWsMsg
 * @returns
 */
const basicRouteHandler = (parsedWsMsg) => {
  const target = parsedWsMsg.type.split(".").slice(-1)[0];
  switch (target) {
    case "pushPlsInfo":
      if (global.__HUGO_AURA__.plsStats) {
        global.__HUGO_AURA__.plsStats.status = parsedWsMsg.data.status;
        global.__HUGO_AURA__.plsStats.version = parsedWsMsg.data.version;
      }

      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updatePlsStats`,
        global.__HUGO_AURA__.plsStats
      );

      console.debug(
        "[HugoAura / UI / PLS Routes / DEBUG] Updated plsStats basic info:",
        global.__HUGO_AURA__.plsStats
      );
      break;

    case "plsNotReadyError":
      if (global.__HUGO_AURA__.plsStats) {
        global.__HUGO_AURA__.plsStats.launched = true;
        global.__HUGO_AURA__.plsStats.connected = false;
        global.__HUGO_AURA__.plsStats.status = "notReady";
      }

      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updatePlsStats`,
        global.__HUGO_AURA__.plsStats
      );
      break;
    default:
      return false;
  }
  return true;
};

module.exports = { basicRouteHandler };
