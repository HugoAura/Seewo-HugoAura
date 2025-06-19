// @ts-check

(() => {
  const applyHideSettings = () => {
    if (global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.autoHide) {
      const minimizeBtnEl = document.getElementsByClassName(
        "index__button2__2mhwC3oY"
      )[0].children[0];
      // @ts-expect-error
      minimizeBtnEl.click();
    } else if (global.__HUGO_AURA_CONFIG__.ssa.ux.easiAssistant.notDisplay) {
      const rootEl = document.getElementById("root");
      // @ts-expect-error
      rootEl.style["display"] = "none";
    }
  };

  const onMounted = () => {
    applyHideSettings();
  };

  onMounted();
})();
