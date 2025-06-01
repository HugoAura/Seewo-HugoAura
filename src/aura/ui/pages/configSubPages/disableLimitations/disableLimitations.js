(() => {
  const pathBase =
    "../../aura/ui/pages/configSubPages/disableLimitations/settings";

  const {
    settingsRenderer,
  } = require("../../aura/ui/composables/settingsRenderer");
  const { auraSettings } = require(`${pathBase}/aura`);
  const { authSettings } = require(`${pathBase}/auth`);
  const { banAuditSettings } = require(`${pathBase}/audit`);

  const initAuraSubPage = () => {
    const auraSettingsSubPageEl = document.getElementById("aura-subpage");
    settingsRenderer(auraSettingsSubPageEl, auraSettings);
  };

  const initAuthSubPage = () => {
    const authSubPageEl = document.getElementById("auth-subpage");
    settingsRenderer(authSubPageEl, authSettings);
  };

  const initBanAuditSubPage = () => {
    const banAuditSubPageEl = document.getElementById("disable-audit-subpage");
    settingsRenderer(banAuditSubPageEl, banAuditSettings);
  };

  const onMounted = () => {
    initAuraSubPage();
    initAuthSubPage();
    initBanAuditSubPage();

    const rootEl = document.getElementById("acs-disable-limit-root-el");
    setTimeout(() => {
      rootEl.classList.remove("acs-disable-limit-root-hidden");
    }, 500);
  };

  onMounted();
})();
