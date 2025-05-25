// @ts-check

/**
 * @type {import("../../types/render/uiHook").UIHookConfig}
 */
const def = {
  targets: {},
  globalStyles: ["ui/css/global.css"],
  globalJS: ["ui/js/global.js", "ui/js/plsConnectionManager.js"],
  onLoaded: `
    console.log('[HugoAura / UI / Hooks / Desktop Assistant] Page loaded.');
  `,
};

module.exports = def;
