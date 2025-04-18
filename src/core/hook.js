if (!global.__HUGO_AURA__) {
  global.__HUGO_AURA__ = {
    hookedWindows: new Map(),
    hooks: null,
    configInit: false,
  };
}

const fs = require("fs");
const util = require("util");
const path = require("path");
const os = require("os");

const HooksManager = require("../aura/init/rendererHook/hooksManager");
const NetworkHook = require("../aura/init/rendererHook/networkHook");
const configManager = require("../aura/init/shared/configManager");
const { buildIpcMain } = require("../aura/init/main/ipcHandler");

const initLogger = () => {
  const logDir = path.join(os.homedir(), "Documents", "HugoAura", "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(
    logDir,
    `main-process-${new Date().toISOString().replace(/:/g, "-")}.log`
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

  console.log("Logger initialized. Log file:", logFile);
};

module.exports = function ({ central, windowName, config }) {
  process.stdout.isTTY = true;
  process.stderr.isTTY = true;

  const electron = central(1);
  const app = electron.app;
  if (!global.__HUGO_AURA__.central) global.__HUGO_AURA__.central = central;

  global.reloadApp = () => {
    app.relaunch({ args: process.argv.slice(1).concat(["--inspect 5858"]) });
    app.exit(0);
  };

  initLogger();

  console.log("[HugoAura / Loaded] Aura is loaded!");

  if (!global.__HUGO_AURA__.ipcInit) {
    buildIpcMain(electron);
    global.__HUGO_AURA__.ipcInit = true;
  }

  const hooksManager = new HooksManager();

  configManager.ensureConfigExists();
  const loadedConfig = configManager.loadConfig();
  if (!global.__HUGO_AURA__.configInit) global.__HUGO_AURA__.configInit = true;

  const hooks = hooksManager.loadHooks();

  if (loadedConfig.devTools && !config.canOpenDevTool) {
    config.canOpenDevTool = true;
  }

  const webContentsCreatedListener = (_event, webContents) => {
    const hookConfig = hooks.get(windowName);

    const initNetworkHook = () => {
      const networkHook = new NetworkHook();
      networkHook.installHook(webContents.session, loadedConfig);

      console.debug(
        `[HugoAura / Init / Done / NetworkHook] Network Hook for ${windowName} installed.`
      );
    };

    initNetworkHook();

    if (hookConfig) {
      hooksManager.handleWindowHook(webContents, hookConfig, windowName);
    } else {
      console.debug(
        `[HugoAura / Init] Window ${windowName} has no corresponding hook, ignoring...`
      );
    }
  };

  app.once("web-contents-created", webContentsCreatedListener);

  return () => {
    app.removeListener("web-contents-created", webContentsCreatedListener);
  };
};
