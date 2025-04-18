module.exports = {
  targets: {
    "Aura.UI.Assistant.HeaderEntry": {
      active: true,
      pageURI: "ui/pages/headerIcon/headerIcon.html",
      pageScript: "ui/pages/headerIcon/headerIcon.js",
      pageSelector: ".index__feedback__2XvUK2qe",
      selectorMode: "insertAfter",
      pageCSS: "ui/pages/headerIcon/headerIcon.css",
      revive: true,
    },
    "Aura.UI.Assistant.Config": {
      active: false,
      pageURI: "ui/pages/config/config.html",
      pageScript: "ui/pages/config/config.js",
      pageSelector: "#root",
      selectorMode: "appendChild",
      pageCSS: "ui/pages/config/config.css",
    },
    "Aura.UI.Assistant.Config.DisableLimitations": {
      active: false,
      pageURI:
        "ui/pages/configSubPages/disableLimitations/disableLimitations.html",
      pageScript:
        "ui/pages/configSubPages/disableLimitations/disableLimitations.js",
      pageSelector: ".aura-config-page-subpage-container",
      selectorMode: "appendChild",
      pageCSS:
        "ui/pages/configSubPages/disableLimitations/disableLimitations.css",
    },
  },
  globalStyles: [
    "ui/css/global.css",
    "ui/css/assistant.css",
    "ui/css/form.css",
    "ui/layui/css/layui.css",
    "ui/bootstrap/bootstrap.min.css",
  ],
  globalJS: ["ui/js/global.js", "ui/bootstrap/bootstrap.bundle.min.js"],
  onLoaded: `
    console.log('[HugoAura / UI / Hooks / Assistant] Page loaded.');
  `,
};
