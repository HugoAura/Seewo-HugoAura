(() => {
  /* Util: Sleep */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* Util: BootStrap Tooltip Ctrl */
  let tooltipTriggerCache = null;
  const refreshBsTooltip = () => {
    if (tooltipTriggerCache) {
      [...tooltipTriggerCache].map((el) =>
        bootstrap.Tooltip.getInstance(el).disable()
      );
    }

    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerCache = tooltipTriggerList;
    [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  };

  if (!window.__HUGO_AURA_GLOBAL__) window.__HUGO_AURA_GLOBAL__ = {};

  window.__HUGO_AURA_GLOBAL__.utils = {
    sleep,
    refreshBsTooltip,
  };
})();
