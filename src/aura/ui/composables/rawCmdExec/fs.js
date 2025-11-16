const childProc = require("child_process");

const fileSystemRawCmds = {
  getDiskCaptions: async () => {
    const waitForCmd = new Promise((resolve) => {
      childProc.exec("fsutil fsinfo drives", (error, stdout, stderr) => {
        if (error) {
          console.error(
            `[HugoAura / UI / Composables / Raw CMD / FS] Failed to exec fsutil getCaption: ${error}`
          );
          resolve([]);
        }
        const finResult = [];
        stdout
          .trim()
          .split(": ")[1]
          .split(":\\")
          .forEach((line) => {
            if (line !== "") finResult.push(line.trim() + ":");
          });
        resolve(finResult);
      });
    });
    return waitForCmd;
  },
};

module.exports = fileSystemRawCmds;
