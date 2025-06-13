// @ts-check
(() => {
  if (!global.__HUGO_AURA__.plsStats)
    global.__HUGO_AURA__.plsStats = {
      installed: false,
      detached: false,
      connected: false,
      launched: false,
      status: "dead",
      version: "未知",
      authToken: "",
    };

  const IPC_METHOD_BASE = "$aura.pls";
  const REQUIRE_BASE = "../../aura/ui";
  const __SCOPE = "desktopAssistant";

  const PLS_REG_PATH = "ProxyLayerServices";

  const { pushMsgHandler } = require(`${REQUIRE_BASE}/pls/pushHandler`);
  const RegistryManager = require(`${REQUIRE_BASE}/../init/shared/registryManager`);

  const registryManager = new RegistryManager();

  /** @type {number} */
  let failedCounter = 0;
  /** @type {boolean} */
  let isErrorOccurred = false;

  /** @type {number} */
  let plsPort = 22077;
  /** @type {"wss" | "ws"} */
  let plsProtocol = "wss";

  /** @type {boolean} */
  let isRetrying = false;

  /** @type {any} */
  let curSendListener = null;

  const sendRetryStatusToMain = (/** @type {Boolean} */ status) => {
    global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.post.updateRetryStatus`, {
      success: status,
    });
  };

  const calcFullAuthToken = (/** @type {string} */ authToken) => {
    const trustToken = window._ACCEPT_DATA.getData("deviceId");
    const conjToken = authToken + "AuraXAuth" + trustToken + "NeverEnds";
    const crypto = require("crypto");
    return crypto.createHash("sha512").update(conjToken).digest("hex");
  };

  const clearIpcListener = () => {
    if (curSendListener) {
      global.ipcRenderer.off(
        `${IPC_METHOD_BASE}.ws.post.onReqSendMsg`,
        curSendListener
      );
      curSendListener = null;
    }
  };

  const startConnPlsProc = async (updatedPlsStats) => {
    const authTokenRet = await registryManager.readRegKey(
      PLS_REG_PATH,
      "AuthToken",
      true
    );
    if (authTokenRet.success) {
      updatedPlsStats.authToken = authTokenRet.data;
      // @ts-expect-error
      global.__HUGO_AURA__.plsStats.authToken = authTokenRet.data;
    } else {
      sendRetryStatusToMain(false);
      return;
    }
    const portRet = await registryManager.readRegKey(
      PLS_REG_PATH,
      "WsPort",
      true
    );
    if (portRet.success) {
      try {
        plsPort = Number(portRet.data);
      } catch {
        console.warn(
          `[HugoAura / UI / PLS Manager] Invalid PLS port: ${portRet.data}`
        );
      }
    }
    const protoRet = await registryManager.readRegKey(
      PLS_REG_PATH,
      "Protocol",
      true
    );
    if (protoRet.success) {
      plsProtocol = protoRet.data;
    }
    createPlsConnection(updatedPlsStats.authToken, connectionResultCallback);
  };

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
      sendRetryStatusToMain(false);
      return;
    }

    const fullAuthToken = calcFullAuthToken(authToken);

    /** @type {WebSocket} */
    const plsWs = new WebSocket(
      `${plsProtocol}://pls.hugoaura.local:${plsPort}/?auth=${fullAuthToken}`
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
      clearIpcListener();
      if (global.__HUGO_AURA__.plsStats) {
        if (global.__HUGO_AURA__.plsStats.status === "notReady") {
          if (isRetrying) {
            sendRetryStatusToMain(false);
            return;
          }
          console.warn(
            "[HugoAura / UI / PLS Manager / WARN] PLS not ready, try again after 10s..."
          );
          isRetrying = true;
          setTimeout(async () => {
            isRetrying = false;
            startConnPlsProc(global.__HUGO_AURA__.plsStats);
          }, 10000);
          sendRetryStatusToMain(false);
          return;
        }
      }

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
    clearIpcListener();
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
  const connectionResultCallback = (result, wsObj) => {
    if (!global.__HUGO_AURA__.plsStats) return; // 😅 typescript

    global.__HUGO_AURA__.plsStats.launched = result;
    global.__HUGO_AURA__.plsStats.connected = result;
    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updatePlsStats`,
      global.__HUGO_AURA__.plsStats
    );
    if (!result) {
      console.error(
        `[HugoAura / UI / PLS Manager / ERROR] Failed connecting to PLS WebSocket server, retrying ...`
      );
      createPlsConnection(
        global.__HUGO_AURA__.plsStats.authToken,
        connectionResultCallback
      );
      return;
    }

    sendRetryStatusToMain(true);

    global.__HUGO_AURA__.plsWs = wsObj;
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
    if (!global.__HUGO_AURA__.plsStats) return;

    if (isRetrying) {
      sendRetryStatusToMain(false);
      return;
    }

    failedCounter = 0;
    isErrorOccurred = false;

    const curPlsStats = await global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.getPlsStats`
    );
    let updatedPlsStats = {};
    if (
      (curPlsStats === null || !curPlsStats.success) &&
      curPlsStats.status !== "downloading"
    ) {
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
      await global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.getPlsBinExists`)
    ).data.isExists;
    updatedPlsStats.installed = isPlsFolderExists;
    // @ts-expect-error
    global.__HUGO_AURA__.plsStats = updatedPlsStats;
    console.debug(
      "[HugoAura / UI / PLS Manager / DEBUG] Updated early plsStats:",
      global.__HUGO_AURA__.plsStats
    );

    global.ipcRenderer.invoke(
      `${IPC_METHOD_BASE}.updatePlsStats`,
      updatedPlsStats
    );

    /*
    if (updatedPlsStats.detached && updatedPlsStats.installed) {
    */
    if (updatedPlsStats.installed) {
      await startConnPlsProc(updatedPlsStats);
    } else {
      sendRetryStatusToMain(false);
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
      global.ipcRenderer = require("electron").global.ipcRenderer;
    }

    initPlsConnection();

    global.ipcRenderer.on(
      `${IPC_METHOD_BASE}.retryPlsConnect`,
      (_evt, _arg) => {
        if (!global.__HUGO_AURA__.plsStats) return;
        if (global.__HUGO_AURA__.plsStats.connected) return;
        initPlsConnection();
      }
    );
  };

  setTimeout(() => {
    onSetup();
  }, 1500);
})();
