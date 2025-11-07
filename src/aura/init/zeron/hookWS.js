const buildClass = (n) => {
  // >>> BEGIN OF SEEWO HUGO ORIGINAL CODE <<< //
  const s = n(239),
    o = n(7);
  class WebSocketManager {
    constructor(e, t) {
      // ### BOR ### //
      console.debug(
        "[HugoAura / Zeron / WebSocket Hook] Created new WebSocketManager instance."
      ),
        // ### EOR ### //
        (this.host = e),
        (this.isNotWss = t),
        (this.intervals = 0),
        (this.onMessage = this.onMessage.bind(this)),
        (this.onClose = this.onClose.bind(this)),
        (this.onLinkOk = this.onLinkOk.bind(this)),
        (this.sendMessage = this.sendMessage.bind(this)),
        (this.setHost = this.setHost.bind(this)),
        (this.onDisconnectMessage = this.onDisconnectMessage.bind(this)),
        (this.ws = ""),
        (this.start = !1),
        (this.ready = !1),
        (this.relink = !1),
        (this.shouldRelink = !0);
    }
    create() {
      const { host: e, onLinkOk: t, onClose: n, onMessage: i } = this;
      if (e) {
        this.start = !0;
        let r = this.isNotWss
          ? { secureProtocol: "TLSv1_2_method" }
          : { rejectUnauthorized: !1, secureProtocol: "TLSv1_2_method" };
        const a = new s(e, r);
        !this.relink && o.info(this.host + "创建连接！"),
          a.on("open", () => {
            (this.intervals = 0),
              (this.ready = !0),
              (this.relink = !1),
              o.info(e + "连接成功！"),
              t();
          }),
          a.on("error", (t) => {
            !this.relink && o.error(e + "," + t);
          }),
          a.on("close", () => {
            (this.ready = !1),
              !this.relink && this.onDisconnectMessage(),
              !this.relink && o.info(e + "断开连接！"),
              n();
          }),
          a.on("message", (t) => {
            o.info("主进程接受数据", e, t),
              // ### BOR ### //
              console.debug(
                "[HugoAura / Zeron / WebSocket Hook] New WebSocket data received:",
                e,
                "|",
                t
              ),
              // ### EOR ### //
              i(t);
          }),
          (this.ws = a);
      }
    }
    setHost(e) {
      if (((this.host = e), this.ready))
        try {
          this.ws.close();
        } catch (e) {
          (this.ws = ""), this.create();
        }
      this.start || this.create();
    }
    sendMessage(e) {
      const { ws: t } = this;
      // ### BOR ### //
      console.debug(
        "[HugoAura / Zeron / WebSocket Hook] New WebSocket data sent:",
        message
      );
      // ### EOR ### //
      this.ready ? t.send(JSON.stringify(e)) : this.onDisconnectMessage(e);
    }
    onDisconnectMessage(e) {}
    onMessage(e) {}
    onLinkOk() {}
    onClose() {
      this.shouldRelink && this.relinkFun();
    }
    relinkFun() {
      !this.relink &&
        o.error(this.host + ", 开始重连") &&
        this.onDisconnectMessage(),
        (this.relink = !0),
        1e4 !== this.intervals && (this.intervals += 2e3),
        setTimeout(() => {
          this.create();
        }, this.intervals);
    }
  }
  // >>> END OF SEEWO HUGO ORIGINAL CODE <<< //

  return WebSocketManager;
};

const genHookedWS = (central) => {
  return buildClass(central);
};

module.exports = genHookedWS;
