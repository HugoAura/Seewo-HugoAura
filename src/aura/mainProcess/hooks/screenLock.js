const hookFn = (central, appIns, browserWindowIns) => {
  const __config = global.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"];

  const removeKeyboardHook = () => {
    const { dllForHookBoard } = central(29);

    setTimeout(() => {
      dllForHookBoard.UnHookKeyBoard();
    }, 1000);
  };

  if (__config.disableKeyboardHook) {
    removeKeyboardHook();
  }
};

module.exports = { hookFunc: hookFn };
