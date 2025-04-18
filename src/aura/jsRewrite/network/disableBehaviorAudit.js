/// Rewrite rules basic config section begins ///

const type = "networkRequest";

const urlPattern = "device/behaviorAudit";

/// End of the rewrite rules basic config section ///

const requestHook = (originalReq) => {
  return { redirectURL: "https://127.0.255.255:1145/" };
};

module.exports = { type, urlPattern, requestHook };
