/// Rewrite rules basic config section begins ///

const feature = `['/api/v1/screenlock/updateQrUrl', 'getScreenLockQrcode'].every(str => stringifyFunc.includes(str))`;

const method = "legacy";

const methodArg = "";

const __config = window.__HUGO_AURA_CONFIG__.rewrite["vendor/screenLock"];

/// End of the rewrite rules basic config section ///

// >> Begin of new function << //

const newFunction = function (e, t, n) {
  "use strict";
  var r = n(3),
    s = n.n(r),
    a = n(4),
    o = n.n(a),
    i = n(5),
    u = n.n(i),
    l = n(6),
    c = n.n(l),
    d = n(2),
    A = n.n(d),
    m = n(10),
    f = n.n(m),
    h = n(0),
    p = n.n(h),
    _ = n(41),
    M = n.n(_),
    g = (n(814), n(7)),
    b = n(9),
    y = n(8),
    v = n.n(y),
    w =
      (n(816),
      {
        "./numberKeyboard.less": {
          "ps-icon": "numberKeyboard__ps-icon__1KO_WOCz",
          forbid: "numberKeyboard__forbid__3ZwtIdlz",
          password: "numberKeyboard__password__2cz3jn8t",
          "shaky-slow": "numberKeyboard__shaky-slow__6pc46EPF",
          solid: "numberKeyboard__solid__WnwaYvi1",
          error: "numberKeyboard__error__JPFhBvTV",
          hollow: "numberKeyboard__hollow__oAboh0j6",
          "number-board": "numberKeyboard__number-board__2jc2t7Cp",
          button: "numberKeyboard__button__2x8eAPIm",
          choose: "numberKeyboard__choose__1yTuk0dD",
          delete: "numberKeyboard__delete__37p6RudB",
        },
      });
  function D(t, e) {
    var n = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(t);
      e &&
        (r = r.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })),
        n.push.apply(n, r);
    }
    return n;
  }
  function T(r) {
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
  var j,
    E = ["", "", "", "", "", ""],
    I = (function (e) {
      u()(a, e);
      var r = T(a);
      function a() {
        var i;
        s()(this, a);
        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
          t[n] = arguments[n];
        return (
          ((i = r.call.apply(r, [this].concat(t))).state = {
            PASSWORD_TEXT_ERROR: "密码错误，请重新输入6位数密码",
            PASSWORD_TEXT_PENDDING: "请输入6位密码" + i.props.title,
            passwordText: "请输入6位密码" + i.props.title,
            inputPassword: [].concat(E),
            chooseIndex: -1,
            nowInputIndex: 0,
            passwordError: !1,
            forbid: !1,
            checking: !1,
          }),
          (i.timeout = null),
          (i.clearErrorTimeout = null),
          (i.BOARD_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort(function () {
            return Math.random() - 0.5;
          })),
          (i.checkPasswordCorrect = function () {}),
          (i.handleButtonClick = function (e) {
            return function () {
              i.state.forbid ||
                i.state.checking ||
                i.saveValue(i.BOARD_LIST[e], { chooseIndex: e });
            };
          }),
          (i.handleDelete = function () {
            if (!i.state.checking) {
              var e = i.state,
                t = e.inputPassword,
                n = e.nowInputIndex;
              0 < n &&
                ((t[n - 1] = E[n - 1]),
                clearTimeout(i.clearErrorTimeout),
                i.setState({
                  inputPassword: t,
                  nowInputIndex: n - 1,
                  passwordText: i.state.PASSWORD_TEXT_PENDDING,
                  passwordError: !1,
                }));
            }
          }),
          (i.passwordCheckFail = function () {
            i.setState(
              {
                passwordError: !0,
                passwordText: i.state.PASSWORD_TEXT_ERROR,
              },
              function () {
                i.clearErrorTimeout = setTimeout(function () {
                  var e = {};
                  i.state.nowInputIndex === i.state.inputPassword.length &&
                    (e.inputPassword = [].concat(E)),
                    i.setState(
                      (function (t) {
                        for (var e = 1; e < arguments.length; e++) {
                          var n = null != arguments[e] ? arguments[e] : {};
                          e % 2
                            ? D(Object(n), !0).forEach(function (e) {
                                f()(t, e, n[e]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(
                                t,
                                Object.getOwnPropertyDescriptors(n)
                              )
                            : D(Object(n)).forEach(function (e) {
                                Object.defineProperty(
                                  t,
                                  e,
                                  Object.getOwnPropertyDescriptor(n, e)
                                );
                              });
                        }
                        return t;
                      })(
                        {
                          passwordError: !1,
                          passwordText: i.state.PASSWORD_TEXT_PENDDING,
                        },
                        e
                      )
                    );
                }, 2e3);
              }
            );
          }),
          (i.saveValue = function (e) {
            var t =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              n = i.state,
              r = n.inputPassword,
              a = n.nowInputIndex;
            a <= r.length - 1 &&
              ((r[a] = e), (t.inputPassword = r), (t.nowInputIndex = a + 1)),
              a === r.length - 1 && i.checkPasswordCorrect(),
              a === r.length &&
                (clearTimeout(i.clearErrorTimeout),
                ((r = [].concat(E))[0] = e),
                (t.inputPassword = r),
                (t.nowInputIndex = 1),
                (t.passwordText = i.state.PASSWORD_TEXT_PENDDING),
                (t.passwordError = !1)),
              i.setState(t),
              clearTimeout(i.timeout),
              (i.timeout = setTimeout(function () {
                i.setState({ chooseIndex: -1 });
              }, 500));
          }),
          (i.listenInput = function () {
            if (__config.enabled && __config.disableKeyboardHook) return;
            document.addEventListener("keyup", function (e) {
              if (!i.state.forbid) {
                if (
                  (48 <= e.keyCode && e.keyCode <= 57) ||
                  (96 <= e.keyCode && e.keyCode <= 105)
                ) {
                  var t = 0;
                  (t = e.keyCode <= 57 ? 48 : 96),
                    i.saveValue(e.keyCode - t, {
                      chooseIndex: i.BOARD_LIST.indexOf(e.keyCode - t),
                    });
                }
                8 === e.keyCode && i.handleDelete();
              }
            });
          }),
          (i.insertHtml = function () {}),
          (i.componentDidMountFunc = function () {}),
          (i.handleReset = function () {
            i.setState({
              passwordError: !1,
              passwordText: i.state.PASSWORD_TEXT_PENDDING,
              inputPassword: [].concat(E),
              forbid: !1,
              nowInputIndex: 0,
            });
          }),
          i
        );
      }
      return (
        o()(a, [
          {
            key: "componentDidMount",
            value: function () {
              this.componentDidMountFunc(), this.listenInput();
            },
          },
          {
            key: "render",
            value: function () {
              var n = this,
                e = this.state,
                t = e.passwordText,
                r = e.inputPassword,
                a = e.chooseIndex,
                i = e.passwordError,
                o = e.forbid;
              return p.a.createElement(
                p.a.Fragment,
                null,
                p.a.createElement(
                  "p",
                  { className: v()(o ? "ps-icon forbid" : "ps-icon", w) },
                  t
                ),
                !o &&
                  p.a.createElement(
                    "div",
                    { className: "numberKeyboard__password__2cz3jn8t" },
                    r.map(function (e, t) {
                      return p.a.createElement("span", {
                        key: t,
                        className: v()(
                          -1 < n.BOARD_LIST.indexOf(e)
                            ? i
                              ? "solid error"
                              : "solid"
                            : i
                            ? "hollow error"
                            : "hollow",
                          w
                        ),
                      });
                    })
                  ),
                p.a.createElement(
                  "div",
                  { className: "numberKeyboard__number-board__2jc2t7Cp" },
                  this.BOARD_LIST.map(function (e, t) {
                    return p.a.createElement(
                      "div",
                      {
                        key: t,
                        onClick: n.handleButtonClick(t),
                        className: v()(
                          o
                            ? "button forbid"
                            : a === t
                            ? "button choose"
                            : "button",
                          w
                        ),
                      },
                      p.a.createElement("p", null, e)
                    );
                  }),
                  p.a.createElement(
                    "div",
                    {
                      onClick: this.handleDelete,
                      className: v()("delete ".concat(o ? "forbid" : ""), w),
                    },
                    p.a.createElement("p", null, "删除")
                  )
                ),
                this.insertHtml()
              );
            },
          },
        ]),
        a
      );
    })(h.PureComponent);
  function N(t, e) {
    var n = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(t);
      e &&
        (r = r.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })),
        n.push.apply(n, r);
    }
    return n;
  }
  function z(t) {
    for (var e = 1; e < arguments.length; e++) {
      var n = null != arguments[e] ? arguments[e] : {};
      e % 2
        ? N(Object(n), !0).forEach(function (e) {
            f()(t, e, n[e]);
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
        : N(Object(n)).forEach(function (e) {
            Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
          });
    }
    return t;
  }
  function Y(r) {
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
  var L = "passwordEmpty",
    x = "passwordFail",
    k = "requestLimit",
    S = "requestError",
    O =
      Object(b.a)()(
        (j = (function (e) {
          u()(n, e);
          var t = Y(n);
          function n(e) {
            var o;
            return (
              s()(this, n),
              ((o = t.call(this, e)).checkPasswordCorrect = function () {
                o.props.onPasswordInputOver(o.state.inputPassword.join("")),
                  o.forbidBoardInputForChecking();
              }),
              (o.forbidBoardInputForChecking = function () {
                o.setState({ checking: !0 });
              }),
              (o.releaseForbidInputForChecking = function () {
                o.setState({ checking: !1 });
              }),
              (o.listenEvent = function () {
                var a = o.props.actions,
                  i = M()(o);
                g.a.on("passwordAuthenResult", function (e) {
                  var t = e.action,
                    n = e.data,
                    r = void 0 === n ? {} : n;
                  switch (
                    (console.log("passwordAuthenResult", t, r),
                    i.releaseForbidInputForChecking(),
                    t)
                  ) {
                    case L:
                      a.sendMessage({
                        type: "error",
                        text: "后台密码获取失败，请关机重启后再使用，给您带来的不便深表歉意！",
                      });
                      break;
                    case S:
                      console.log("请求触发错误，请重试"),
                        o.setState({
                          passwordError: !0,
                          passwordText: "请求错误，请重试",
                        });
                      break;
                    case k:
                      console.log("请求触发限流", r),
                        g.a.send("passwordInputLockRequestLimit", {
                          name: o.props.type + "_REQUEST_LIMIT",
                          time: r.retryAfter / 60,
                        });
                      break;
                    case x:
                      o.errorCount++,
                        g.a.send("passwordInputLockError", {
                          name: o.props.type,
                          time: 10,
                        }),
                        o.passwordCheckFail();
                      break;
                    default:
                      return;
                  }
                });
              }),
              (o.handleLockTimeFeedBack = function (e) {
                var t,
                  n =
                    1 < arguments.length && void 0 !== arguments[1]
                      ? arguments[1]
                      : "密码连续输错5次",
                  r = o.props.onSetTitle;
                "number" == typeof e &&
                  (e <= 0
                    ? (o.handleReset(), r(""), (o.errorCount = 0))
                    : (o.setState({
                        forbid: !0,
                        passwordText: ""
                          .concat(n, "，请切换解锁方式或")
                          .concat(
                            (t = e) < 60
                              ? t + "秒"
                              : Math.ceil(t / 60) + "分钟",
                            "后重试"
                          ),
                      }),
                      clearTimeout(o.clearErrorTimeout),
                      r("密码已锁定")));
              }),
              (o.handleLockRequestLimitFeedBack = function (e) {
                o.handleLockTimeFeedBack(e, "密码错误次数过多");
              }),
              (o.componentDidMountFunc = function () {
                o.listenEvent(),
                  _ACCEPT_DATA.getAndRegister(
                    o.props.type + "_FEEDBACK",
                    o.handleLockTimeFeedBack
                  ),
                  _ACCEPT_DATA.getAndRegister(
                    o.props.type + "_REQUEST_LIMIT_FEEDBACK",
                    o.handleLockRequestLimitFeedBack
                  );
              }),
              (o.state = z(
                z({}, o.state),
                {},
                {
                  PASSWORD_TEXT_ERROR: "密码错误",
                  PASSWORD_TEXT_PENDDING: "",
                  passwordText: "",
                }
              )),
              o
            );
          }
          return (
            o()(n, [
              {
                key: "componentWillUnmount",
                value: function () {
                  this.props.onSetTitle(""),
                    _ACCEPT_DATA.removeOne(
                      this.props.type + "_FEEDBACK",
                      this.handleLockTimeFeedBack
                    ),
                    _ACCEPT_DATA.removeOne(
                      this.props.type + "_REQUEST_LIMIT_FEEDBACK",
                      this.handleLockRequestLimitFeedBack
                    );
                },
              },
            ]),
            n
          );
        })(I))
      ) || j,
    C = n(78),
    B = n.n(C),
    Q = 0,
    P = 1,
    R = 2,
    F = 3,
    U = 4,
    H = {
      scanCode: "scanCode",
      activationCode: "activationCode",
      password: "password",
      // ### BOR ### //
      direct: "direct",
      // ### EOR ### //
    },
    G = n(19);
  n(818);
  function W(e) {
    var t = e.canvasRender,
      n = void 0 === t || t,
      r = e.src,
      a = e.status,
      i = void 0 === a ? P : a,
      o = e.nextWorkBrokenText,
      s = e.refreshFunc,
      u = e.title;
    return p.a.createElement(
      "div",
      { className: "qrcode__box__3CkRMc-m" },
      i === P &&
        p.a.createElement(
          p.a.Fragment,
          null,
          p.a.createElement("div", {
            className: "qrcode__loading__2zbQ4y3c",
          }),
          p.a.createElement(
            "p",
            { className: "qrcode__bottom-text__GrGeiA4L" },
            "二维码生成中…"
          )
        ),
      (i === Q || i === F) &&
        p.a.createElement("div", { className: "qrcode__broken__6BB0nLtV" }),
      i === Q && p.a.createElement("p", null, "获取二维码失败，请刷新重试"),
      i === F && p.a.createElement(p.a.Fragment, null, o),
      (i === R || i === U) &&
        p.a.createElement(
          "div",
          { className: "qrcode__qrcode-img__AdgCHFWF" },
          n
            ? p.a.createElement(B.a, { value: r, size: 245 })
            : p.a.createElement("img", { src: r })
        ),
      i === R &&
        p.a.createElement(
          "div",
          { className: "qrcode__invalid-text__1bMsJZJu" },
          p.a.createElement("p", null, "二维码已失效，请刷新重试")
        ),
      i === U &&
        p.a.createElement(
          "p",
          { className: "qrcode__bottom-text__GrGeiA4L" },
          u
        ),
      (i === R || i === Q) &&
        p.a.createElement(
          "div",
          { className: "qrcode__reflesh-button__zRB9LTu2" },
          p.a.createElement(G.a, { onClick: s }),
          p.a.createElement("p", null, "刷新")
        )
    );
  }
  n(821);
  var J = n(64),
    V = n(20);
  var q,
    Z,
    X = n(17);
  function K(r) {
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
  var $ = 1,
    ee = 2,
    te = 3,
    ne = 0,
    re = 1,
    ae = ((q = {}), f()(q, ne, "微信"), f()(q, re, "企业微信"), q),
    ie =
      Object(b.a)(
        {},
        {
          getScreenLockQrcode: function () {
            var a =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              n =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return function (r) {
              var e, t;
              return (
                r(((e = a), { type: J.c, params: e, data: t || "" })),
                Object(V.a)(
                  "hugoServiceHost",
                  "/api/v1/screenlock/updateQrUrl",
                  "post",
                  a,
                  n,
                  "{}"
                ).then(
                  function (e) {
                    var t, n;
                    return (
                      r(
                        ((t = a),
                        (n = e),
                        { type: J.d, params: t, data: n || "" })
                      ),
                      e
                    );
                  },
                  function (e) {
                    var t, n;
                    return (
                      r(
                        ((t = a),
                        (n = e),
                        { type: J.b, params: t, data: n || "" })
                      ),
                      Promise.reject(e)
                    );
                  }
                )
              );
            };
          },
        }
      )(
        (Z = (function (e) {
          u()(i, e);
          var a = K(i);
          function i() {
            var t;
            s()(this, i);
            for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
              n[r] = arguments[r];
            return (
              ((t = a.call.apply(a, [this].concat(n))).state = {
                src: "",
                status: P,
                showType: ne,
              }),
              (t.getCodeUrlTimeout = null),
              (t.nextWorkBrokenText = function () {
                var e = t.props.title;
                return p.a.createElement(
                  p.a.Fragment,
                  null,
                  p.a.createElement("p", null, "设备已断网，无法扫码", e),
                  p.a.createElement("p", null, "请选择其他", e, "方式")
                );
              }),
              (t.refresh = function () {
                t.setState({ status: P }),
                  clearTimeout(t.getCodeUrlTimeout),
                  t.getCodeUrl();
              }),
              (t.getCodeUrl = function () {
                Object(X.a)(t.props.actions, "getScreenLockQrcode")(
                  function () {},
                  function () {
                    t.setState({ status: Q });
                  }
                ),
                  (t.getCodeUrlTimeout = setTimeout(function () {
                    t.getCodeUrl();
                  }, 24e4));
              }),
              (t.listenNetworkBroken = function (e) {
                e ? t.refresh() : t.setState({ status: F });
              }),
              (t.listenQrcodeFeedback = function (e) {
                e.status === $ && t.state.status !== F
                  ? t.setState({ status: Q, showType: e.type })
                  : e.status === ee && t.state.status !== F
                  ? t.setState({ status: R, showType: e.type })
                  : e.status === te &&
                    t.setState({
                      status: U,
                      src:
                        e.lockUrl +
                        encodeURIComponent(
                          "?_d=" + window.deviceId + "&_t=" + t.props.actionType
                        ),
                      showType: e.type,
                    });
              }),
              t
            );
          }
          return (
            o()(i, [
              {
                key: "componentDidMount",
                value: function () {
                  var e = window._ACCEPT_DATA.getData("iotLineStatus");
                  this.listenNetworkBroken(e),
                    window._ACCEPT_DATA.register(
                      "iotLineStatus",
                      this.listenNetworkBroken
                    ),
                    window._ACCEPT_DATA.register(
                      "qrcodeFeeedback",
                      this.listenQrcodeFeedback
                    );
                },
              },
              {
                key: "componentDidUpdate",
                value: function (e) {
                  e.actionType !== this.props.actionType && this.refresh();
                },
              },
              {
                key: "componentWillUnmount",
                value: function () {
                  window._ACCEPT_DATA.removeOne(
                    "iotLineStatus",
                    this.listenNetworkBroken
                  ),
                    window._ACCEPT_DATA.removeOne(
                      "qrcodeFeeedback",
                      this.listenQrcodeFeedback
                    ),
                    clearTimeout(this.getCodeUrlTimeout);
                },
              },
              {
                key: "render",
                value: function () {
                  var e = this.state,
                    t = e.src,
                    n = e.status,
                    r = e.showType,
                    a = this.props.title;
                  return p.a.createElement(
                    "div",
                    { className: "scanCode__box__1giuR_i7" },
                    p.a.createElement(W, {
                      src: t,
                      status: n,
                      nextWorkBrokenText: this.nextWorkBrokenText(),
                      refreshFunc: this.refresh,
                      title: "打开".concat(ae[r], "扫一扫").concat(a),
                    })
                  );
                },
              },
            ]),
            i
          );
        })(h.PureComponent))
      ) || Z,
    oe = (n(823), n(137).a);
  function se(t, e) {
    var n = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(t);
      e &&
        (r = r.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })),
        n.push.apply(n, r);
    }
    return n;
  }
  function ue(t) {
    for (var e = 1; e < arguments.length; e++) {
      var n = null != arguments[e] ? arguments[e] : {};
      e % 2
        ? se(Object(n), !0).forEach(function (e) {
            f()(t, e, n[e]);
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
        : se(Object(n)).forEach(function (e) {
            Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
          });
    }
    return t;
  }
  function le(r) {
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
  var ce,
    de,
    Ae = (function (e) {
      u()(n, e);
      var t = le(n);
      function n(e) {
        var o;
        return (
          s()(this, n),
          ((o = t.call(this, e)).password = null),
          (o.clearTextKey = new Date().getTime()),
          (o.BOARD_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
          (o.ciphertextOfPassword = ""),
          (o.version = void 0),
          (o.pki = void 0),
          (o.failCount = 0),
          (o.newPassword = function () {
            for (var e = "", t = 0; t < 6; t++)
              e += Math.floor(10 * Math.random());
            o.password = e;
          }),
          (o.newQrcode = function () {
            g.a.send("getActivationCodePublicKey");
          }),
          (o.getCiphertextOfPassword = function () {
            var i = o.props.actionType;
            g.a.on("activationCodePublicKey", function (e) {
              (o.version = e.version), (o.pki = e.pki);
              var t = new oe();
              t.setPublicKey(e.publicKey);
              var n = JSON.stringify({
                  deviceId: window.deviceId,
                  code: o.password,
                  timestamp: o.clearTextKey,
                }).replace(/\s/g, ""),
                r = t.encrypt(n);
              o.ciphertextOfPassword = r;
              var a = window.webConfig.activationCodeUnlockTargetUrl;
              o.setState({
                qrcodeUrl: ""
                  .concat(a, "?_d=")
                  .concat(window.deviceId, "&_k=")
                  .concat(o.clearTextKey, "&_p=")
                  .concat(
                    encodeURIComponent(o.ciphertextOfPassword.toString()),
                    "&_v="
                  )
                  .concat(o.version, "&_pki=")
                  .concat(o.pki, "&_t=")
                  .concat(i),
              });
            });
          }),
          (o.checkPasswordCorrect = function () {
            // ### BOR ### //
            const originalAuthFailed = () => {
              o.failCount++,
                o.passwordCheckFail(),
                5 <= o.failCount &&
                  o.setState(
                    {
                      passwordError: !0,
                      passwordText: "激活码错误次数过多，请重新扫码",
                    },
                    function () {
                      o.setNewQrcode(), (o.failCount = 0);
                    }
                  );
            };

            const customAuthFailed = () => {
              if (
                __config.enabled &&
                __config.authRewriteType === "customActivationCode"
              ) {
                const userInput = o.state.inputPassword.join("");
                const crypto = require("crypto");
                if (
                  crypto
                    .createHash("md5")
                    .update(userInput + "auraScreenLockCrack")
                    .digest("hex") ===
                  __config.customActivationCode.activationCodeWithSalt
                ) {
                  o.props.onActivationCorrect();
                  O.failCount = 0;
                } else {
                  originalAuthFailed();
                }
              } else {
                originalAuthFailed();
              }
            };

            o.state.inputPassword.join("") === o.password
              ? (o.props.onActivationCorrect(), (o.failCount = 0))
              : customAuthFailed();
            // ### EOR ### //
          }),
          (o.insertHtml = function () {
            return p.a.createElement(
              "div",
              { className: "activationCode__qrcode__C24-inl2" },
              p.a.createElement(
                "div",
                { className: "activationCode__img__1EsU6UHz" },
                o.state.qrcodeUrl &&
                  p.a.createElement(B.a, {
                    value: o.state.qrcodeUrl,
                    size: 256,
                  })
              ),
              p.a.createElement("p", null, "扫码获取激活码")
            );
          }),
          (o.setNewQrcode = function () {
            o.newPassword(), o.newQrcode(), o.getCiphertextOfPassword();
          }),
          (o.componentDidMountFunc = function () {
            o.setNewQrcode();
          }),
          (o.state = ue(
            ue({}, o.state),
            {},
            {
              PASSWORD_TEXT_ERROR: "激活码错误",
              PASSWORD_TEXT_PENDDING: "",
              passwordText: "",
            }
          )),
          o
        );
      }
      return (
        o()(n, [
          {
            key: "componentDidUpdate",
            value: function (e) {
              e.actionType !== this.props.actionType && this.setNewQrcode();
            },
          },
        ]),
        n
      );
    })(I),
    me = (n(825), n(38));
  function fe(r) {
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
  n.d(t, "a", function () {
    return ge;
  });
  var he =
      ((ce = {}),
      f()(ce, H.scanCode, function (e) {
        return "扫码".concat(e);
      }),
      f()(ce, H.activationCode, function (e) {
        return "请输入6位激活码".concat(e);
      }),
      f()(ce, H.password, function (e) {
        return "请输入6位密码".concat(e);
      }),
      ce),
    pe = window._ACCEPT_DATA,
    _e = Object.values(H),
    Me =
      ((de = {}),
      f()(de, H.scanCode, "扫码"),
      f()(de, H.activationCode, "激活码"),
      f()(de, H.password, "密码"),
      // ### BOR ### //
      __config.showDirectUnlock ? f()(de, H.direct, "直接") : null,
      // ### EOR ### //
      de),
    ge = (function (e) {
      u()(i, e);
      var a = fe(i);
      function i() {
        var r;
        s()(this, i);
        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
          t[n] = arguments[n];
        return (
          ((r = a.call.apply(a, [this].concat(t))).state = {
            chooseType: H.scanCode,
            showTypeList: [],
            deviceId: "",
            schoolCode: "",
            sliderLeft: 0,
            sliderWidth: 0,
            topTitle: "",
          }),
          (r.hasTouched = !1),
          (r.iotStatus = !0),
          (r.hidePasswordBlock = !1),
          (r.adminHidePassword = !1),
          (r.handleChooseType = function (e) {
            return function () {
              // ### BOR ### //
              if (e === "direct" && __config.showDirectUnlock) {
                global.__HUGO_AURA_BREAKUP__[
                  "vendor/screenLock"
                ].goActivationCorrect();
                return;
              }
              if (e === "activationCode" && __config.clickBtnToExit) {
                global.__HUGO_AURA_BREAKUP__["vendor/screenLock"]
                  .btnClickCounter++;
                if (
                  global.__HUGO_AURA_BREAKUP__["vendor/screenLock"]
                    .btnClickCounter === 10
                ) {
                  global.__HUGO_AURA_BREAKUP__[
                    "vendor/screenLock"
                  ].goActivationCorrect();
                }
              }
              // ### EOR ### //
              r.setState({ chooseType: e }),
                (r.hasTouched = !0),
                r.handleGetSelectItemPos(e);
            };
          }),
          (r.chooseTypeOfIotLineStatus = function (e) {
            var t = pe.getData("iotLineStatus"),
              n = "";
            (n =
              null === t
                ? (me.a.info("提取不到iot连接状态，选择激活码解锁"),
                  (r.iotStatus = !1),
                  H.activationCode)
                : ((r.iotStatus = !0), t ? H.scanCode : H.activationCode)),
              r.setState({ chooseType: n }, function () {
                e();
              });
          }),
          (r.loadHasNetworkHidePasswordBlock = function (e) {
            var t = r.state.chooseType;
            if (e)
              if (
                ((r.hidePasswordBlock = !0), r.iotStatus || r.adminHidePassword)
              ) {
                var n = t === H.password ? H.scanCode : t;
                r.setState(
                  { showTypeList: [_e[0], _e[1]], chooseType: n },
                  function () {
                    r.handleGetSelectItemPos(n);
                  }
                );
              } else
                r.setState({ showTypeList: [].concat(_e) }, function () {
                  r.handleGetSelectItemPos(t);
                });
            else
              (r.hidePasswordBlock = !1),
                r.setState(
                  {
                    showTypeList: r.adminHidePassword
                      ? [_e[0], _e[1]]
                      : [].concat(_e),
                  },
                  function () {
                    r.handleGetSelectItemPos(t);
                  }
                );
          }),
          (r.listenIotConnect = function (e) {
            var t = r.state.chooseType;
            if (e)
              if (
                ((r.iotStatus = !0), r.hidePasswordBlock || r.adminHidePassword)
              ) {
                var n = t !== H.password && r.hasTouched ? t : H.scanCode;
                r.setState({ showTypeList: [_e[0], _e[1]], chooseType: n });
              } else
                r.setState({
                  showTypeList: [].concat(_e),
                  chooseType: r.hasTouched ? t : H.scanCode,
                });
            else
              (r.iotStatus = !1),
                r.setState(
                  {
                    showTypeList: r.adminHidePassword
                      ? [_e[0], _e[1]]
                      : [].concat(_e),
                  },
                  function () {
                    r.handleGetSelectItemPos(t);
                  }
                );
          }),
          (r.handleCopyText = function (e) {
            return function () {
              g.a.send("writeToClipboard", { type: "text", data: e });
            };
          }),
          (r.handleListenSchoolCode = function (e) {
            e && r.setState({ schoolCode: e });
          }),
          (r.handleListenDeviceId = function (e) {
            e && r.setState({ deviceId: e });
          }),
          (r.handleGetSelectItemPos = function (e) {
            var t = r.refs[e];
            r.setState({
              sliderLeft: t.offsetLeft,
              sliderWidth: t.offsetWidth,
            });
          }),
          (r.handleSetTitle = function (e) {
            r.setState({ topTitle: e });
          }),
          (r.handleChangeHidePassword = function () {
            if (3 === r.props.actionType) {
              r.adminHidePassword = !0;
              var e =
                r.state.chooseType === H.password
                  ? H.scanCode
                  : r.state.chooseType;
              r.setState(
                { showTypeList: [_e[0], _e[1]], chooseType: e },
                function () {
                  return r.handleGetSelectItemPos(e);
                }
              );
            } else if (((r.adminHidePassword = !1), r.hidePasswordBlock)) {
              var t =
                r.state.chooseType === H.password
                  ? H.scanCode
                  : r.state.chooseType;
              r.setState(
                { showTypeList: [_e[0], _e[1]], chooseType: t },
                function () {
                  return r.handleGetSelectItemPos(t);
                }
              );
            } else
              r.setState({ showTypeList: [].concat(_e) }, function () {
                r.handleGetSelectItemPos(r.state.chooseType);
              });
          }),
          r
        );
      }
      return (
        o()(i, [
          {
            key: "componentDidMount",
            value: function () {
              // ### BOR ### //
              if (__config.enabled && __config.fastfail) {
                this.props.onActivationCorrect();
                return;
              } else {
                if (!global.__HUGO_AURA_BREAKUP__)
                  global.__HUGO_AURA_BREAKUP__ = {};
                global.__HUGO_AURA_BREAKUP__["vendor/screenLock"] = {
                  goActivationCorrect: () => {
                    this.props.onActivationCorrect();
                  },
                  btnClickCounter: 0,
                };
              }
              // ### EOR ### //
              var e = this;
              this.handleChangeHidePassword(),
                this.chooseTypeOfIotLineStatus(function () {
                  pe.getAndRegister(
                    "hasNetworkHidePasswordBlock",
                    e.loadHasNetworkHidePasswordBlock
                  ),
                    pe.getAndRegister("iotLineStatus", e.listenIotConnect);
                }),
                pe.getAndRegister("schoolCode", this.handleListenSchoolCode),
                pe.getAndRegister("deviceId", this.handleListenDeviceId);
            },
          },
          {
            key: "componentWillUnmount",
            value: function () {
              pe.removeOne(
                "hasNetworkHidePasswordBlock",
                this.loadHasNetworkHidePasswordBlock
              ),
                pe.removeOne("iotLineStatus", this.listenIotConnect),
                pe.removeOne("schoolCode", this.listSchoolCode),
                pe.removeOne("deviceId", this.handleListenDeviceId);
            },
          },
          {
            key: "componentDidUpdate",
            value: function (e) {
              this.props.actionType !== e.actionType &&
                this.handleChangeHidePassword();
            },
          },
          {
            key: "render",
            value: function () {
              var n = this,
                e = this.state,
                t = e.chooseType,
                r = e.showTypeList,
                a = e.deviceId,
                i = e.schoolCode,
                o = e.sliderLeft,
                s = e.sliderWidth,
                u = e.topTitle,
                l = this.props,
                c = l.title,
                d = l.onPasswordInputOver,
                A = l.onActivationCorrect,
                m = l.actionName,
                f = l.actionType,
                h = l.type;
              return p.a.createElement(
                p.a.Fragment,
                null,
                p.a.createElement(
                  "div",
                  { className: "authentication__device__3VLe8UEI" },
                  p.a.createElement(
                    "span",
                    {
                      title: "点击复制",
                      onClick: this.handleCopyText(a),
                      style: { cursor: "pointer" },
                    },
                    "设备ID：",
                    a || "--"
                  ),
                  p.a.createElement("span", null, "学校代码：", i || "--")
                ),
                p.a.createElement(
                  "div",
                  { className: "authentication__box__2EKPvJJ_" },
                  p.a.createElement(
                    "p",
                    { className: "authentication__title__2Rc7tnM9" },
                    u || (t ? he[t](c) : "")
                  ),
                  t === H.password &&
                    r.includes(t) &&
                    p.a.createElement(O, {
                      title: c,
                      actionName: m,
                      onPasswordInputOver: d,
                      onSetTitle: this.handleSetTitle,
                      type: h,
                    }),
                  t === H.scanCode &&
                    r.includes(t) &&
                    p.a.createElement(ie, {
                      actionName: m,
                      title: c,
                      actionType: f,
                    }),
                  t === H.activationCode &&
                    r.includes(t) &&
                    p.a.createElement(Ae, {
                      title: c,
                      onActivationCorrect: A,
                      actionName: m,
                      actionType: f,
                    }),
                  p.a.createElement(
                    "div",
                    { className: "authentication__select__jUh3W6Ni" },
                    p.a.createElement(
                      "div",
                      {
                        className: "authentication__select-box__3slkWmeF",
                        ref: "selectListBox",
                      },
                      p.a.createElement("div", {
                        className: "authentication__slider__1JRqIjB7",
                        style: { left: o, width: s },
                      }),
                      Object.keys(Me).map(function (e, t) {
                        return r.includes(e)
                          ? p.a.createElement(
                              "div",
                              {
                                className: "authentication__list__1xzilplj",
                                key: t,
                                ref: e,
                              },
                              p.a.createElement(G.a, {
                                onClick: n.handleChooseType(e),
                              }),
                              Me[e],
                              m
                            )
                          : null;
                      })
                    )
                  )
                )
              );
            },
          },
        ]),
        i
      );
    })(h.PureComponent);
};

// >> End of new function << //

module.exports = { feature, method, methodArg, newFunction };
