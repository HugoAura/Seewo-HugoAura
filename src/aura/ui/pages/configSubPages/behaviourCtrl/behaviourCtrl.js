(() => {
  const REQUIRE_BASE =
    "../../aura/ui/pages/configSubPages/behaviourCtrl/settings";

  const {
    settingsRenderer,
  } = require(`${REQUIRE_BASE}/../../../../composables/settingsRenderer`);

  const { basicSettings } = require(`${REQUIRE_BASE}/basic`);

  const {
    updatePlsSettingsFromLocal,
    updatePlsRulesFromLocal,
  } = require(`${REQUIRE_BASE}/../../../../composables/plsConfigManager`);

  const initStatusPage = () => {
    global.__HUGO_AURA_LOADER__[
      "Aura.UI.Assistant.Config.BehaviourCtrl.PlsStatus"
    ].active = true;
  };

  const initBasicSettingsPage = () => {
    const basicSubPageEl = document.getElementById("basic-config-subpage");
    settingsRenderer(basicSubPageEl, basicSettings);
  };

  const renderSubPages = async () => {
    await updatePlsSettingsFromLocal();
    await updatePlsRulesFromLocal();

    initBasicSettingsPage();
  };

  const onMounted = () => {
    const rootEl = document.getElementById("acs-behaviour-control-el");
    initStatusPage();
    renderSubPages();
    setTimeout(() => {
      rootEl.classList.remove("acs-behaviour-control-hidden");
    }, 500);
  };

  onMounted();
})();
