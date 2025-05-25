// @ts-check

const IPC_METHOD_BASE = "$aura.pls";

/**
 *
 * @param {PLSPush} parsedWsMsg
 * @returns
 */
const configRouteHandler = (parsedWsMsg) => {
  const target = parsedWsMsg.type.split(".").slice(-1)[0];
  switch (target) {
    case "pushBasicConfig":
      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updatePlsSettings`,
        parsedWsMsg.data
      );
      break;
    case "pushRuleSettings":
      global.ipcRenderer.invoke(
        `${IPC_METHOD_BASE}.updatePlsRules`,
        parsedWsMsg.data
      );
      break;
    default:
      return false;
  }

  return true;
};

module.exports = { configRouteHandler };
