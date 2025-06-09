// @ts-check

/**
 * @type {import("../../types/render/uiHook").UIHookConfig}
 */
const def = {
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
      childs: {
        DisableLimitations: {
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
        BehaviourCtrl: {
          active: false,
          pageURI: "ui/pages/configSubPages/behaviourCtrl/behaviourCtrl.html",
          pageScript: "ui/pages/configSubPages/behaviourCtrl/behaviourCtrl.js",
          pageSelector: ".aura-config-page-subpage-container",
          selectorMode: "appendChild",
          pageCSS: "ui/pages/configSubPages/behaviourCtrl/behaviourCtrl.css",
          childs: {
            PlsStatus: {
              active: false,
              pageURI: "ui/pages/configSubPages/behaviourCtrl/plsStatus.html",
              pageScript: "ui/pages/configSubPages/behaviourCtrl/plsStatus.js",
              pageSelector: "#status-subpage",
              selectorMode: "appendChild",
              pageCSS: "ui/pages/configSubPages/behaviourCtrl/plsStatus.css",
            },
            DeviceSecurity: {
              childs: {
                FreezeOverridePreview: {
                  active: false,
                  pageURI:
                    "ui/pages/configSubPages/behaviourCtrl/settings/previews/freezeOverridePreview/freezeOverridePreview.html",
                  pageScript:
                    "ui/pages/configSubPages/behaviourCtrl/settings/previews/freezeOverridePreview/freezeOverridePreview.js",
                  pageSelector: "#freezeInfoReportOverridePreviewContainer",
                  selectorMode: "appendChild",
                  pageCSS:
                    "ui/pages/configSubPages/behaviourCtrl/settings/previews/freezeOverridePreview/freezeOverridePreview.css",
                },
              },
            },
          },
        },
        Preferences: {
          active: false,
          pageURI: "ui/pages/configSubPages/preferences/preferences.html",
          pageScript: "ui/pages/configSubPages/preferences/preferences.js",
          pageSelector: ".aura-config-page-subpage-container",
          selectorMode: "appendChild",
          pageCSS: "ui/pages/configSubPages/preferences/preferences.css",
        },
      },
    },
  },
  globalStyles: [
    "ui/css/global.css",
    "ui/css/assistant.css",
    "ui/css/form.css",
    "ui/layui/css/layui.css",
    "ui/bootstrap/bootstrap.min.css",
  ],
  globalJS: [
    "ui/js/global.js",
    "ui/js/plsListener.js",
    "ui/bootstrap/bootstrap.bundle.min.js",
  ],
  onLoaded: `
    console.log('[HugoAura / UI / Hooks / Assistant] Page loaded.');
  `,
};

module.exports = def;
