/// Rewrite rules basic config section begins ///

const type = "localResource";

const urlPattern = "floatWindow.js";

/// End of the rewrite rules basic config section ///

let ruleFn = (originalContent, ruleConfig) => {
  if (ruleConfig.enabled) {
    originalContent = `(() => { window.close() });`;
  }
  return originalContent;
};

module.exports = {
  type,
  urlPattern,
  ruleFn,
};
