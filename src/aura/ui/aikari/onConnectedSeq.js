// @ts-check

const { genRandomHex } = require("../../utils/crypto");

const IPC_METHOD_BASE = "$aura.aikari";

/** @type {Map<string, any>} */
const wsGetCallbacks = new Map();

const actions = {
  getAikariVersion: async (originalAikariStates, wsObj) => {
    const eventId = genRandomHex();
    wsObj.send(
      JSON.stringify({
        module: "launcher",
        eventId: eventId,
        method: "basic.props.getVersion",
        data: {},
      })
    );
    const promise = new Promise((resolve) => {
      wsGetCallbacks.set(eventId, resolve);
    });
    const data = await promise;
    if (data.success) {
      originalAikariStates.version = data.data.version;
      console.debug(
        "[HugoAura / UI / Aikari OCMS] Updated Aikari version info: " +
          data.data.version
      );
    }
  },
  getAikariLauncherConfig: async (wsObj) => {
    const eventId = genRandomHex();
    wsObj.send(
      JSON.stringify({
        module: "launcher",
        eventId,
        method: "config.actions.getConfig",
        data: {},
      })
    );
    const promise = new Promise((resolve) => {
      wsGetCallbacks.set(eventId, resolve);
    });
    const data = await promise;
    if (data.success) {
      console.debug(
        "[HugoAura / UI / Aikari OCMS] Received Aikari launcher config: ",
        data
      );
      return data.data;
    } else {
      return null;
    }
  },
  getAikariPLSRules: async (wsObj) => {
    const eventId = genRandomHex();
    wsObj.send(
      JSON.stringify({
        module: "pls",
        eventId,
        method: "config.rules.getConfig",
      })
    );
    const promise = new Promise((resolve) => {
      wsGetCallbacks.set(eventId, resolve);
    });
    const data = await promise;
    if (data.success) {
      console.debug(
        "[HugoAura / UI / Aikari OCMS] Received Aikari PLS rules: ",
        data
      );
      return data.data;
    } else {
      return null;
    }
  },
};

const onAikariConnectedMsgSeq = async ({ curAikariStates, wsObj }) => {
  const updatedAikariStates = { ...curAikariStates };
  const onMsgRecvListener = (data) => {
    if (wsGetCallbacks.has(data.detail.eventId)) {
      wsGetCallbacks.get(data.detail.eventId)(data.detail);
    }
  };
  document.addEventListener("onAikariMessageRecv", onMsgRecvListener);
  // Get Aikari Version
  await actions.getAikariVersion(updatedAikariStates, wsObj);
  // Get Aikari Launcher Config
  const aikariLauncherConfig = await actions.getAikariLauncherConfig(wsObj);
  if (aikariLauncherConfig) {
    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updateAikariSettings`,
      aikariLauncherConfig
    );
  }
  // Get Aikari PLS Rules
  const aikariPLSRules = await actions.getAikariPLSRules(wsObj);
  if (aikariPLSRules) {
    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updateAikariRules`,
      aikariPLSRules
    );
  }

  return updatedAikariStates;
};

module.exports = { onAikariConnectedMsgSeq };
