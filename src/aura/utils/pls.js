// @ts-check

/**
 * @param {Electron} electron
 */
const createWsWindow = (electron) => {
  const path = require("path");
  const { BrowserWindow } = electron;
  const window = new BrowserWindow({
    width: 0,
    height: 0,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  window.setIgnoreMouseEvents(true);
  window.loadFile(
    path.join(
      __dirname,
      "..",
      "ui",
      "pages",
      "windows",
      "auraWsKeepAlive",
      "index.html"
    )
  );

  return window;
};

module.exports = { createWsWindow };
