const childProc = require("child_process");

const fileSystemRawCmds = {
  getDiskCaptions: async () => {
    const waitForCmd = new Promise((resolve) => {
      childProc.exec(
        "wmic logicaldisk get caption",
        (error, stdout, stderr) => {
          if (error) {
            console.error(
              `[HugoAura / UI / Composables / Raw CMD / FS] Failed to exec wmic getCaption: ${error}`
            );
            resolve([]);
          }
          const drives = stdout
            .trim()
            .split("\r\n")
            .slice(1)
            .map((line) => line.trim());
          resolve(drives);
        }
      );
    });
    return waitForCmd;
  },
};

module.exports = fileSystemRawCmds;
