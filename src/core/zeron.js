// Ex-Early Load Pro Plus Max ++

console.debug("[HugoAura / Zeron] Early load script loaded.");

const appendSwitch = () => {
  const { app } = require("electron");
  app.commandLine.appendSwitch("host-rules", "MAP *.hugoaura.local 127.0.0.1");
};

module.exports = function (central) {
  const originalCentral = { ...central };

  appendSwitch();

  const genHookedWS = require("../aura/init/zeron/hookWS");

  console.debug(
    "[HugoAura / Zeron / WebSocket Hook] WebSocket hooked class generated."
  );

  return new Proxy(central, {
    apply(target, thisArg, args) {
      switch (args[0]) {
        case 18:
          return genHookedWS(central);
        default:
          return Reflect.apply(target, thisArg, args);
      }
    },
  });
};
