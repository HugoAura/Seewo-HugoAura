// @ts-check
(() => {
  if (!global.__HUGO_AURA__)
    global.__HUGO_AURA__ = {
      configInit: true,
      auraDir: "",
      version: "",
    };

  if (!global.__HUGO_AURA__.aikariStats)
    global.__HUGO_AURA__.aikariStats = {
      installed: false,
      detached: false,
      connected: false,
      launched: false,
      status: "dead",
      version: "unknown",
      authToken: "",
    };

  const IPC_METHOD_BASE = "$aura.aikari";
  const REQUIRE_BASE = "../../..";
  const __SCOPE = "auraWsKeepAlive";

  const AIKARI_RPC_CONFIG_REG_PATH = "Aikari\\RPC";

  const { pushMsgHandler } = require(`${REQUIRE_BASE}/aikari/pushHandler`);
  const {
    onAikariConnectedMsgSeq,
  } = require(`${REQUIRE_BASE}/aikari/onConnectedSeq`);
  const RegistryManager = require(`${REQUIRE_BASE}/../init/shared/registryManager`);

  const registryManager = new RegistryManager();

  /** @type {number} */
  let failedCounter = 0;
  /** @type {boolean} */
  let isErrorOccurred = false;

  /** @type {number} */
  let aikariPort = 22077;
  /** @type {"wss" | "ws"} */
  let aikariProtocol = "wss";

  /** @type {boolean} */
  let isRetrying = false;

  /** @type {any} */
  let curSendListener = null;
  let curSendGetListener = null;

  const sendRetryStatusToMain = (
    /** @type {Boolean} */ status,
    /** @type {string?} */ message = null
  ) => {
    global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.post.updateRetryStatus`, {
      success: status,
      message: message,
    });
  };

  const clearReqSendIpcListener = () => {
    if (curSendListener) {
      global.ipcRenderer.off(
        `${IPC_METHOD_BASE}.ws.post.onReqSendMsg`,
        curSendListener
      );
      curSendListener = null;
    }
  };

  const clearSendGetIpcListener = () => {
    if (curSendGetListener) {
      global.ipcRenderer.off(
        `${IPC_METHOD_BASE}.ws.post.onSendGetMsg`,
        curSendListener
      );
      curSendGetListener = null;
    }
  };

  const getAuthToken = async () => {
    const authTokenRet = await registryManager.readRegKey(
      AIKARI_RPC_CONFIG_REG_PATH,
      "authToken",
      true
    );
    return authTokenRet;
  };

  const startConnAikariProc = async (updatedAikariStats) => {
    let authTokenTries = 0;
    let GET_AUTH_TOKEN_MAX_TRIES = 3;
    let getAuthTokenSuccess = false;
    while (authTokenTries < GET_AUTH_TOKEN_MAX_TRIES) {
      const authTokenRet = await getAuthToken();
      if (authTokenRet.success) {
        updatedAikariStats.authToken = authTokenRet.data;
        // @ts-expect-error
        global.__HUGO_AURA__.aikariStats.authToken = authTokenRet.data;
        getAuthTokenSuccess = true;
        break;
      } else {
        await window.__HUGO_AURA_GLOBAL__.utils.sleep(1000);
        authTokenTries += 1;
      }
    }
    if (!getAuthTokenSuccess) {
      sendRetryStatusToMain(false, "E_AUTH_TOKEN_GET_FAILED");
      return;
    }
    const portRet = await registryManager.readRegKey(
      AIKARI_RPC_CONFIG_REG_PATH,
      "wsPort",
      true
    );
    if (portRet.success) {
      try {
        aikariPort = Number(portRet.data);
      } catch {
        console.warn(
          `[HugoAura / UI / Aikari Conn Manager] Invalid Aikari port: ${portRet.data}`
        );
      }
    }
    // TODO: wsHost
    createAikariConnection(
      updatedAikariStats.authToken,
      connectionResultCallback
    );
  };

  /**
   *
   * @param {string} authToken
   * @param {any} callback
   * @returns
   */
  const createAikariConnection = (authToken, callback) => {
    if (failedCounter >= 3) {
      console.error(
        `[HugoAura / UI / Aikari Conn Manager / ERROR] Failed connecting to Aikari WebSocket server, please check the status of Aikari process.`
      );
      sendRetryStatusToMain(false, "E_WS_CONN_FAILED_AFT_MULTIPLE_TRIES");
      return;
    }

    /** @type {WebSocket} */
    const aikariWs = new WebSocket(
      `${aikariProtocol}://aikari.hugoaura.local:${aikariPort}/?auth=${authToken}`
    );

    aikariWs.onopen = () => {
      callback(true, aikariWs);
    };

    aikariWs.onerror = () => {
      isErrorOccurred = true;
      failedCounter += 1;
      callback(false, aikariWs);
    };

    aikariWs.onclose = () => {
      clearReqSendIpcListener();
      if (global.__HUGO_AURA__.aikariStats) {
        if (global.__HUGO_AURA__.aikariStats.status === "notReady") {
          if (isRetrying) {
            sendRetryStatusToMain(false, "E_IS_LOADING");
            return;
          }
          console.warn(
            "[HugoAura / UI / Aikari Conn Manager / WARN] Aikari not ready, try again after 10s..."
          );
          isRetrying = true;
          setTimeout(async () => {
            isRetrying = false;
            startConnAikariProc(global.__HUGO_AURA__.aikariStats);
          }, 10000);
          sendRetryStatusToMain(false, "E_START_WAIT_FOR_LOADING");
          return;
        }

        if (global.__HUGO_AURA__.aikariStats.launched === false) {
          console.warn(
            "[HugoAura / UI / Aikari Conn Manager / WARN] Aikari stopped, closing WebSocket connection."
          );
          return;
        }
      }

      console.error(
        "[HugoAura / UI / Aikari Conn Manager / ERROR] WebSocket connection closed."
      );
      if (isErrorOccurred) return;
      failedCounter += 1;
      callback(false, aikariWs);
    };
  };

  /**
   *
   * @param {WebSocket} wsObj
   */
  const registerSendReqListener = (wsObj) => {
    clearReqSendIpcListener();
    /**
     *
     * @param {import("electron").IpcRendererEvent} _evt
     * @param {any} arg
     */
    curSendListener = (_evt, arg) => {
      wsObj.send(JSON.stringify(arg));
    };
    global.ipcRenderer.on(
      `${IPC_METHOD_BASE}.ws.post.onReqSendMsg`,
      curSendListener
    );
  };

  /**
   *
   * @param {boolean} result
   * @param {WebSocket} wsObj
   * @returns
   */
  const connectionResultCallback = async (result, wsObj) => {
    if (!global.__HUGO_AURA__.aikariStats) return; // 😅 typescript

    global.__HUGO_AURA__.aikariStats.launched = result;
    global.__HUGO_AURA__.aikariStats.connected = result;
    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updateAikariStatus`,
      global.__HUGO_AURA__.aikariStats
    );
    if (!result) {
      console.error(
        `[HugoAura / UI / Aikari Conn Manager / ERROR] Failed connecting to Aikari WebSocket server, retrying ...`
      );
      createAikariConnection(
        global.__HUGO_AURA__.aikariStats.authToken,
        connectionResultCallback
      );
      return;
    }
    wsObj.onmessage = aikariPushHandler;

    registerSendReqListener(wsObj);

    global.__HUGO_AURA__.aikariWs = wsObj;

    global.__HUGO_AURA__.aikariStats = await onAikariConnectedMsgSeq({
      curAikariStates: global.__HUGO_AURA__.aikariStats,
      wsObj,
    });
    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updateAikariStatus`,
      global.__HUGO_AURA__.aikariStats
    );

    sendRetryStatusToMain(true, "SUCCESS");
  };

  /**
   *
   * @param {MessageEvent} event
   */
  const aikariPushHandler = (event) => {
    try {
      /** @type {Record<any, any>} */
      const parsedEvent = JSON.parse(event.data);
      console.debug(
        "[HugoAura / UI / Aikari Conn Manager / DEBUG] Received new server message: "
      );
      if (!parsedEvent.eventId || parsedEvent.eventId === "N/A") {
        // Push
        pushMsgHandler(parsedEvent);
      } else {
        // Not push
        global.ipcRenderer.send(
          `${IPC_METHOD_BASE}.ws.broadcastMessageRecv`,
          parsedEvent
        );

        const msgRecvEvent = new CustomEvent("onAikariMessageRecv", {
          detail: parsedEvent,
        });
        document.dispatchEvent(msgRecvEvent);
      }
    } catch {
      console.error(
        "[HugoAura / UI / Aikari Conn Manager / ERROR] Failed to resolve server message: ",
        event.data
      );
    }
  };

  const initAikariWebSocketConnection = async () => {
    if (!global.__HUGO_AURA__.aikariStats) return;

    if (isRetrying) {
      sendRetryStatusToMain(false, "E_RETRY_PENDING");
      return;
    }

    failedCounter = 0;
    isErrorOccurred = false;

    const curAikariStats = await global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.getAikariStatus`
    );
    let updatedAikariStats = {};
    if (
      (curAikariStats === null || !curAikariStats.success) &&
      curAikariStats.status !== "downloading" &&
      curAikariStats.status !== "installing"
    ) {
      updatedAikariStats = {
        installed: false,
        launched: false,
        detached: false,
        connected: false,
        version: "unknown",
        status: "dead",
        authToken: "",
      };
    } else {
      updatedAikariStats = curAikariStats.data;
    }

    const isAikariBinExists = (
      await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getIfAikariBinExists`)
    ).data.isExists;
    updatedAikariStats.installed = isAikariBinExists;
    // @ts-expect-error
    global.__HUGO_AURA__.aikariStats = updatedAikariStats;
    console.debug(
      "[HugoAura / UI / Aikari Conn Manager / DEBUG] Updated early aikariStats:",
      global.__HUGO_AURA__.aikariStats
    );

    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updateAikariStatus`,
      updatedAikariStats
    );

    /*
    if (updatedPlsStats.detached && updatedPlsStats.installed) {
    */
    if (updatedAikariStats.installed || updatedAikariStats.detached) {
      await startConnAikariProc(updatedAikariStats);
    } else {
      sendRetryStatusToMain(false, "E_NOT_INSTALLED");
    }

    /*
    global.ipcRenderer.on(`${IPC_METHOD_BASE}.post.onPlsLaunched`, (_event) => {
      setTimeout(() => {
        startConnPls();
      }, 5000);
    });
    */
  };

  const onSetup = () => {
    if (!global.ipcRenderer) {
      // @ts-ignore
      global.ipcRenderer = require("electron").ipcRenderer;
    }

    initAikariWebSocketConnection();

    global.ipcRenderer.on(
      `${IPC_METHOD_BASE}.retryAikariConnect`,
      (_evt, _arg) => {
        if (!global.__HUGO_AURA__.aikariStats) return;
        if (global.__HUGO_AURA__.aikariStats.connected) return;
        initAikariWebSocketConnection();
      }
    );

    global.ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.onForceReloadRequested`,
      (_evt, _arg) => {
        window.location.reload();
      }
    );

    global.ipcRenderer.on(
      `${IPC_METHOD_BASE}.post.aikariStopped`,
      (_evt, _arg) => {
        if (!global.__HUGO_AURA__.aikariStats) return;
        global.__HUGO_AURA__.aikariStats.launched = false;
        global.__HUGO_AURA__.aikariStats.connected = false;
        global.__HUGO_AURA__.aikariStats.version = "unknown";
      }
    );
  };

  setTimeout(() => {
    onSetup();
  }, 1500);
})();
