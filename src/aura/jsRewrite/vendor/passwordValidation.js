/// Rewrite rules basic config section begins ///

const feature = `['密码错误', 'a.handleListenPasswordValidation'].every(str => stringifyFunc.includes(str))`;

const method = "legacy";

const methodArg = "";

const __config =
  window.__HUGO_AURA_CONFIG__.rewrite["vendor/passwordValidation"];

/// End of the rewrite rules basic config section ///

// >> Begin of Notes << //

/*
adminAuthMode -> mount on window._ACCEPT_DATA.data.adminAuthMode
0 == Hybrid (remoteAuth === true: 密码 / 二维码, remoteAuth === false: 密码)
1 == 仅二维码 (remoteAuth === true, 若 !remoteAuth, 页面样式会出问题)
2 == 仅密码

Reference: https://cstore-public.seewo.com/faq-service/ab2a474d022b4ddabfab788c50359115
*/

// >> End of Notes << //

const newFunction = function (e, t, b) {
  "use strict";
  var n,
    r = b(3),
    o = b.n(r),
    a = b(4),
    s = b.n(a),
    i = b(5),
    u = b.n(i),
    l = b(6),
    c = b.n(l),
    d = b(2),
    A = b.n(d),
    m = b(8),
    f = b.n(m),
    y = b(0),
    v = b.n(y),
    h = b(35),
    p = b(9),
    _ = b(14),
    M = b(44),
    g = b(22),
    w = (b(433), b(7)),
    D = b(15),
    T = b.n(D),
    j = b(10),
    E = b.n(j),
    I = b(39),
    N = b(40),
    z = b(19),
    Y = b(78),
    L = b.n(Y);
  b(445);
  var x,
    k = 2,
    S = 0,
    O = 1,
    C = 3,
    B = 4,
    Q =
      ((n = {}),
      E()(n, B, "加载失败"),
      E()(n, S, "二维码已失效"),
      E()(n, k, "网络异常"),
      n),
    P = window._ACCEPT_DATA,
    R = function (n) {
      function t() {
        clearTimeout(M.current),
          (_.current = !0),
          A(C),
          Object(I.a)(N.a.GetCommonQrcode, { type: n.qrcodeType })
            .then(function () {
              A(C);
            })
            .catch(function () {
              A(B), (_.current = !1);
            }),
          (M.current = setTimeout(function () {
            (_.current = !1), A(B);
          }, 1e4));
      }
      function e(e) {
        if ((clearTimeout(M.current), e && e.type === n.qrcodeType)) {
          if (e.status === S && g.current && g.current === e.qrKey)
            return void A(e.status);
          _.current = !1;
          var t = ""
            .concat(e.qrCode)
            .concat(
              encodeURIComponent(
                "?_d=" +
                  window.deviceId +
                  "&_t=" +
                  n.qrcodeType +
                  "&_k=" +
                  e.qrKey +
                  (n.qrcodeExtraParams || "")
              )
            );
          u(t), A(e.status), (g.current = e.qrKey);
        }
      }
      function r(e) {
        e &&
          e.type === n.qrcodeType &&
          e.qrKey === g.current &&
          (e.auth ? (p(!0), n.onSuccess()) : t());
      }
      function a(e) {
        A(
          e
            ? function (e) {
                return e === k && t(), e;
              }
            : k
        );
      }
      var i = Object(y.useState)(""),
        o = T()(i, 2),
        s = o[0],
        u = o[1],
        l = Object(y.useState)(C),
        c = T()(l, 2),
        d = c[0],
        A = c[1],
        m = Object(y.useState)(!1),
        f = T()(m, 2),
        h = f[0],
        p = f[1],
        _ = Object(y.useRef)(!1),
        M = Object(y.useRef)(null),
        g = Object(y.useRef)(null);
      return (
        Object(y.useEffect)(function () {
          return (
            setTimeout(function () {
              t();
            }, 300),
            P.register("COMMON_QRCODE_MESSAGE", e),
            P.register("COMMON_QRCODE_RESULT", r),
            P.register("iotLineStatus", a),
            function () {
              P.removeOne("COMMON_QRCODE_MESSAGE", e),
                P.removeOne("COMMON_QRCODE_RESULT", r),
                P.removeOne("iotLineStatus", a),
                clearTimeout(M.current);
            }
          );
        }, []),
        v.a.createElement(
          "div",
          { className: "index__box__3JK51ZMl" },
          !h &&
            v.a.createElement(
              v.a.Fragment,
              null,
              d === C &&
                v.a.createElement(
                  v.a.Fragment,
                  null,
                  v.a.createElement("div", {
                    className: "index__loading__3_GiKxR_",
                  })
                ),
              d !== C &&
                v.a.createElement(
                  "div",
                  { className: "index__qrcode-img__1adCa8NJ" },
                  s
                    ? v.a.createElement(L.a, {
                        value: s,
                        size: n.width || null,
                      })
                    : v.a.createElement("img", { src: b(448) })
                ),
              d !== C &&
                d !== O &&
                v.a.createElement(
                  "div",
                  { className: "index__load-fail__1TIfNnFd" },
                  v.a.createElement("p", null, Q[d]),
                  v.a.createElement(
                    "div",
                    { className: "index__button__3SamV-90" },
                    v.a.createElement(z.a, { onClick: t }),
                    v.a.createElement("p", null, "点击刷新")
                  )
                )
            ),
          h &&
            v.a.createElement(
              "div",
              { className: "index__auth-success__1GR7L6Hm" },
              v.a.createElement("p", null, "验证成功")
            )
        )
      );
    };
  R = Object(y.memo)(R);
  var F = {
    "./index.less": {
      "switch-type": "index__switch-type__1bkrQETQ",
      input: "index__input__YXt6XKsv",
      qrcode: "index__qrcode__YrKbWSHE",
      "switch-btn": "index__switch-btn__11ZSw-Jw",
      tab: "index__tab__5k53HIze",
      slider: "index__slider__28g3VRJ6",
      "qrcode-part": "index__qrcode-part__2WtgyjIC",
      "input-part": "index__input-part__2PR-hnsC",
      "input-title": "index__input-title__9XqNf8nj",
      "main-title": "index__main-title__x6jJf0zc",
      "sub-title": "index__sub-title__1W-OhMcw",
      title: "index__title__3J7l6UDi",
      close: "index__close__mUeIwYJs",
      password: "index__password__nbpOESix",
      error: "index__error__YPcLYmaS",
      normal: "index__normal__1xpAxvig",
      failure: "index__failure__1pin0osM",
      default: "index__default__3kXpszYw",
      forbid: "index__forbid__Lafq9LNO",
      forbidden: "index__forbidden__1zUAyYjv",
      "error-text": "index__error-text__1vxztMbo",
      "button-confirm": "index__button-confirm__3yzKJeaI",
    },
  };
  function U(r) {
    var a = (function () {
      if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
      if (Reflect.construct.sham) return !1;
      if ("function" == typeof Proxy) return !0;
      try {
        return (
          Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {})
          ),
          !0
        );
      } catch (e) {
        return !1;
      }
    })();
    return function () {
      var e,
        t = A()(r);
      if (a) {
        var n = A()(this).constructor;
        e = Reflect.construct(t, arguments, n);
      } else e = t.apply(this, arguments);
      return c()(this, e);
    };
  }
  var H = "passwordSuccess",
    G = "passwordFail",
    W = "requestLimit",
    J = "requestError",
    V = window._ACCEPT_DATA,
    q = "ADMIN_LOCK",
    Z = "PASSWORD_INPUT",
    X = "QRCODE",
    K = 0,
    $ = 1,
    ee = 2,
    te =
      Object(p.a)(
        { hasRelateSchool: "state.hasRelateSchool" },
        { getAdminPermission: _.j }
      )(
        (x = (function (e) {
          u()(i, e);
          var r = U(i);
          function i() {
            var a;
            o()(this, i);
            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
              t[n] = arguments[n];
            return (
              ((a = r.call.apply(r, [this].concat(t))).state = {
                isError: !1,
                password: ["", "", "", "", "", ""],
                show: !1,
                forbiddenTime: -1,
                errorText: "",
                checkType: X,
                canSwitchType: !(
                  1 !== a.props.hasRelateSchool && !a.props.canSwitchType
                ),
                remoteAuth: a.props.remoteAuth || !1,
                adminAuthMode: ee,
                crypto: require("crypto"),
              }),
              (a.timeout = null),
              (a.sendMessageLock = !1),
              (a.handleSetSwitchState = function () {
                1 === a.props.hasRelateSchool || a.props.canSwitchType
                  ? a.setState({ canSwitchType: !0 })
                  : a.setState({ canSwitchType: !1, checkType: Z });
              }),
              (a.handleSuccess = function () {
                var e = a.props,
                  t = e.onOk,
                  n = e.history;
                w.a.send("clearPasswordLockTiming", { name: q }),
                  t(function (e) {
                    document.body.removeEventListener(
                      "keyup",
                      a.listenCallback
                    ),
                      e !== n.location.pathname ? n.push(e) : a.handleCancell();
                  });
              }),
              (a.handleListenPasswordValidation = function (e) {
                var t = e.action,
                  n = e.data,
                  r = void 0 === n ? {} : n;
                switch (((a.sendMessageLock = !1), t)) {
                  case H:
                    a.handleSuccess();
                    break;
                  case J:
                    console.log("请求触发错误，请重试"),
                      a.setState({
                        isError: !0,
                        errorText: r.message || "请求出错，请重试",
                      });
                    break;
                  case W:
                    console.log("请求触发限流", r),
                      w.a.send("passwordInputLockRequestLimit", {
                        name: q + "_REQUEST_LIMIT",
                        time: r.retryAfter / 60,
                      }),
                      a.setState({ isError: !0, errorText: "" });
                    break;
                  case G:
                    // ### BOR ### //
                    const originalFunc = () => {
                      w.a.send("passwordInputLockError", {
                        name: q,
                        time: 10,
                      }),
                        a.setState({
                          isError: !0,
                          errorText: r.message || "密码错误",
                        }),
                        (a.timeout = setTimeout(function () {
                          (a.sendMessageLock = !1),
                            a.setState({
                              password: "",
                              isError: !1,
                              errorText: "",
                            });
                        }, 1e3));
                    };
                    if (__config.enabled) {
                      switch (__config.type) {
                        case "customPassword":
                          if (
                            a.state.crypto
                              .createHash("md5")
                              .update(
                                a.state.password.toString() +
                                  __config.customPassword.salt
                              )
                              .digest("hex") ===
                            __config.customPassword.passwordWithSalt
                          ) {
                            a.handleSuccess();
                          } else {
                            originalFunc();
                          }
                          break;
                        case "bypass":
                          a.handleSuccess();
                          break;
                        default:
                          originalFunc();
                          break;
                      }
                    } else {
                      originalFunc();
                    }
                    // ### EOR ### //
                    break;
                  default:
                    return;
                }
              }),
              (a.handleRemoteAuthChange = function (e) {
                !0 === e
                  ? a.setState({ remoteAuth: !0 })
                  : a.setState({ remoteAuth: !1, checkType: Z });
              }),
              (a.handleRemoteAuthMode = function (t) {
                Object(g.isNumber)(t) &&
                  a.setState(function (e) {
                    return {
                      adminAuthMode: t,
                      checkType: t === ee ? Z : t === $ ? X : e.checkType,
                    };
                  });
              }),
              (a.handleCancell = function () {
                a.props.onCancell();
              }),
              (a.handleConfirm = function () {
                0 < a.state.forbiddenTime ||
                  a.sendMessageLock ||
                  (a.state.password
                    ? ((a.sendMessageLock = !0),
                      w.a.send("adminPasswordValidation", {
                        password: a.state.password,
                        schoolCode: a.props.schoolCode || void 0,
                        checkType: a.props.checkType || void 0,
                      }))
                    : a.setState({
                        isError: !0,
                        errorText: "请输入管理员密码",
                      }));
              }),
              (a.listenCallback = function (e) {
                13 === e.keyCode &&
                  a.state.forbiddenTime <= 0 &&
                  a.handleConfirm();
              }),
              (a.handleChange = function (e) {
                a.setState({ password: e.target.value, isError: !1 });
              }),
              (a.handleLockTimeFeedBack = function (e) {
                "number" == typeof e &&
                  (clearTimeout(a.timeout),
                  a.setState({
                    forbiddenTime: e,
                    isError: !1,
                    errorText: "",
                  }),
                  0 === e &&
                    ((a.sendMessageLock = !1),
                    a.setState({ password: "", isError: !1 })));
              }),
              (a.handleChangeType = function (e) {
                return function () {
                  a.setState({ checkType: e });
                };
              }),
              a
            );
          }
          return (
            s()(
              i,
              [
                {
                  key: "componentDidUpdate",
                  value: function (e) {
                    // ### BOR ### //
                    if (__config.authModeRewrite !== "default") {
                      switch (__config.authModeRewrite) {
                        case "hybrid":
                          window._ACCEPT_DATA.data.adminAuthMode = 0;
                          window._ACCEPT_DATA.data.remoteAuth = true;
                          break;
                        case "remoteOnly":
                          window._ACCEPT_DATA.data.adminAuthMode = 1;
                          window._ACCEPT_DATA.data.remoteAuth = true;
                          break;
                        case "passwordOnly":
                          window._ACCEPT_DATA.data.adminAuthMode = 2;
                          window._ACCEPT_DATA.data.remoteAuth = false;
                          break;
                        default:
                          break;
                      }
                    }
                    // ### EOR ### //
                    this.state.show
                      ? this.refs.password &&
                        this.refs.password.addEventListener(
                          "keyup",
                          this.listenCallback
                        )
                      : this.refs.password &&
                        this.refs.password.removeEventListener(
                          "keyup",
                          this.listenCallback
                        ),
                      this.props.show && !e.show
                        ? (V.getAndRegister(
                            q + "_FEEDBACK",
                            this.handleLockTimeFeedBack
                          ),
                          V.getAndRegister(
                            q + "_REQUEST_LIMIT_FEEDBACK",
                            this.handleLockTimeFeedBack
                          ),
                          this.props.control ||
                            V.getAndRegister(
                              "remoteAuth",
                              this.handleRemoteAuthChange
                            ),
                          this.props.control ||
                            V.getAndRegister(
                              "adminAuthMode",
                              this.handleRemoteAuthMode
                            ),
                          w.a.on(
                            "adminPasswordValidationResult",
                            this.handleListenPasswordValidation
                          ))
                        : !this.props.show &&
                          e.show &&
                          (V.removeOne(
                            q + "_FEEDBACK",
                            this.handleLockTimeFeedBack
                          ),
                          V.removeOne(
                            q + "_REQUEST_LIMIT_FEEDBACK",
                            this.handleLockTimeFeedBack
                          ),
                          V.removeOne(
                            "remoteAuth",
                            this.handleRemoteAuthChange
                          ),
                          V.removeOne(
                            "adminAuthMode",
                            this.handleRemoteAuthMode
                          ),
                          w.a.removeListener(
                            "adminPasswordValidationResult",
                            this.handleListenPasswordValidation
                          )),
                      this.props.hasRelateSchool !== e.hasRelateSchool &&
                        this.handleSetSwitchState(),
                      void 0 !== this.props.mode &&
                        this.props.mode !== e.mode &&
                        this.handleRemoteAuthMode(this.props.mode),
                      void 0 !== this.props.remoteAuth &&
                        this.props.remoteAuth !== e.remoteAuth &&
                        this.handleRemoteAuthChange(this.props.remoteAuth);
                  },
                },
                {
                  key: "componentDidMount",
                  value: function () {
                    void 0 !== this.props.mode &&
                      this.handleRemoteAuthMode(this.props.mode);
                  },
                },
                {
                  key: "componentWillUnmount",
                  value: function () {
                    V.removeOne(
                      q + "_REQUEST_LIMIT_FEEDBACK",
                      this.handleLockTimeFeedBack
                    ),
                      w.a.removeListener(
                        "adminPasswordValidationResult",
                        this.handleListenPasswordValidation
                      ),
                      this.refs.password &&
                        this.refs.password.removeEventListener(
                          "keyup",
                          this.listenCallback
                        );
                  },
                },
                {
                  key: "render",
                  value: function () {
                    var e,
                      t = this.handleCancell,
                      n = this.handleChange,
                      r = this.props,
                      a = r.show,
                      i = r.qrcodeExtraParams,
                      o = this.state,
                      s = o.password,
                      u = o.forbiddenTime,
                      l = o.errorText,
                      c = o.checkType,
                      d = o.isError,
                      A = o.remoteAuth,
                      m = o.adminAuthMode;
                    return v.a.createElement(
                      h.a,
                      {
                        show: a,
                        title: "",
                        footerHide: !0,
                        width: "424px",
                        height: "286px",
                      },
                      A &&
                        m === K &&
                        v.a.createElement(
                          "div",
                          { className: "index__switch-btn__11ZSw-Jw" },
                          v.a.createElement(
                            "div",
                            {
                              className: "index__tab__5k53HIze",
                              onClick: this.handleChangeType(X),
                            },
                            v.a.createElement("span", null, "扫码验证")
                          ),
                          v.a.createElement(
                            "div",
                            {
                              className: "index__tab__5k53HIze",
                              onClick: this.handleChangeType(Z),
                            },
                            v.a.createElement("span", null, "密码验证")
                          ),
                          v.a.createElement("div", {
                            className: "index__slider__28g3VRJ6",
                            style: { left: c === X ? "4px" : "150px" },
                          })
                        ),
                      m === $ &&
                        v.a.createElement(
                          "div",
                          { className: "index__title__3J7l6UDi" },
                          "扫码验证"
                        ),
                      (m === ee || !A) &&
                        v.a.createElement(
                          "div",
                          { className: "index__title__3J7l6UDi" },
                          "密码验证"
                        ),
                      c === Z &&
                        v.a.createElement(
                          "div",
                          { className: "index__input-part__2PR-hnsC" },
                          v.a.createElement(
                            "div",
                            {
                              className: "index__password__nbpOESix",
                              ref: "password",
                            },
                            v.a.createElement("input", {
                              placeholder: "请输入管理员密码",
                              value: 0 <= u && !s ? "******" : s,
                              onChange: n,
                              type: "password",
                              ref: this.refs.password,
                              maxLength: 1e3,
                              disabled: 0 <= u,
                              className: f()(d ? "input error" : "input", F),
                            }),
                            0 <= u &&
                              v.a.createElement(
                                "div",
                                { className: "index__forbidden__1zUAyYjv" },
                                "密码输入错误次数太多，请",
                                (e = u) < 60
                                  ? e + "秒"
                                  : Math.ceil(e / 60) + "分钟",
                                "后重试"
                              ),
                            d &&
                              l &&
                              v.a.createElement(
                                "div",
                                {
                                  className:
                                    "index__forbidden__1zUAyYjv index__error-text__1vxztMbo",
                                },
                                l
                              )
                          ),
                          v.a.createElement(
                            "div",
                            {
                              className: "index__button-confirm__3yzKJeaI",
                            },
                            v.a.createElement(z.a, {
                              onClick: this.handleConfirm,
                            })
                          )
                        ),
                      a &&
                        v.a.createElement(
                          "div",
                          {
                            className: "index__qrcode-part__2WtgyjIC",
                            style: { display: c === X ? "block" : "none" },
                          },
                          v.a.createElement(
                            "div",
                            { className: "index__input-title__9XqNf8nj" },
                            v.a.createElement(
                              "div",
                              { className: "index__qrcode__YrKbWSHE" },
                              v.a.createElement(R, {
                                qrcodeType:
                                  this.props.qrcodeType || "hugoAdmin",
                                qrcodeExtraParams: i,
                                onSuccess: this.handleSuccess,
                                width: 132,
                              })
                            ),
                            v.a.createElement(
                              "div",
                              { className: "index__sub-title__1W-OhMcw" },
                              "请用微信扫一扫"
                            )
                          )
                        ),
                      v.a.createElement(
                        "div",
                        { className: "index__close__mUeIwYJs" },
                        v.a.createElement(z.a, { onClick: t }),
                        v.a.createElement("i", { className: "iconfont" }, "")
                      )
                    );
                  },
                },
              ],
              [
                {
                  key: "getDerivedStateFromProps",
                  value: function (e, t) {
                    return e.show !== t.show
                      ? e.show
                        ? {
                            show: e.show,
                            password: "",
                            isError: !1,
                            checkType: e.mode === ee ? Z : (e.mode, X),
                            canSwitchType: !(
                              1 !== e.hasRelateSchool && !e.canSwitchType
                            ),
                          }
                        : { show: e.show }
                      : null;
                  },
                },
              ]
            ),
            i
          );
        })(y.PureComponent))
      ) || x;
  t.a = Object(M.h)(te);
};

module.exports = { feature, method, methodArg, newFunction };
