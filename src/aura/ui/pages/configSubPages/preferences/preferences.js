(() => {
  const pathBase = "../../aura/ui/pages/configSubPages/preferences/settings";

  const {
    settingsRenderer,
  } = require("../../aura/ui/composables/settingsRenderer");
  const { auraSettings } = require(`${pathBase}/aura`);

  const initAuraSubPage = () => {
    const auraSettingsSubPageEl = document.getElementById("aura-subpage");
    settingsRenderer(auraSettingsSubPageEl, auraSettings);
  };
  const onMounted = () => {
    initAuraSubPage();

    const rootEl = document.getElementById("acs-preferences-root-el");
    setTimeout(() => {
      rootEl.classList.remove("acs-preferences-root-hidden");
    }, 500);
  };

  onMounted();
})();
