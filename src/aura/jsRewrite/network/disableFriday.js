/// Rewrite rules basic config section begins ///

const type = "localResource";

const urlPattern = "preLoad.js";

const beginOfHook = "window._faq=window._faq||[],";

const endOfHook = ",p=document,";

/// End of the rewrite rules basic config section ///

let hookedContentFunc = () => {
  f =
    "https://monday.cvte.local/agent/sdk/js/v2/genshin.js?_appId=" +
    window.webConfig.fridayAppId;
};

hookedContentFunc = hookedContentFunc.toString().replace(";", "");

module.exports = {
  type,
  urlPattern,
  beginOfHook,
  endOfHook,
  hookedContentFunc,
};
