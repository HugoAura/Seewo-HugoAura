const REQUIRE_BASE = ".";

const {
  updatePlsConfigToRemote,
} = require(`${REQUIRE_BASE}/../../../../composables/plsConfigManager`);

const basicSettings = [
  {
    id: 0,
    categoryName: "可访问性",
    child: [
      {
        index: 0,
        id: "authToken",
        type: "input",
        subType: "text",
        name: "WebSocket 认证密钥",
        description: "选择一个安全的密钥, 用于 PLS 侧验证 Aura 前端身份",
        restart: true,
        reload: false,
        restartPLS: false,
        associateVal: null,
        auraIf: () => true,
        defaultValue: "",
        placeHolder: "输入一个密钥",
        valueGetter: () => {
          return global.__HUGO_AURA_CONFIG__.plsToken;
        },
        callbackFn: (newVal) => {
          if (newVal === "" || !newVal)
            return { valid: false, hint: "请输入认证密钥" };

          if (newVal.length < 8) {
            return { valid: false, hint: "至少输入 8 位字符" };
          }

          global.__HUGO_AURA_CONFIG__.plsToken = newVal;
          return { valid: true };
        },
      },
    ],
  },
];

module.exports = { basicSettings };
