const childProc = require("child_process");

const appRawCmds = {
  checkVcRedistInst: async () => {
    let deviceArch = process.env.PROCESSOR_ARCHITEW6432
      ? process.env.PROCESSOR_ARCHITEW6432
      : process.env.PROCESSOR_ARCHITECTURE;
    // @ts-expect-error
    deviceArch = deviceArch.toLowerCase();
    if (deviceArch === "amd64") {
      deviceArch = "x64";
    } else if (deviceArch === "arm64") {
      // do nothing
    }
    const waitForCmd = new Promise((resolve) => {
      childProc.exec(
        `reg query "HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\${deviceArch}" /v Installed`,
        (error, stdout, stderr) => {
          if (error) {
            console.warn(
              `[HugoAura / UI / Composables / Raw CMD / APP] Detected VS Redist not installed: ${stderr}`
            );
            resolve({ installed: false, arch: deviceArch });
          } else {
            resolve({ installed: true, arch: deviceArch });
          }
        }
      );
    });
    return waitForCmd;
  },
};

module.exports = appRawCmds;
