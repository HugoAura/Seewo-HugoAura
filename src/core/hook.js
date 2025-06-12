// @ts-check

if (!global.__HUGO_AURA__) {
  const __HUGO_AURA__ = {
    hookedWindows: new Map(),
    configInit: false,
    central: () => {},
    ipcInit: false,
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
    baseUrl: "https://api.aura.vim.moe",
    plsUpdate: "/api/v1/getPLSLatestVersion",
    auraUpdate: "/api/v1/getAuraLatestVersion",
  };
  global.__HUGO_AURA_API__ = __HUGO_AURA_API__;
}

if (!global.__HUGO_AURA_CONFIG__) {
  global.__HUGO_AURA_CONFIG__ = {};
}

const MainProcessHooksManager = require("../aura/init/main/windowHooksManager");
const RendererHooksManager = require("../aura/init/rendererHook/uiHooksManager");
const EventBus = require("../aura/utils/eventBus");
const NetworkHook = require("../aura/init/rendererHook/networkHook");
const ConfigManager = require("../aura/init/shared/configManager");
const { buildIpcMain } = require("../aura/init/main/ipcHandler");

const { initLogger } = require("../aura/init/main/logger");

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
