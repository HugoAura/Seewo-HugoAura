// @ts-check

const REQUIRE_BASE = ".";

const { basicRouteHandler } = require(`${REQUIRE_BASE}/routes/basic`);
const { configRouteHandler } = require(`${REQUIRE_BASE}/routes/config`);

/**
 *
 * @param {PLSPush} parsedWsMsg
 * @returns
 */
const pushMsgHandler = (parsedWsMsg) => {
  if (!parsedWsMsg.type) return false;

  const msgCategory = parsedWsMsg.type.split(".")[0];

  switch (msgCategory) {
    case "basic":
      basicRouteHandler(parsedWsMsg);
      break;
    case "config":
      configRouteHandler(parsedWsMsg);
      break;
    default:
      break;
  }
};

module.exports = { pushMsgHandler };
