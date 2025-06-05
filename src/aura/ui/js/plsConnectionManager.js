// @ts-check
(() => {
  if (!global.__HUGO_AURA__.plsStats)
    global.__HUGO_AURA__.plsStats = {
      installed: false,
      detached: false,
      connected: false,
      launched: false,
      status: "unknown",
      version: "未知",
      authToken: "",
    };

  const IPC_METHOD_BASE = "$aura.pls";
  const REQUIRE_BASE = "../../aura/ui";
  const __SCOPE = "desktopAssistant";

  const { pushMsgHandler } = require(`${REQUIRE_BASE}/pls/pushHandler`);

  /** @type {number} */
  let failedCounter = 0;
  /** @type {boolean} */
  let isErrorOccurred = false;

  const sendRetryStatusToMain = (/** @type {Boolean} */ status) => {
    global.ipcRenderer.invoke(`${IPC_METHOD_BASE}.post.updateRetryStatus`, {
      success: status,
    });
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
       * @param {import("electron").IpcRendererEvent} _evt
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

    const startConnPls = () => {
      createPlsConnection(updatedPlsStats.authToken, connectionResultCallback);
    };

    /*
    if (updatedPlsStats.detached && updatedPlsStats.installed) {
    */
    if (updatedPlsStats.installed) {
      startConnPls();
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

  onSetup();
})();
