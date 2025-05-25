// @ts-check

const IPC_METHOD_BASE = "$aura.pls";
const REQUIRE_BASE = "../../aura/ui";
const __SCOPE = "desktopAssistant";

const { pushMsgHandler } = require(`${REQUIRE_BASE}/pls/pushHandler`);

/** @type {number} */
let failedCounter = 0;
/** @type {boolean} */
let isErrorOccurred = false;

/**
 *
 * @param {string} authToken
 * @param {any} callback
 * @returns
 */
const createPlsConnection = (authToken, callback) => {
  if (failedCounter >= 3) {
    console.error(
      `[HugoAura / UI / PLS Manager / ERROR] Failed connecting to PLS WebSocket server, please check the status of PLS process.`
    );
    return;
  }

  /** @type {WebSocket} */
  const plsWs = new WebSocket(
    `wss://pls.hugoaura.local:22077/?auth=${authToken}`
  );

  plsWs.onopen = () => {
    callback(true, plsWs);
  };

  plsWs.onerror = () => {
    isErrorOccurred = true;
    failedCounter += 1;
    callback(false, plsWs);
  };

  plsWs.onclose = () => {
    console.error(
      "[HugoAura / UI / PLS Manager / ERROR] WebSocket connection closed."
    );
    if (isErrorOccurred) return;
    failedCounter += 1;
    callback(false, plsWs);
  };
};

/**
 *
 * @param {WebSocket} wsObj
 */
const registerSendReqListener = (wsObj) => {
  global.ipcRenderer.on(
    `${IPC_METHOD_BASE}.ws.post.onReqSendMsg`,
    /**
     *
     * @param {Event} _evt
     * @param {any} arg
     */
    (_evt, arg) => {
      wsObj.send(JSON.stringify(arg));
    }
  );
};

/**
 *
 * @param {boolean} result
 * @param {WebSocket} wsObj
 * @returns
 */
const connectionResultCallback = (result, wsObj) => {
  global.__HUGO_AURA_GLOBAL__.plsStats.launched = result;
  global.__HUGO_AURA_GLOBAL__.plsStats.connected = result;
  global.ipcRenderer.invoke(
    `${IPC_METHOD_BASE}.updatePlsStats`,
    global.__HUGO_AURA_GLOBAL__.plsStats
  );
  if (!result) {
    console.error(
      `[HugoAura / UI / PLS Manager / ERROR] Failed connecting to PLS WebSocket server, retrying ...`
    );
    createPlsConnection(
      global.__HUGO_AURA_GLOBAL__.plsStats.authToken,
      connectionResultCallback
    );
    return;
  }
  global.__HUGO_AURA_GLOBAL__.plsWs = wsObj;
  registerSendReqListener(wsObj);
  wsObj.onmessage = plsPushHandler;
};

/**
 *
 * @param {MessageEvent} event
 */
const plsPushHandler = (event) => {
  try {
    /** @type {Record<any, any>} */
    const parsedEvent = JSON.parse(event.data);
    console.debug(
      "[HugoAura / UI / PLS Manager / DEBUG] Received new server message: "
    );
    if (!parsedEvent.eventId) {
      // Push
      pushMsgHandler(parsedEvent);
    } else {
      // Not push
      global.ipcRenderer.send(
        `${IPC_METHOD_BASE}.ws.broadcastMessageRecv`,
        parsedEvent
      );
    }
  } catch {
    console.error(
      "[HugoAura / UI / PLS Manager / ERROR] Failed to resolve server message: ",
      event.data
    );
  }
};

const initPlsConnection = async () => {
  failedCounter = 0;
  isErrorOccurred = false;

  const curPlsStats = await global.ipcRenderer.invoke(
    `${IPC_METHOD_BASE}.getPlsStats`
  );
  let updatedPlsStats = {};
  if (curPlsStats === null || !curPlsStats.success) {
    updatedPlsStats = {
      installed: false,
      launched: false,
      detached: false,
      connected: false,
      version: "未知",
      status: "dead",
      authToken: "66ccff0d000721114514191981023333",
    };
  } else {
    updatedPlsStats = curPlsStats.data;
  }

  const isPlsFolderExists = (
    await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getPlsFolderExists`)
  ).data.isExists;
  updatedPlsStats.installed = isPlsFolderExists;

  global.__HUGO_AURA_GLOBAL__.plsStats = updatedPlsStats;
  console.debug(
    "[HugoAura / UI / PLS Manager / DEBUG] Updated plsStats:",
    global.__HUGO_AURA_GLOBAL__.plsStats
  );

  global.ipcRenderer.invoke(
    `${IPC_METHOD_BASE}.updatePlsStats`,
    updatedPlsStats
  );

  const startConnPls = () => {
    createPlsConnection(updatedPlsStats.authToken, connectionResultCallback);
  };

  if (updatedPlsStats.detached && updatedPlsStats.installed) {
    startConnPls();
  }

  global.ipcRenderer.on(`${IPC_METHOD_BASE}.post.onPlsLaunched`, (_event) => {
    setTimeout(() => {
      startConnPls();
    }, 5000);
  });
};

const onSetup = () => {
  if (!global.global.ipcRenderer) {
    // @ts-ignore
    global.global.ipcRenderer = require("electron").global.ipcRenderer;
  }

  initPlsConnection();
};

(() => {
  onSetup();
})();
