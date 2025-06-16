const IPC_METHOD_BASE = "$aura.debug";

const path = require("path");

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
          if (
            global.__HUGO_AURA__.auraDir &&
            global.__HUGO_AURA__.auraDir !== ""
          ) {
            return (
              "目录位置: " + path.join(global.__HUGO_AURA__.auraDir, "logs")
            );
          } else {
            return "未能获取日志目录位置";
          }
        },
        callbackFn: async (event) => {
          const childProc = require("child_process");
          childProc.spawn(`explorer.exe`, [
            `${path.join(global.__HUGO_AURA__.auraDir, "logs")}`,
          ]);
        },
      },
    ],
  },
];

module.exports = { debugSettings };
