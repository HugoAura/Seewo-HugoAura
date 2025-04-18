const buildIpcMain = (electron) => {
  const { app, ipcMain } = electron;

  ipcMain.handle("$aura.base.restartApplication", async () => {
    app.relaunch();
    app.exit(0);
  });
};

module.exports = { buildIpcMain };
