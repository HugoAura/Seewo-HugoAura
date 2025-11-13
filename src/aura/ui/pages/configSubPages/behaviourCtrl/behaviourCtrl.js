(() => {
  const REQUIRE_BASE =
    "../../aura/ui/pages/configSubPages/behaviourCtrl/settings";

  const {
    settingsRenderer,
  } = require(`${REQUIRE_BASE}/../../../../composables/settingsRenderer`);

  const { basicSettings } = require(`${REQUIRE_BASE}/basic`);
  const { deviceSecuritySettings } = require(`${REQUIRE_BASE}/deviceSecurity`);

  const {
    updateAikariSettingsFromLocal,
    updateAikariRulesFromLocal,
  } = require(`${REQUIRE_BASE}/../../../../composables/aikariConfigManager`);

  const initStatusPage = () => {
    global.__HUGO_AURA_LOADER__[
      "Aura.UI.Assistant.Config.BehaviourCtrl.AikariStatus"
    ].active = true;
  };

  const initBasicSettingsPage = () => {
    const basicSubPageEl = document.getElementById("basic-config-subpage");
    settingsRenderer(basicSubPageEl, basicSettings);
  };

  const initDeviceSecuritySettingsPage = () => {
    const deviceSecuritySubPageEl = document.getElementById(
      "security-config-subpage"
    );
    settingsRenderer(deviceSecuritySubPageEl, deviceSecuritySettings);
  };

  const renderSubPages = async () => {
    await updateAikariSettingsFromLocal();
    await updateAikariRulesFromLocal();

    initBasicSettingsPage();
    initDeviceSecuritySettingsPage();
  };

  const onMounted = () => {
    const rootEl = document.getElementById("acs-behaviour-control-el");
    initStatusPage();
    setTimeout(() => {
      rootEl.classList.remove("acs-behaviour-control-hidden");
      renderSubPages(); // 如果立即渲染子页面, 此时 plsRules 还未初始化, 会导致子页面 auraIf 失效
    }, 500);
  };

  onMounted();
})();
