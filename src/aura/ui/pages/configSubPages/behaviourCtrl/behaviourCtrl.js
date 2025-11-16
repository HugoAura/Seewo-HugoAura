(() => {
  const REQUIRE_BASE =
    "../../aura/ui/pages/configSubPages/behaviourCtrl/settings";

  const {
    settingsRenderer,
  } = require(`${REQUIRE_BASE}/../../../../composables/settingsRenderer`);

  const { basicSettings } = require(`${REQUIRE_BASE}/basic`);
  const { deviceInfoPostSettings } = require(`${REQUIRE_BASE}/deviceInfoPost`);

  const {
    updateAikariSettingsFromLocal,
    updateAikariRulesFromLocal,
  } = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

  const fileSystemRawCmds = require(`${REQUIRE_BASE}/../../../../composables/rawCmdExec/fs`);

  const initStatusPage = () => {
    global.__HUGO_AURA_LOADER__[
      "Aura.UI.Assistant.Config.BehaviourCtrl.AikariStatus"
    ].active = true;
  };

  const preInitUIReactives = async () => {
    if (!global.__HUGO_AURA_UI_REACTIVES__.subConfig)
      global.__HUGO_AURA_UI_REACTIVES__.subConfig = {};
    if (!global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared)
      global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared = {};

    global.__HUGO_AURA_UI_REACTIVES__.subConfig.behaviourCtrlShared.diskCaptions =
      await fileSystemRawCmds.getDiskCaptions();
  };

  const initBasicSettingsPage = () => {
    const basicSubPageEl = document.getElementById("basic-config-subpage");
    settingsRenderer(basicSubPageEl, basicSettings);
  };

  const initDeviceInfoPostSettingsPage = () => {
    const deviceInfoPostSubPageEl = document.getElementById(
      "device-info-post-config-subpage"
    );
    settingsRenderer(deviceInfoPostSubPageEl, deviceInfoPostSettings);
  };

  const renderSubPages = async () => {
    await updateAikariSettingsFromLocal();
    await updateAikariRulesFromLocal();

    initBasicSettingsPage();
    initDeviceInfoPostSettingsPage();
  };

  const onMounted = () => {
    const rootEl = document.getElementById("acs-behaviour-control-el");
    preInitUIReactives();
    initStatusPage();
    setTimeout(() => {
      rootEl.classList.remove("acs-behaviour-control-hidden");
      renderSubPages();
    }, 500);
  };

  onMounted();
})();
