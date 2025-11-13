// @ts-check

const IPC_METHOD_BASE = "$aura.aikari";

// TODO: REFACTOR
/**
 *
 * @param {AikariPush} parsedWsMsg
 * @returns
 */
const basicRouteHandler = (parsedWsMsg) => {
  const target = parsedWsMsg.type.split(".").slice(-1)[0];
  switch (target) {
    case "pushPlsInfo":
      if (global.__HUGO_AURA__.aikariStats) {
        global.__HUGO_AURA__.aikariStats.status = parsedWsMsg.data.status;
        global.__HUGO_AURA__.aikariStats.version = parsedWsMsg.data.version;
      }

      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updateAikariStatus`,
        global.__HUGO_AURA__.aikariStats
      );

      console.debug(
        "[HugoAura / UI / Aikari Routes / DEBUG] Updated aikariStats basic info:",
        global.__HUGO_AURA__.aikariStats
      );
      break;

    case "plsNotReadyError":
      if (global.__HUGO_AURA__.aikariStats) {
        global.__HUGO_AURA__.aikariStats.launched = true;
        global.__HUGO_AURA__.aikariStats.connected = false;
        global.__HUGO_AURA__.aikariStats.status = "notReady";
      }

      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updateAikariStatus`,
        global.__HUGO_AURA__.aikariStats
      );
      break;
    default:
      return false;
  }
  return true;
};

module.exports = { basicRouteHandler };
