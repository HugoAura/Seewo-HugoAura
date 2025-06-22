global.__HUGO_AURA_UI_FUNCTIONS__.headerIcon = {
  showAuraConfig: () => {
    if (global.__HUGO_AURA_LOADER__["Aura.UI.Assistant.Config"].active) return;
    global.__HUGO_AURA_LOADER__["Aura.UI.Assistant.Config"].active = true;
  },
};

(() => {
  let clickCounter = 0;
  let clickTimeout = null;

  const onMounted = (revive = false) => {
    if (
      !global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod.showEntryIcon &&
      !revive
    ) {
      const rootEl = document.getElementById("root");
      rootEl.classList.add("aura-header-icon-hidden");
    }

    if (
      global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
        .fallbackAccessMethods.hotkey &&
      !revive
    ) {
      document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === "A") {
          global.__HUGO_AURA_UI_FUNCTIONS__.headerIcon.showAuraConfig();
        }
      });
    }

    if (
      global.__HUGO_AURA_CONFIG__.auraSettings.uiAccessMethod
        .fallbackAccessMethods.touch
    ) {
      const mesModelEl = document.getElementsByClassName(
        "index__mes-modal__2hRouc6M"
      )[0];
      const verEl = mesModelEl.children[0];
      verEl.onclick = () => {
        clickCounter += 1;
        if (clickCounter >= 7) {
          global.__HUGO_AURA_UI_FUNCTIONS__.headerIcon.showAuraConfig();
          clickCounter = 0;
          if (clickTimeout) {
            clearTimeout(clickTimeout);
          }
        }
        clickTimeout = setTimeout(() => {
          clickCounter = 0;
        }, 10000);
      };
    }
  };

  onMounted();

  document.addEventListener(
    "onLoaderElRevive:Aura.UI.Assistant.HeaderEntry",
    () => {
      onMounted(true);
    }
  );
})();
