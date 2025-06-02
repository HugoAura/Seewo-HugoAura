// @ts-check

if (!global.__HUGO_AURA__) {
  /**
   * @type {import("../aura/types/main/core").MainProcessGlobal}
   */
  const __HUGO_AURA__ = {
    hookedWindows: new Map(),
    hooks: new Map(),
    configInit: false,
    plsStats: null,
    plsSettings: null,
    plsRules: null,
  };
  global.__HUGO_AURA__ = __HUGO_AURA__;
}

if (!global.__HUGO_AURA_CONFIG__) {
  global.__HUGO_AURA_CONFIG__ = {};
}

const fs = require("fs");
const util = require("util");
const path = require("path");
const os = require("os");

const MainProcessHooksManager = require("../aura/init/main/windowHooksManager");
const RendererHooksManager = require("../aura/init/rendererHook/uiHooksManager");
const NetworkHook = require("../aura/init/rendererHook/networkHook");
const configManager = require("../aura/init/shared/configManager");
const { buildIpcMain } = require("../aura/init/main/ipcHandler");

/**
 *
 * @param {import("../aura/types/main/core").WindowName} windowName
 */
const initLogger = (windowName) => {
  const logDir = path.join(os.homedir(), "Documents", "HugoAura", "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(
    logDir,
    `main-${windowName}-${new Date().toISOString().replace(/:/g, "-")}.log`
  );
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  console.log = function (...args) {
    const msg = util.format("[LOG] ", ...args) + "\n";
    logStream.write(msg);
    originalConsole.log.apply(console, args);
  };

  console.error = function (...args) {
    const msg = util.format("[ERROR] ", ...args) + "\n";
    logStream.write(msg);
    originalConsole.error.apply(console, args);
  };

  console.warn = function (...args) {
    const msg = util.format("[WARN] ", ...args) + "\n";
    logStream.write(msg);
    originalConsole.warn.apply(console, args);
  };

  console.info = function (...args) {
    const msg = util.format("[INFO] ", ...args) + "\n";
    logStream.write(msg);
    originalConsole.info.apply(console, args);
  };

  console.debug = function (...args) {
    if (!process.argv.includes("--aura-debug")) return;
    const msg = util.format("[DEBUG] ", ...args) + "\n";
    logStream.write(msg);
    originalConsole.debug.apply(console, args);
  };

  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
  });

  console.log(
    "[HugoAura / Init / Logger] Logger initialized. Log file:",
    logFile
  );
};

/**
 *
 * @param {import("../aura/types/main/core").LauncherArgs} param0
 * @returns
 */
const launcher = ({ central, windowName, config }) => {
  process.stdout.isTTY = true;
  process.stderr.isTTY = true;

  /** @type {Electron} */
  const electron = central(1);
  const app = electron.app;
  if (!global.__HUGO_AURA__.central) global.__HUGO_AURA__.central = central;

  global.reloadApp = () => {
    app.relaunch({ args: process.argv.slice(1).concat(["--inspect 5858"]) });
    app.exit(0);
  };

  initLogger(windowName);

  console.log("[HugoAura / Loaded] Aura is loaded!");
  console.debug(`[HugoAura / Debug] curWindowName: ${windowName}`);

  configManager.ensureConfigExists();
  const loadedConfig = configManager.loadConfig();
  if (!global.__HUGO_AURA__.configInit) global.__HUGO_AURA__.configInit = true;

  global.__HUGO_AURA_CONFIG__ = loadedConfig;

  if (!global.__HUGO_AURA__.ipcInit) {
    buildIpcMain(electron);
    global.__HUGO_AURA__.ipcInit = true;
  }

  const mainProcessHooksManager = new MainProcessHooksManager();

  const _windowHooks = mainProcessHooksManager.loadHooks();

  const uiHooksManager = new RendererHooksManager();

  const uiHooks = uiHooksManager.loadHooks();

  if (loadedConfig.devTools && !config.canOpenDevTool) {
    config.canOpenDevTool = true;
  }

  const browserWindowCreatedListener = (_event, browserWindow) => {
    mainProcessHooksManager.initHookForWindow(
      windowName,
      central,
      app,
      browserWindow
    );
  };

  /**
   *
   * @param {Event} _event
   * @param {import("electron").WebContents} webContents
   */
  const webContentsCreatedListener = (_event, webContents) => {
    const hookConfig = uiHooks.get(windowName.split("_")[0]);

    const initNetworkHook = () => {
      const networkHook = new NetworkHook();
      networkHook.installHook(webContents.session, loadedConfig);

      console.debug(
        `[HugoAura / Init / Done / NetworkHook] Network Hook for ${windowName} installed.`
      );
    };

    initNetworkHook();

    if (hookConfig) {
      uiHooksManager.handleWindowHook(webContents, hookConfig, windowName);
    } else {
      console.log(
        `[HugoAura / Init / RDH] Window ${windowName} has no corresponding ui hooks, ignoring...`
      );
    }
  };

  app.once("browser-window-created", browserWindowCreatedListener);
  // @ts-expect-error
  // ↑ idk why
  app.once("web-contents-created", webContentsCreatedListener);

  return () => {
    app.removeListener("browser-window-created", browserWindowCreatedListener);
    // @ts-expect-error
    app.removeListener("web-contents-created", webContentsCreatedListener);
  };
};

module.exports = launcher;
