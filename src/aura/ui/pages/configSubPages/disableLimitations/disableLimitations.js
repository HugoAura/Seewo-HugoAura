(() => {
  const pathBase =
    "../../aura/ui/pages/configSubPages/disableLimitations/settings";

  const {
    settingsRenderer,
  } = require("../../aura/ui/composables/settingsRenderer");
  const { authSettings } = require(`${pathBase}/auth`);
  const { banAuditSettings } = require(`${pathBase}/audit`);
  const { uxAndAppearanceSettings } = require(`${pathBase}/uxAppearance`);

  const initAuthSubPage = () => {
    const authSubPageEl = document.getElementById("auth-subpage");
    settingsRenderer(authSubPageEl, authSettings);
  };

  const initBanAuditSubPage = () => {
    const banAuditSubPageEl = document.getElementById("disable-audit-subpage");
    settingsRenderer(banAuditSubPageEl, banAuditSettings);
  };

  const initUxAndAppearanceSubPage = () => {
    const uxAndAppearancePageEl = document.getElementById(
      "appearance-ctl-subpage"
    );
    settingsRenderer(uxAndAppearancePageEl, uxAndAppearanceSettings);
  };

  const onMounted = () => {
    initAuthSubPage();
    initBanAuditSubPage();
    initUxAndAppearanceSubPage();

    const rootEl = document.getElementById("acs-disable-limit-root-el");
    setTimeout(() => {
      rootEl.classList.remove("acs-disable-limit-root-hidden");
    }, 500);
  };

  onMounted();
})();
