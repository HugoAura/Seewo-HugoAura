(() => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!window.__HUGO_AURA_GLOBAL__) window.__HUGO_AURA_GLOBAL__ = {};

  window.__HUGO_AURA_GLOBAL__.utils = {
    sleep,
  };
})();
