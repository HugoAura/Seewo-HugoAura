const IPC_METHOD_BASE = "$aura.debug";

const debugSettings = [
  {
    id: 0,
    categoryName: "日志与输出",
    child: [
      {
        index: 0,
        id: "openHugoAuraLogDir",
        type: "button",
        style: "outline",
        name: "HugoAura 日志目录",
        description: "",
        restart: false,
        reload: false,
        associateVal: null,
        auraIf: () => true,
        buttonContent: "打开",
        valueGetter: async () => {
          const ipcRendererRet = await ipcRenderer.invoke(
            `${IPC_METHOD_BASE}.getLogDirAsync`
          );
          if (ipcRendererRet.success && ipcRendererRet.data !== "") {
            global.__HUGO_AURA__.logDir = ipcRendererRet.data;
            return "目录位置: " + ipcRendererRet.data;
          } else {
            return "未能获取日志目录位置";
          }
        },
        callbackFn: async (event) => {
          const childProc = require("child_process");
          childProc.spawn(`explorer.exe`, [`${global.__HUGO_AURA__.logDir}`]);
        },
      },
    ],
  },
];

module.exports = { debugSettings };
