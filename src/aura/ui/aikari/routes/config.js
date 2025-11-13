// @ts-check

const IPC_METHOD_BASE = "$aura.aikari";

/**
 *
 * @param {AikariPush} parsedWsMsg
 * @returns
 */
const configRouteHandler = (parsedWsMsg) => {
  const target = parsedWsMsg.type.split(".").slice(-1)[0];
  switch (target) {
    case "pushBasicConfig":
      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updateAikariSettings`,
        parsedWsMsg.data
      );
      break;
    case "pushRuleSettings":
      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updateAikariRules`,
        parsedWsMsg.data
      );
      break;
    default:
      return false;
  }

  return true;
};

module.exports = { configRouteHandler };
