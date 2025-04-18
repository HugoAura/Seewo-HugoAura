// Ex-Early Load Pro Plus Max ++

console.debug("[HugoAura / Zeron] Early load script loaded.");

module.exports = function (central) {
  const originalCentral = { ...central };
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
