// @ts-check

if (!global.__HUGO_AURA__) {
  const __HUGO_AURA__ = {
    hookedWindows: new Map(),
    configInit: false,
    central: () => {},
    ipcInit: false,
    auraDir: "",
    plsStats: null,
    plsSettings: null,
    plsRules: null,
    uiHooks: new Map(),
    windowHooks: new Map(),
    version: require("./preload").__AURA_VERSION__,
  };
  global.__HUGO_AURA__ = __HUGO_AURA__;
}

if (!global.__HUGO_AURA_API__) {
  /** @type {import("../aura/types/shared/global").GlobalHugoAuraApiInfo} */
  const __HUGO_AURA_API__ = {
    domains: [
      "https://api-aura-projekts.delta.ooo",
      "https://api-aura.asaka.site",
      "https://api.hugoaura.dpdns.org",
      "https://api-aura-projekts.minorice.moe",
      "https://api.aura.vim.moe",
    ],
    plsUpdate: "/api/getPLSLatestVersion",
    auraUpdate: "/api/getAuraLatestVersion",
  };
  global.__HUGO_AURA_API__ = __HUGO_AURA_API__;
}

if (!global.__HUGO_AURA_CONFIG__) {
  global.__HUGO_AURA_CONFIG__ = {};
}

const path = require("path");
const os = require("os");

const MainProcessHooksManager = require("../aura/init/main/windowHooksManager");
const RendererHooksManager = require("../aura/init/rendererHook/uiHooksManager");
const EventBus = require("../aura/utils/eventBus");
const NetworkHook = require("../aura/init/rendererHook/networkHook");
const ConfigManager = require("../aura/init/shared/configManager");
const RegistryManager = require("../aura/init/shared/registryManager");
const { buildIpcMain } = require("../aura/init/main/ipcHandler");
const plsUtils = require("../aura/utils/pls");

const { initLogger } = require("../aura/init/main/logger");

const getUserDocumentsDirPath = () => {
  const registryManager = new RegistryManager();
  const pathInfo = registryManager.readRegKeySync(
    '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders"',
    "Personal",
    false,
    true,
    /REG_EXPAND_SZ\s+(.+)/
  );
  if (pathInfo.success && pathInfo.data) {
    const resolvedPath = pathInfo.data.replace(
      /%([^%]+)%/g,
      (match, varName) => {
        return process.env[varName] || match;
      }
    );

    return resolvedPath;
  } else {
    console.error(
      "[HugoAura / Init / Logger] Failed to get the path of documents dir, using default val."
    );
    return path.join(os.homedir(), "Documents");
  }
};

/**
 *
 * @param {import("../aura/types/main/core").LauncherArgs} param0
 * @returns
 */
const launcher = ({ central, windowName, config }) => {
  // >>> Init STD <<< //
  process.stdout.isTTY = true;
  process.stderr.isTTY = true;

  // >>> Basic Config <<< //
  /** @type {Electron} */
  const electron = central(1);
  const app = electron.app;
  if (!global.__HUGO_AURA__.central) global.__HUGO_AURA__.central = central;

  global.reloadApp = () => {
    app.relaunch({ args: process.argv.slice(1).concat(["--inspect 5858"]) });
    app.exit(0);
  };

  global.__HUGO_AURA__.auraDir = path.join(
    getUserDocumentsDirPath(),
    "HugoAura"
  );

  // >>> Init Logger <<< //
  initLogger(windowName);

  console.log("[HugoAura / Loaded] Aura is loaded!");
  console.debug(`[HugoAura / Debug] curWindowName: ${windowName}`);

  // >>> Init EventBus <<< //
  if (!global.__HUGO_AURA_EVENT_BUS__)
    global.__HUGO_AURA_EVENT_BUS__ = new EventBus();

  // >>> Init Config <<< //
  const configManager = new ConfigManager();
  configManager.side = "main";
  configManager.migrateOldConfigFile();
  configManager.ensureConfigExists();
  const loadedConfig = configManager.loadConfig();
  if (!global.__HUGO_AURA__.configInit) global.__HUGO_AURA__.configInit = true;
  if (!global.__HUGO_AURA_CONFIG_MGR__)
    global.__HUGO_AURA_CONFIG_MGR__ = configManager;

  global.__HUGO_AURA_CONFIG__ = loadedConfig;

  global.__HUGO_AURA_EVENT_BUS__.on("$aura.config.refreshConfig", () => {
    global.__HUGO_AURA_CONFIG__ = configManager.loadConfig();
  });

  // >>> Init IPC Main <<< //
  if (!global.__HUGO_AURA__.ipcInit) {
    buildIpcMain(electron);
    global.__HUGO_AURA__.ipcInit = true;
  }

  // >>> Init Main Process Hooks <<< //
  const mainProcessHooksManager = new MainProcessHooksManager();

  const _windowHooks = mainProcessHooksManager.loadHooks();

  // >>> Init Renderer Process Hooks <<< //
  const uiHooksManager = new RendererHooksManager();

  const uiHooks = uiHooksManager.loadHooks();

  // >>> Activate DevTools <<< //
  if (loadedConfig.devTools && !config.canOpenDevTool) {
    config.canOpenDevTool = true;
  }

  // >>> Create WebSocket KeepAlive Window <<< //
  if (!global.__HUGO_AURA__.hookedWindows?.has("auraWsKeepAlive")) {
    const wsKaWin = plsUtils.createWsWindow(electron);
    // @ts-expect-error
    global.__HUGO_AURA__.hookedWindows.set("auraWsKeepAlive", wsKaWin);
  }

  // >>> Listeners <<< //

  /**
   *
   * @param {any} _event
   * @param {import("electron").BrowserWindow} browserWindow
   */
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
   * @param {any} _event
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
  app.once("web-contents-created", webContentsCreatedListener);

  return () => {
    app.removeListener("browser-window-created", browserWindowCreatedListener);
    app.removeListener("web-contents-created", webContentsCreatedListener);
  };
};

module.exports = launcher;
