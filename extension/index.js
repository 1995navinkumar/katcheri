(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utils = require("./utils");

var _default = function ConnectionManager() {
  var activeConnection;

  function createConnection(_x, _x2, _x3) {
    return _createConnection.apply(this, arguments);
  }

  function _createConnection() {
    _createConnection = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(url, queryParams, handler) {
      var ws;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return makeConnection(url, queryParams);

            case 2:
              ws = _context.sent;
              activeConnection = new Connection(ws, handler);
              return _context.abrupt("return", activeConnection);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _createConnection.apply(this, arguments);
  }

  function terminateConnection() {
    if (!activeConnection) {
      return;
    }

    ;
    activeConnection.trigger("close");
    activeConnection.close();
    activeConnection = undefined;
    console.log("connection terminated");
  }

  function getConnection() {
    return activeConnection;
  }

  return {
    createConnection: createConnection,
    terminateConnection: terminateConnection,
    getConnection: getConnection
  };
}();

exports["default"] = _default;

function makeConnection(_x4, _x5) {
  return _makeConnection.apply(this, arguments);
}

function _makeConnection() {
  _makeConnection = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(url, queryParams) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var ws = new WebSocket("ws://".concat(url, "?").concat(queryParams));

              ws.onopen = function () {
                console.log("socket connection established ");
                resolve(ws);
              };

              ws.onerror = function (e) {
                console.log("error in connection establishment", e);
                reject(e);
              };

              ws.onclose = function () {
                console.log("socket closed");
              };
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _makeConnection.apply(this, arguments);
}

function Connection(ws, handler) {
  this.ws = ws;
  this.handler = MessageHandler.call(this, handler);
  Object.assign(this, new _utils.EventHandler());
  ws.onmessage = (0, _utils.pipe)(_utils.messageParser, this.handler);
}

Connection.prototype.close = function close() {
  this.ws.close(1000, "logged out");
};

Connection.prototype.signal = function signal(message) {
  this.ws.send(JSON.stringify(message));
};

Connection.prototype.request = function request(message) {
  message.category = "request";
  this.signal(message);
};

Connection.prototype.respond = function respond(to, message) {
  message.category = "response";
  message.data.memberId = to;
  this.signal(message);
};

Connection.prototype.action = function action(message) {
  message.category = "action";
  this.signal(message);
};

Connection.prototype.webrtc = function webrtc(message) {
  message.category = "webrtc";
  this.signal(message);
};

function MessageHandler(categoryMapper) {
  var _this = this;

  return function (message) {
    console.log(message);
    var category = message.category,
        type = message.type,
        data = message.data;

    if (category && type) {
      try {
        return categoryMapper[category][type](_this, data);
      } catch (error) {
        console.log(error);
      }
    }
  };
}

},{"./utils":6,"@babel/runtime/helpers/asyncToGenerator":12,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":32}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _connectionManager = _interopRequireDefault(require("./connection-manager"));

var _rtc = _interopRequireDefault(require("./rtc"));

var _uiHandler = _interopRequireDefault(require("./ui-handler"));

var _peer = _interopRequireDefault(require("./peer"));

chrome.runtime.onMessage.addListener(PopupMessageHandler.call(chrome.runtime, _uiHandler["default"]));

function PopupMessageHandler(pageMapper) {
  var _this = this;

  return function (message) {
    console.log(message);
    var page = message.page,
        type = message.type;
    return pageMapper[page][type](_this, message.data);
  };
}

window.url = "localhost:8080";
window.queryParams = new URLSearchParams({
  email: "1995navinkumar@gmail.com"
}).toString();
window.ConnectionManager = _connectionManager["default"];

},{"./connection-manager":1,"./peer":3,"./rtc":4,"./ui-handler":5,"@babel/runtime/helpers/interopRequireDefault":18}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAudioTag = getAudioTag;
exports.getAudioStream = getAudioStream;
var audioStream;
var servers = {
  urls: "stun:stun1.l.google.com:19302"
};
var turnServer = {
  urls: 'turn:192.158.29.39:3478?transport=udp',
  credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  username: '28224511:1379330808'
};
var iceServers = [servers, turnServer];
var peer,
    partyMembers = {};

function reset() {
  if (peer) {
    peer.close();
    peer = undefined;
  }

  if (Object.keys(partyMembers).length > 0) {
    partyMembers.forEach(function (peerCon) {
      peerCon.close();
    });
    partyMembers = {};
  }
}

function getAudioTag() {
  var window = chrome.extension.getViews({
    type: "popup"
  })[0];
  return window.document.getElementById("audio-player");
}

function getAudioStream() {
  if (!audioStream) {
    audioStream = new Promise(function (resolve, reject) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        chrome.tabCapture.capture({
          audio: true
        }, function (stream) {
          var audioTag = getAudioTag();
          audioTag.srcObject = stream;
          audioStream = stream;
          console.log(audioStream);
          resolve(stream);
        });
      });
    });
  }

  return audioStream;
}

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _utils = require("./utils");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var log = console.log;

var RTC_Connnector = /*#__PURE__*/function (_EventTarget) {
  (0, _inherits2["default"])(RTC_Connnector, _EventTarget);

  var _super = _createSuper(RTC_Connnector);

  /**
   * @param {Object} iceServers 
   * @param {Object} peerEvents Set of actions that has to be called during the peer transmissions
   * @param {function} peerEvents.onicecandidate
   * @param {function} peerEvents.ontrack
   * @param {function} peerEvents.onnegotiationneeded  
   */
  function RTC_Connnector(iceServers, streams) {
    var _this;

    var peerEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck2["default"])(this, RTC_Connnector);

    /**
     * @property {RTCPeerConnection} rtcPeer rtc peer instance which is used to initiate a communication with other peers 
     */
    _this = _super.call(this);
    _this.constraints = {
      audio: true
    };
    _this.rtcPeer = new RTCPeerConnection({
      iceServers: iceServers
    });
    var eventHandler = new _utils.EventHandler();
    _this.on = eventHandler.on;
    _this.off = eventHandler.off;
    _this.trigger = eventHandler.trigger;
    _this.events = eventHandler.events;
    console.log(_this.rtcPeer);
    _this.rtcPeer.onnegotiationneeded = _this._initiateConnection.bind((0, _assertThisInitialized2["default"])(_this));
    _this.rtcPeer.ontrack = _this._ontrack.bind((0, _assertThisInitialized2["default"])(_this));
    _this.rtcPeer.onicecandidate = _this._onicecandidate.bind((0, _assertThisInitialized2["default"])(_this));

    if (streams) {
      var _iterator = _createForOfIteratorHelper(streams.getTracks()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var track = _step.value;

          _this.rtcPeer.addTrack(track, streams);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    return _this;
  }

  (0, _createClass2["default"])(RTC_Connnector, [{
    key: "_ontrack",
    value: function _ontrack(event) {
      log("track added in rtc");
      this.trigger("streamReady", event);
    }
  }, {
    key: "_initiateConnection",
    value: function () {
      var _initiateConnection2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var offer;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                log("Negotiation started");
                _context.next = 4;
                return this.rtcPeer.createOffer(this.constraints);

              case 4:
                offer = _context.sent;

                if (!(this.rtcPeer.signalingState != "stable")) {
                  _context.next = 8;
                  break;
                }

                log("     -- The connection isn't stable yet; postponing...");
                return _context.abrupt("return");

              case 8:
                log("Setting to local description");
                _context.next = 11;
                return this.rtcPeer.setLocalDescription(offer);

              case 11:
                this.trigger("offerReady", this.rtcPeer.localDescription);
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);
                log("Failed in Negotiation ".concat(_context.t0));

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 14]]);
      }));

      function _initiateConnection() {
        return _initiateConnection2.apply(this, arguments);
      }

      return _initiateConnection;
    }()
  }, {
    key: "acceptOffer",
    value: function () {
      var _acceptOffer = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(offer) {
        var desc, answer;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                desc = new RTCSessionDescription(offer); // If the connection isn't stable yet, wait for it...

                if (!(this.rtcPeer.signalingState != "stable")) {
                  _context2.next = 8;
                  break;
                }

                log("  - But the signaling state isn't stable, so triggering rollback"); // Set the local and remove descriptions for rollback; don't proceed
                // until both return.

                _context2.next = 5;
                return Promise.all([this.rtcPeer.setLocalDescription({
                  type: "rollback"
                }), this.rtcPeer.setRemoteDescription(desc)]);

              case 5:
                return _context2.abrupt("return");

              case 8:
                log("  - Setting remote description");
                _context2.next = 11;
                return this.rtcPeer.setRemoteDescription(desc);

              case 11:
                _context2.next = 13;
                return this.rtcPeer.createAnswer(this.constraints);

              case 13:
                answer = _context2.sent;
                this.rtcPeer.setLocalDescription(answer);
                this.trigger("answerReady", this.rtcPeer.localDescription);

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function acceptOffer(_x) {
        return _acceptOffer.apply(this, arguments);
      }

      return acceptOffer;
    }()
  }, {
    key: "setAnswer",
    value: function setAnswer(answer) {
      var desc = new RTCSessionDescription(answer);
      this.rtcPeer.setRemoteDescription(desc).then(function (_) {
        log("Master Remote Description is set");
      });
    }
  }, {
    key: "setRemoteCandidate",
    value: function setRemoteCandidate(candidate) {
      if (this.rtcPeer.remoteDescription) {
        var candidate = new RTCIceCandidate(candidate);
        log("Adding received ICE candidate");
        this.rtcPeer.addIceCandidate(candidate);
      }
    }
  }, {
    key: "_onicecandidate",
    value: function _onicecandidate(event) {
      log("ice candidate handling");

      if (event.candidate) {
        this.trigger("candidateReady", event.candidate);
      }
    }
  }]);
  return RTC_Connnector;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(EventTarget));

exports["default"] = RTC_Connnector;

},{"./utils":6,"@babel/runtime/helpers/assertThisInitialized":11,"@babel/runtime/helpers/asyncToGenerator":12,"@babel/runtime/helpers/classCallCheck":13,"@babel/runtime/helpers/createClass":15,"@babel/runtime/helpers/getPrototypeOf":16,"@babel/runtime/helpers/inherits":17,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/possibleConstructorReturn":25,"@babel/runtime/helpers/wrapNativeSuper":31,"@babel/runtime/regenerator":32}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _wsHandler = _interopRequireDefault(require("./ws-handler"));

function getUserProfile() {
  return _getUserProfile.apply(this, arguments);
}

function _getUserProfile() {
  _getUserProfile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              chrome.identity.getProfileUserInfo(resolve);
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getUserProfile.apply(this, arguments);
}

var login = {
  login: function login(popup, data) {
    getUserProfile().then(function (profile) {
      var url = localStorage.getItem("signalling") || "localhost:8080";
      var queryParams = new URLSearchParams({
        email: profile.email
      }).toString();
      ConnectionManager.createConnection(url, queryParams, _wsHandler["default"]).then(function (connection) {
        console.log(connection);
        popup.sendMessage({
          page: "login",
          type: "login-success"
        });
      });
    });
  },
  logout: function logout(popup, data) {
    ConnectionManager.terminateConnection();
    popup.sendMessage({
      page: "login",
      type: "logout-success"
    });
  }
};
var home = {
  "create-party": function createParty(popup, data) {
    ConnectionManager.getConnection().request({
      type: "create-party",
      data: data
    });
  },
  "join-party": function joinParty(popup, data) {
    ConnectionManager.getConnection().request({
      type: "join-party",
      data: data
    });
  }
};
var party = {
  "become-dj": function becomeDj() {
    ConnectionManager.getConnection().request({
      type: "become-dj"
    });
  }
};
var _default = {
  login: login,
  home: home,
  party: party
};
exports["default"] = _default;

},{"./ws-handler":7,"@babel/runtime/helpers/asyncToGenerator":12,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":32}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuid = uuid;
exports.messageParser = messageParser;
exports.EventHandler = EventHandler;
exports.pipe = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function uuid() {
  return Math.random().toString(36).substr(2, 9);
}

var pipe = function pipe() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (x) {
    return fns.reduce(function (y, f) {
      return f(y);
    }, x);
  };
};

exports.pipe = pipe;

function messageParser(message) {
  return JSON.parse(message.data);
}

function EventHandler() {
  var eventHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var events = {};

  function off(eventName) {
    events[eventName] = undefined;
  }

  function trigger(eventName) {
    var _this = this;

    var callbacks = events[eventName] || [];
    var args = Array.prototype.slice.call(arguments, 1);
    callbacks.forEach(function (callback) {
      return setTimeout(function () {
        callback.call.apply(callback, [_this].concat((0, _toConsumableArray2["default"])(args)));
      }, 0);
    });
  }

  function on(eventName, callback) {
    var event = events[eventName];

    if (!event) {
      event = [];
      events[eventName] = event;
    }

    event.push(callback);
  }

  function getEvents() {
    return events;
  }

  var composedEventHandler = {
    on: on,
    off: off,
    trigger: trigger,
    getEvents: getEvents
  };
  assignEvents.call(composedEventHandler, eventHandler);
  return composedEventHandler;
}

function assignEvents(eventHandler) {
  var _this2 = this;

  var keys = Object.keys(eventHandler);

  if (keys.length > 0) {
    keys.forEach(function (eventName) {
      _this2.getEvents()[eventName] = [];
      var callback = eventHandler[eventName];

      _this2.on(eventName, callback);
    }, this);
  }
}

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/toConsumableArray":28}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _peer = require("./peer");

var _rtc = _interopRequireDefault(require("./rtc"));

var _connectionManager = _interopRequireDefault(require("./connection-manager"));

var audioStream,
    peer,
    partyMembers = {};
var servers = {
  urls: "stun:stun1.l.google.com:19302"
};
var turnServer = {
  urls: 'turn:192.158.29.39:3478?transport=udp',
  credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  username: '28224511:1379330808'
};
var iceServers = [servers, turnServer];
var webrtc = {
  "dj-accept": function djAccept() {
    audioStream = (0, _peer.getAudioStream)();
  },
  "join-party": function () {
    var _joinParty = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
      var clientIds, streamObj, connection;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              clientIds = data.memberIds;
              _context.next = 3;
              return audioStream;

            case 3:
              streamObj = _context.sent;
              connection = _connectionManager["default"].getConnection();
              clientIds.forEach(function (memberId) {
                var clientPeer = new _rtc["default"](iceServers, streamObj);
                partyMembers[memberId] = clientPeer;
                clientPeer.on('offerReady', function (offer) {
                  connection.webrtc({
                    type: "offer",
                    data: {
                      offer: offer,
                      memberId: memberId
                    }
                  });
                });
                clientPeer.on('candidateReady', function (candidate) {
                  connection.webrtc({
                    type: "candidate",
                    data: {
                      candidate: candidate,
                      memberId: memberId
                    }
                  });
                });
              });

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function joinParty(_x) {
      return _joinParty.apply(this, arguments);
    }

    return joinParty;
  }(),
  "offer": function offer(message) {
    peer = new _rtc["default"](iceServers);
    var memberId = message.data.memberId;

    var connection = _connectionManager["default"].getConnection();

    peer.on('answerReady', function (answer) {
      connection.webrtc({
        type: "answer",
        data: {
          answer: answer,
          memberId: memberId
        }
      });
    });
    peer.on('candidateReady', function (candidate) {
      connection.webrtc({
        type: "candidate",
        data: {
          candidate: candidate,
          memberId: memberId
        }
      });
    });
    peer.on("streamReady", function (_ref) {
      var _ref$streams = (0, _slicedToArray2["default"])(_ref.streams, 1),
          stream = _ref$streams[0];

      console.log("streamReady");
      (0, _peer.getAudioTag)().srcObject = stream;
    });
    peer.acceptOffer(message.data.offer);
  },
  "answer": function answer(message) {
    var memberId = message.data.memberId;
    var clientPeer = partyMembers[memberId];
    clientPeer.setAnswer(message.data.answer);
  },
  "candidate": function candidate(message) {
    var memberId = message.data.memberId;
    var clientPeer = partyMembers[memberId] || peer;
    clientPeer.setRemoteCandidate(message.data.candidate);
  }
};
var response = {
  "party-creation-success": function partyCreationSuccess(connection, data) {
    chrome.runtime.sendMessage({
      page: "home",
      type: "party-creation-success",
      data: data
    });
  },
  "join-party-success": function joinPartySuccess(connection, data) {
    chrome.runtime.sendMessage({
      page: "home",
      type: "join-party-success",
      data: data
    });
  },
  "dj-accept": function djAccept() {
    audioStream = (0, _peer.getAudioStream)();
  }
};
var notification = {
  "join-party": function () {
    var _joinParty2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(connection, data) {
      var clientIds, streamObj;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log(data);
              connection = _connectionManager["default"].getConnection();
              clientIds = data.memberIds;
              _context2.next = 5;
              return audioStream;

            case 5:
              streamObj = _context2.sent;
              clientIds.forEach(function (memberId) {
                var clientPeer = new _rtc["default"](iceServers, streamObj);
                partyMembers[memberId] = clientPeer;
                clientPeer.on('offerReady', function (offer) {
                  connection.webrtc({
                    type: "offer",
                    data: {
                      offer: offer,
                      memberId: memberId
                    }
                  });
                });
                clientPeer.on('candidateReady', function (candidate) {
                  connection.webrtc({
                    type: "candidate",
                    data: {
                      candidate: candidate,
                      memberId: memberId
                    }
                  });
                });
              });

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    function joinParty(_x2, _x3) {
      return _joinParty2.apply(this, arguments);
    }

    return joinParty;
  }()
}; // var webrtc = {
//     candidate: function candidate(connection, data) {
//         var { candidate, memberId } = data;
//         peer.setRemoteCandidate(candidate);
//     },
//     answer: function answer(connection, data) {
//         var { answer, memberId } = data;
//         peer.setAnswer(answer);
//     },
//     offer: function offer(connection, data) {
//         var { offer, memberId } = data;
//         peer.acceptOffer(offer);
//     }
// }

var _default = {
  response: response,
  notification: notification,
  webrtc: webrtc
};
exports["default"] = _default;

},{"./connection-manager":1,"./peer":3,"./rtc":4,"@babel/runtime/helpers/asyncToGenerator":12,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/slicedToArray":27,"@babel/runtime/regenerator":32}],8:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
},{}],9:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],10:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
},{"./arrayLikeToArray":8}],11:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],12:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],13:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],14:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

var isNativeReflectConstruct = require("./isNativeReflectConstruct");

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;
},{"./isNativeReflectConstruct":20,"./setPrototypeOf":26}],15:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],16:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],17:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
},{"./setPrototypeOf":26}],18:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],19:[function(require,module,exports){
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;
},{}],20:[function(require,module,exports){
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;
},{}],21:[function(require,module,exports){
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],22:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],23:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
},{}],24:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
},{}],25:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"../helpers/typeof":29,"./assertThisInitialized":11}],26:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],27:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":9,"./iterableToArrayLimit":22,"./nonIterableRest":23,"./unsupportedIterableToArray":30}],28:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":10,"./iterableToArray":21,"./nonIterableSpread":24,"./unsupportedIterableToArray":30}],29:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],30:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
},{"./arrayLikeToArray":8}],31:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf");

var setPrototypeOf = require("./setPrototypeOf");

var isNativeFunction = require("./isNativeFunction");

var construct = require("./construct");

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

module.exports = _wrapNativeSuper;
},{"./construct":14,"./getPrototypeOf":16,"./isNativeFunction":19,"./setPrototypeOf":26}],32:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":33}],33:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleHRlbnNpb24vYmFja2dyb3VuZC9jb25uZWN0aW9uLW1hbmFnZXIuanMiLCJleHRlbnNpb24vYmFja2dyb3VuZC9pbmRleC5qcyIsImV4dGVuc2lvbi9iYWNrZ3JvdW5kL3BlZXIuanMiLCJleHRlbnNpb24vYmFja2dyb3VuZC9ydGMuanMiLCJleHRlbnNpb24vYmFja2dyb3VuZC91aS1oYW5kbGVyLmpzIiwiZXh0ZW5zaW9uL2JhY2tncm91bmQvdXRpbHMuanMiLCJleHRlbnNpb24vYmFja2dyb3VuZC93cy1oYW5kbGVyLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXJyYXlMaWtlVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXJyYXlXaXRob3V0SG9sZXMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXRlcmFibGVUb0FycmF5TGltaXQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9ub25JdGVyYWJsZVJlc3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9ub25JdGVyYWJsZVNwcmVhZC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4uanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zZXRQcm90b3R5cGVPZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvd3JhcE5hdGl2ZVN1cGVyLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyJdLCJu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O0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IEV2ZW50SGFuZGxlciwgcGlwZSwgbWVzc2FnZVBhcnNlciB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gQ29ubmVjdGlvbk1hbmFnZXIoKSB7XG4gICAgdmFyIGFjdGl2ZUNvbm5lY3Rpb247XG4gICAgYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zLCBoYW5kbGVyKSB7XG4gICAgICAgIHZhciB3cyA9IGF3YWl0IG1ha2VDb25uZWN0aW9uKHVybCwgcXVlcnlQYXJhbXMpO1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24od3MsIGhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gYWN0aXZlQ29ubmVjdGlvbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdGVybWluYXRlQ29ubmVjdGlvbigpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVDb25uZWN0aW9uKSB7IHJldHVybiB9O1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uLnRyaWdnZXIoXCJjbG9zZVwiKTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Rpb24gdGVybWluYXRlZFwiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0Q29ubmVjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNvbm5lY3Rpb247XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0ZUNvbm5lY3Rpb24sXG4gICAgICAgIHRlcm1pbmF0ZUNvbm5lY3Rpb24sXG4gICAgICAgIGdldENvbm5lY3Rpb25cbiAgICB9XG59KSgpO1xuXG5hc3luYyBmdW5jdGlvbiBtYWtlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdmFyIHdzID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke3VybH0/JHtxdWVyeVBhcmFtc31gKTtcbiAgICAgICAgd3Mub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY29ubmVjdGlvbiBlc3RhYmxpc2hlZCBcIik7XG4gICAgICAgICAgICByZXNvbHZlKHdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgd3Mub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yIGluIGNvbm5lY3Rpb24gZXN0YWJsaXNobWVudFwiLCBlKTtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICB3cy5vbmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY2xvc2VkXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIENvbm5lY3Rpb24od3MsIGhhbmRsZXIpIHtcbiAgICB0aGlzLndzID0gd3M7XG4gICAgdGhpcy5oYW5kbGVyID0gTWVzc2FnZUhhbmRsZXIuY2FsbCh0aGlzLCBoYW5kbGVyKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIG5ldyBFdmVudEhhbmRsZXIoKSk7XG4gICAgd3Mub25tZXNzYWdlID0gcGlwZShtZXNzYWdlUGFyc2VyLCB0aGlzLmhhbmRsZXIpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIHRoaXMud3MuY2xvc2UoMTAwMCwgXCJsb2dnZWQgb3V0XCIpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5zaWduYWwgPSBmdW5jdGlvbiBzaWduYWwobWVzc2FnZSkge1xuICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSlcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuY2F0ZWdvcnkgPSBcInJlcXVlc3RcIjtcbiAgICB0aGlzLnNpZ25hbChtZXNzYWdlKTtcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUucmVzcG9uZCA9IGZ1bmN0aW9uIHJlc3BvbmQodG8sIG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmNhdGVnb3J5ID0gXCJyZXNwb25zZVwiO1xuICAgIG1lc3NhZ2UuZGF0YS5tZW1iZXJJZCA9IHRvO1xuICAgIHRoaXMuc2lnbmFsKG1lc3NhZ2UpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbiBhY3Rpb24obWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuY2F0ZWdvcnkgPSBcImFjdGlvblwiO1xuICAgIHRoaXMuc2lnbmFsKG1lc3NhZ2UpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS53ZWJydGMgPSBmdW5jdGlvbiB3ZWJydGMobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuY2F0ZWdvcnkgPSBcIndlYnJ0Y1wiO1xuICAgIHRoaXMuc2lnbmFsKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiBNZXNzYWdlSGFuZGxlcihjYXRlZ29yeU1hcHBlcikge1xuICAgIHJldHVybiAobWVzc2FnZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgdmFyIHsgY2F0ZWdvcnksIHR5cGUsIGRhdGEgfSA9IG1lc3NhZ2U7XG4gICAgICAgIGlmIChjYXRlZ29yeSAmJiB0eXBlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXRlZ29yeU1hcHBlcltjYXRlZ29yeV1bdHlwZV0odGhpcywgZGF0YSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgQ29ubmVjdGlvbk1hbmFnZXIgZnJvbSAnLi9jb25uZWN0aW9uLW1hbmFnZXInO1xuaW1wb3J0IFJUQ0Nvbm5lY3RvciBmcm9tICcuL3J0Yyc7XG5pbXBvcnQgdWlIYW5kbGVyIGZyb20gJy4vdWktaGFuZGxlcic7XG5pbXBvcnQgUGVlciBmcm9tICcuL3BlZXInO1xuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoUG9wdXBNZXNzYWdlSGFuZGxlci5jYWxsKGNocm9tZS5ydW50aW1lLCB1aUhhbmRsZXIpKTtcblxuZnVuY3Rpb24gUG9wdXBNZXNzYWdlSGFuZGxlcihwYWdlTWFwcGVyKSB7XG4gICAgcmV0dXJuIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB2YXIgeyBwYWdlLCB0eXBlIH0gPSBtZXNzYWdlO1xuICAgICAgICByZXR1cm4gcGFnZU1hcHBlcltwYWdlXVt0eXBlXSh0aGlzLCBtZXNzYWdlLmRhdGEpO1xuICAgIH1cbn1cblxud2luZG93LnVybCA9IFwibG9jYWxob3N0OjgwODBcIjtcbndpbmRvdy5xdWVyeVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoeyBlbWFpbDogXCIxOTk1bmF2aW5rdW1hckBnbWFpbC5jb21cIiB9KS50b1N0cmluZygpO1xud2luZG93LkNvbm5lY3Rpb25NYW5hZ2VyID0gQ29ubmVjdGlvbk1hbmFnZXI7XG5cblxuXG4iLCJ2YXIgYXVkaW9TdHJlYW07XG5cbmNvbnN0IHNlcnZlcnMgPSB7XG4gICAgdXJsczogXCJzdHVuOnN0dW4xLmwuZ29vZ2xlLmNvbToxOTMwMlwiXG59XG5cbmNvbnN0IHR1cm5TZXJ2ZXIgPSB7XG4gICAgdXJsczogJ3R1cm46MTkyLjE1OC4yOS4zOTozNDc4P3RyYW5zcG9ydD11ZHAnLFxuICAgIGNyZWRlbnRpYWw6ICdKWkVPRXQyVjNRYjB5MjdHUm50dDJ1MlBBWUE9JyxcbiAgICB1c2VybmFtZTogJzI4MjI0NTExOjEzNzkzMzA4MDgnXG59XG5cbmNvbnN0IGljZVNlcnZlcnMgPSBbc2VydmVycywgdHVyblNlcnZlcl07XG5cbnZhciBwZWVyLCBwYXJ0eU1lbWJlcnMgPSB7fTtcblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgaWYgKHBlZXIpIHtcbiAgICAgICAgcGVlci5jbG9zZSgpO1xuICAgICAgICBwZWVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMocGFydHlNZW1iZXJzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhcnR5TWVtYmVycy5mb3JFYWNoKHBlZXJDb24gPT4ge1xuICAgICAgICAgICAgcGVlckNvbi5jbG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgICBwYXJ0eU1lbWJlcnMgPSB7fTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdWRpb1RhZygpIHtcbiAgICB2YXIgd2luZG93ID0gY2hyb21lLmV4dGVuc2lvbi5nZXRWaWV3cyh7IHR5cGU6IFwicG9wdXBcIiB9KVswXTtcbiAgICByZXR1cm4gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaW8tcGxheWVyXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXVkaW9TdHJlYW0oKSB7XG4gICAgaWYgKCFhdWRpb1N0cmVhbSkge1xuICAgICAgICBhdWRpb1N0cmVhbSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0sICh0YWJzKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYkNhcHR1cmUuY2FwdHVyZSh7IGF1ZGlvOiB0cnVlIH0sIChzdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF1ZGlvVGFnID0gZ2V0QXVkaW9UYWcoKTtcbiAgICAgICAgICAgICAgICAgICAgYXVkaW9UYWcuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgICBhdWRpb1N0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXVkaW9TdHJlYW0pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0cmVhbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIGF1ZGlvU3RyZWFtO1xufVxuIiwiLyoqXG4gKiBVc2VkIGZvciBhYnN0cmFjdGlvbiBvZiB3ZWJydGMgaW1wbGVtZW50YXRpb25zXG4gKiBAbW9kdWxlIFJUQ19Db25ubmVjdG9yXG4gKiBAZXh0ZW5kcyBFdmVudFRhcmdldFxuICovXG5cbmltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4vdXRpbHMnO1xuXG52YXIgbG9nID0gY29uc29sZS5sb2c7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSVENfQ29ubm5lY3RvciBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpY2VTZXJ2ZXJzIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwZWVyRXZlbnRzIFNldCBvZiBhY3Rpb25zIHRoYXQgaGFzIHRvIGJlIGNhbGxlZCBkdXJpbmcgdGhlIHBlZXIgdHJhbnNtaXNzaW9uc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHBlZXJFdmVudHMub25pY2VjYW5kaWRhdGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwZWVyRXZlbnRzLm9udHJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwZWVyRXZlbnRzLm9ubmVnb3RpYXRpb25uZWVkZWQgIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGljZVNlcnZlcnMsIHN0cmVhbXMsIHBlZXJFdmVudHMgPSB7fSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtSVENQZWVyQ29ubmVjdGlvbn0gcnRjUGVlciBydGMgcGVlciBpbnN0YW5jZSB3aGljaCBpcyB1c2VkIHRvIGluaXRpYXRlIGEgY29tbXVuaWNhdGlvbiB3aXRoIG90aGVyIHBlZXJzIFxuICAgICAgICAgKi9cbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IHtcbiAgICAgICAgICAgIGF1ZGlvOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucnRjUGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7XG4gICAgICAgICAgICBpY2VTZXJ2ZXJzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMub24gPSBldmVudEhhbmRsZXIub247XG4gICAgICAgIHRoaXMub2ZmID0gZXZlbnRIYW5kbGVyLm9mZjtcbiAgICAgICAgdGhpcy50cmlnZ2VyID0gZXZlbnRIYW5kbGVyLnRyaWdnZXI7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gZXZlbnRIYW5kbGVyLmV2ZW50cztcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJ0Y1BlZXIpO1xuXG5cbiAgICAgICAgdGhpcy5ydGNQZWVyLm9ubmVnb3RpYXRpb25uZWVkZWQgPSB0aGlzLl9pbml0aWF0ZUNvbm5lY3Rpb24uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ydGNQZWVyLm9udHJhY2sgPSB0aGlzLl9vbnRyYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucnRjUGVlci5vbmljZWNhbmRpZGF0ZSA9IHRoaXMuX29uaWNlY2FuZGlkYXRlLmJpbmQodGhpcyk7XG5cbiAgICAgICAgaWYgKHN0cmVhbXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJhY2sgb2Ygc3RyZWFtcy5nZXRUcmFja3MoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucnRjUGVlci5hZGRUcmFjayh0cmFjaywgc3RyZWFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb250cmFjayhldmVudCkge1xuICAgICAgICBsb2coXCJ0cmFjayBhZGRlZCBpbiBydGNcIik7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcInN0cmVhbVJlYWR5XCIsIGV2ZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBfaW5pdGlhdGVDb25uZWN0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nKFwiTmVnb3RpYXRpb24gc3RhcnRlZFwiKTtcbiAgICAgICAgICAgIGNvbnN0IG9mZmVyID0gYXdhaXQgdGhpcy5ydGNQZWVyLmNyZWF0ZU9mZmVyKHRoaXMuY29uc3RyYWludHMpO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgY29ubmVjdGlvbiBoYXNuJ3QgeWV0IGFjaGlldmVkIHRoZSBcInN0YWJsZVwiIHN0YXRlLFxuICAgICAgICAgICAgLy8gcmV0dXJuIHRvIHRoZSBjYWxsZXIuIEFub3RoZXIgbmVnb3RpYXRpb25uZWVkZWQgZXZlbnRcbiAgICAgICAgICAgIC8vIHdpbGwgYmUgZmlyZWQgd2hlbiB0aGUgc3RhdGUgc3RhYmlsaXplcy5cbiAgICAgICAgICAgIGlmICh0aGlzLnJ0Y1BlZXIuc2lnbmFsaW5nU3RhdGUgIT0gXCJzdGFibGVcIikge1xuICAgICAgICAgICAgICAgIGxvZyhcIiAgICAgLS0gVGhlIGNvbm5lY3Rpb24gaXNuJ3Qgc3RhYmxlIHlldDsgcG9zdHBvbmluZy4uLlwiKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nKFwiU2V0dGluZyB0byBsb2NhbCBkZXNjcmlwdGlvblwiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnRjUGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwib2ZmZXJSZWFkeVwiLCB0aGlzLnJ0Y1BlZXIubG9jYWxEZXNjcmlwdGlvbik7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZyhgRmFpbGVkIGluIE5lZ290aWF0aW9uICR7ZXJyb3J9YClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGFjY2VwdE9mZmVyKG9mZmVyKSB7XG4gICAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihvZmZlcik7XG5cbiAgICAgICAgLy8gSWYgdGhlIGNvbm5lY3Rpb24gaXNuJ3Qgc3RhYmxlIHlldCwgd2FpdCBmb3IgaXQuLi5cblxuICAgICAgICBpZiAodGhpcy5ydGNQZWVyLnNpZ25hbGluZ1N0YXRlICE9IFwic3RhYmxlXCIpIHtcbiAgICAgICAgICAgIGxvZyhcIiAgLSBCdXQgdGhlIHNpZ25hbGluZyBzdGF0ZSBpc24ndCBzdGFibGUsIHNvIHRyaWdnZXJpbmcgcm9sbGJhY2tcIik7XG5cbiAgICAgICAgICAgIC8vIFNldCB0aGUgbG9jYWwgYW5kIHJlbW92ZSBkZXNjcmlwdGlvbnMgZm9yIHJvbGxiYWNrOyBkb24ndCBwcm9jZWVkXG4gICAgICAgICAgICAvLyB1bnRpbCBib3RoIHJldHVybi5cbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicm9sbGJhY2tcIlxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRoaXMucnRjUGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihkZXNjKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2coXCIgIC0gU2V0dGluZyByZW1vdGUgZGVzY3JpcHRpb25cIik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ0Y1BlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24oZGVzYyk7XG5cbiAgICAgICAgICAgIGxldCBhbnN3ZXIgPSBhd2FpdCB0aGlzLnJ0Y1BlZXIuY3JlYXRlQW5zd2VyKHRoaXMuY29uc3RyYWludHMpO1xuICAgICAgICAgICAgdGhpcy5ydGNQZWVyLnNldExvY2FsRGVzY3JpcHRpb24oYW5zd2VyKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiYW5zd2VyUmVhZHlcIiwgdGhpcy5ydGNQZWVyLmxvY2FsRGVzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0QW5zd2VyKGFuc3dlcikge1xuICAgICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oYW5zd2VyKTtcbiAgICAgICAgdGhpcy5ydGNQZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKGRlc2MpLnRoZW4oXyA9PiB7XG4gICAgICAgICAgICBsb2coXCJNYXN0ZXIgUmVtb3RlIERlc2NyaXB0aW9uIGlzIHNldFwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVtb3RlQ2FuZGlkYXRlKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5ydGNQZWVyLnJlbW90ZURlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gbmV3IFJUQ0ljZUNhbmRpZGF0ZShjYW5kaWRhdGUpO1xuICAgICAgICAgICAgbG9nKFwiQWRkaW5nIHJlY2VpdmVkIElDRSBjYW5kaWRhdGVcIik7XG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbmljZWNhbmRpZGF0ZShldmVudCkge1xuICAgICAgICBsb2coXCJpY2UgY2FuZGlkYXRlIGhhbmRsaW5nXCIpO1xuICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJjYW5kaWRhdGVSZWFkeVwiLCBldmVudC5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgfVxufSIsIlxuaW1wb3J0IHdzSGFuZGxlciBmcm9tICcuL3dzLWhhbmRsZXInO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRVc2VyUHJvZmlsZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjaHJvbWUuaWRlbnRpdHkuZ2V0UHJvZmlsZVVzZXJJbmZvKHJlc29sdmUpO1xuICAgIH0pXG59XG5cbnZhciBsb2dpbiA9IHtcbiAgICBsb2dpbjogZnVuY3Rpb24gbG9naW4ocG9wdXAsIGRhdGEpIHtcbiAgICAgICAgZ2V0VXNlclByb2ZpbGUoKS50aGVuKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgdmFyIHVybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2lnbmFsbGluZ1wiKSB8fCBcImxvY2FsaG9zdDo4MDgwXCI7XG4gICAgICAgICAgICB2YXIgcXVlcnlQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgZW1haWw6IHByb2ZpbGUuZW1haWwgfSkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIENvbm5lY3Rpb25NYW5hZ2VyLmNyZWF0ZUNvbm5lY3Rpb24odXJsLCBxdWVyeVBhcmFtcywgd3NIYW5kbGVyKS50aGVuKGNvbm5lY3Rpb24gPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgICAgIHBvcHVwLnNlbmRNZXNzYWdlKHsgcGFnZTogXCJsb2dpblwiLCB0eXBlOiBcImxvZ2luLXN1Y2Nlc3NcIiB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIGxvZ291dDogZnVuY3Rpb24gbG9nb3V0KHBvcHVwLCBkYXRhKSB7XG4gICAgICAgIENvbm5lY3Rpb25NYW5hZ2VyLnRlcm1pbmF0ZUNvbm5lY3Rpb24oKTtcbiAgICAgICAgcG9wdXAuc2VuZE1lc3NhZ2UoeyBwYWdlOiBcImxvZ2luXCIsIHR5cGU6IFwibG9nb3V0LXN1Y2Nlc3NcIiB9KTtcbiAgICB9XG59XG5cbnZhciBob21lID0ge1xuICAgIFwiY3JlYXRlLXBhcnR5XCI6IGZ1bmN0aW9uIChwb3B1cCwgZGF0YSkge1xuICAgICAgICBDb25uZWN0aW9uTWFuYWdlci5nZXRDb25uZWN0aW9uKCkucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiBcImNyZWF0ZS1wYXJ0eVwiLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFwiam9pbi1wYXJ0eVwiOiBmdW5jdGlvbiAocG9wdXAsIGRhdGEpIHtcbiAgICAgICAgQ29ubmVjdGlvbk1hbmFnZXIuZ2V0Q29ubmVjdGlvbigpLnJlcXVlc3Qoe1xuICAgICAgICAgICAgdHlwZTogXCJqb2luLXBhcnR5XCIsXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG52YXIgcGFydHkgPSB7XG4gICAgXCJiZWNvbWUtZGpcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICBDb25uZWN0aW9uTWFuYWdlci5nZXRDb25uZWN0aW9uKCkucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiBcImJlY29tZS1kalwiLFxuICAgICAgICB9KVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGxvZ2luLFxuICAgIGhvbWUsXG4gICAgcGFydHlcbn0iLCJleHBvcnQgZnVuY3Rpb24gdXVpZCgpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpO1xufVxuXG5leHBvcnQgY29uc3QgcGlwZSA9ICguLi5mbnMpID0+IHggPT4gZm5zLnJlZHVjZSgoeSwgZikgPT4gZih5KSwgeCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlUGFyc2VyKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKGV2ZW50SGFuZGxlciA9IHt9KSB7XG4gICAgdmFyIGV2ZW50cyA9IHt9O1xuXG5cbiAgICBmdW5jdGlvbiBvZmYoZXZlbnROYW1lKSB7XG4gICAgICAgIGV2ZW50c1tldmVudE5hbWVdID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyaWdnZXIoZXZlbnROYW1lKSB7XG4gICAgICAgIHZhciBjYWxsYmFja3MgPSBldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBjYWxsYmFja3MuZm9yRWFjaChjYWxsYmFjayA9PiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgICAgIH0sIDApKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgICAgICBldmVudCA9IFtdO1xuICAgICAgICAgICAgZXZlbnRzW2V2ZW50TmFtZV0gPSBldmVudDtcbiAgICAgICAgfVxuICAgICAgICBldmVudC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICAgIHJldHVybiBldmVudHM7XG4gICAgfVxuXG4gICAgdmFyIGNvbXBvc2VkRXZlbnRIYW5kbGVyID0ge1xuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICB0cmlnZ2VyLFxuICAgICAgICBnZXRFdmVudHNcbiAgICB9XG5cbiAgICBhc3NpZ25FdmVudHMuY2FsbChjb21wb3NlZEV2ZW50SGFuZGxlciwgZXZlbnRIYW5kbGVyKTtcblxuICAgIHJldHVybiBjb21wb3NlZEV2ZW50SGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gYXNzaWduRXZlbnRzKGV2ZW50SGFuZGxlcikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZXZlbnRIYW5kbGVyKTtcbiAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGtleXMuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRFdmVudHMoKVtldmVudE5hbWVdID0gW107XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBldmVudEhhbmRsZXJbZXZlbnROYW1lXTtcbiAgICAgICAgICAgIHRoaXMub24oZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgZ2V0QXVkaW9TdHJlYW0sIGdldEF1ZGlvVGFnIH0gZnJvbSAnLi9wZWVyJztcbmltcG9ydCBSVENfQ29ubm5lY3RvciBmcm9tICcuL3J0Yyc7XG5pbXBvcnQgQ29ubmVjdGlvbk1hbmFnZXIgZnJvbSAnLi9jb25uZWN0aW9uLW1hbmFnZXInO1xuXG52YXIgYXVkaW9TdHJlYW0sIHBlZXIsIHBhcnR5TWVtYmVycyA9IHt9O1xuXG5jb25zdCBzZXJ2ZXJzID0ge1xuICAgIHVybHM6IFwic3R1bjpzdHVuMS5sLmdvb2dsZS5jb206MTkzMDJcIlxufVxuXG5jb25zdCB0dXJuU2VydmVyID0ge1xuICAgIHVybHM6ICd0dXJuOjE5Mi4xNTguMjkuMzk6MzQ3OD90cmFuc3BvcnQ9dWRwJyxcbiAgICBjcmVkZW50aWFsOiAnSlpFT0V0MlYzUWIweTI3R1JudHQydTJQQVlBPScsXG4gICAgdXNlcm5hbWU6ICcyODIyNDUxMToxMzc5MzMwODA4J1xufVxuXG5jb25zdCBpY2VTZXJ2ZXJzID0gW3NlcnZlcnMsIHR1cm5TZXJ2ZXJdO1xuXG5cbnZhciB3ZWJydGMgPSB7XG4gICAgXCJkai1hY2NlcHRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICBhdWRpb1N0cmVhbSA9IGdldEF1ZGlvU3RyZWFtKCk7XG4gICAgfSxcbiAgICBcImpvaW4tcGFydHlcIjogYXN5bmMgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIGNsaWVudElkcyA9IGRhdGEubWVtYmVySWRzO1xuICAgICAgICB2YXIgc3RyZWFtT2JqID0gYXdhaXQgYXVkaW9TdHJlYW07XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gQ29ubmVjdGlvbk1hbmFnZXIuZ2V0Q29ubmVjdGlvbigpO1xuICAgICAgICBjbGllbnRJZHMuZm9yRWFjaCgobWVtYmVySWQpID0+IHtcbiAgICAgICAgICAgIHZhciBjbGllbnRQZWVyID0gbmV3IFJUQ19Db25ubmVjdG9yKGljZVNlcnZlcnMsIHN0cmVhbU9iaik7XG4gICAgICAgICAgICBwYXJ0eU1lbWJlcnNbbWVtYmVySWRdID0gY2xpZW50UGVlcjtcbiAgICAgICAgICAgIGNsaWVudFBlZXIub24oJ29mZmVyUmVhZHknLCBmdW5jdGlvbiAob2ZmZXIpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2ZmZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBvZmZlciwgbWVtYmVySWQgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGllbnRQZWVyLm9uKCdjYW5kaWRhdGVSZWFkeScsIGZ1bmN0aW9uIChjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiY2FuZGlkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgY2FuZGlkYXRlLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgXCJvZmZlclwiOiBmdW5jdGlvbiBvZmZlcihtZXNzYWdlKSB7XG4gICAgICAgIHBlZXIgPSBuZXcgUlRDX0Nvbm5uZWN0b3IoaWNlU2VydmVycyk7XG4gICAgICAgIHZhciBtZW1iZXJJZCA9IG1lc3NhZ2UuZGF0YS5tZW1iZXJJZDtcbiAgICAgICAgdmFyIGNvbm5lY3Rpb24gPSBDb25uZWN0aW9uTWFuYWdlci5nZXRDb25uZWN0aW9uKCk7XG4gICAgICAgIHBlZXIub24oJ2Fuc3dlclJlYWR5JywgZnVuY3Rpb24gKGFuc3dlcikge1xuICAgICAgICAgICAgY29ubmVjdGlvbi53ZWJydGMoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYW5zd2VyXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBhbnN3ZXIsIG1lbWJlcklkIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcGVlci5vbignY2FuZGlkYXRlUmVhZHknLCBmdW5jdGlvbiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJjYW5kaWRhdGVcIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGNhbmRpZGF0ZSwgbWVtYmVySWQgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwZWVyLm9uKFwic3RyZWFtUmVhZHlcIiwgZnVuY3Rpb24gKHsgc3RyZWFtczogW3N0cmVhbV0gfSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzdHJlYW1SZWFkeVwiKTtcbiAgICAgICAgICAgIGdldEF1ZGlvVGFnKCkuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICB9KVxuICAgICAgICBwZWVyLmFjY2VwdE9mZmVyKG1lc3NhZ2UuZGF0YS5vZmZlcik7XG4gICAgfSxcblxuICAgIFwiYW5zd2VyXCI6IGZ1bmN0aW9uIGFuc3dlcihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBtZW1iZXJJZCA9IG1lc3NhZ2UuZGF0YS5tZW1iZXJJZDtcbiAgICAgICAgdmFyIGNsaWVudFBlZXIgPSBwYXJ0eU1lbWJlcnNbbWVtYmVySWRdO1xuICAgICAgICBjbGllbnRQZWVyLnNldEFuc3dlcihtZXNzYWdlLmRhdGEuYW5zd2VyKTtcbiAgICB9LFxuXG4gICAgXCJjYW5kaWRhdGVcIjogZnVuY3Rpb24gY2FuZGlkYXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgbGV0IG1lbWJlcklkID0gbWVzc2FnZS5kYXRhLm1lbWJlcklkO1xuICAgICAgICBsZXQgY2xpZW50UGVlciA9IHBhcnR5TWVtYmVyc1ttZW1iZXJJZF0gfHwgcGVlcjtcbiAgICAgICAgY2xpZW50UGVlci5zZXRSZW1vdGVDYW5kaWRhdGUobWVzc2FnZS5kYXRhLmNhbmRpZGF0ZSk7XG4gICAgfVxufVxuXG52YXIgcmVzcG9uc2UgPSB7XG4gICAgXCJwYXJ0eS1jcmVhdGlvbi1zdWNjZXNzXCI6IGZ1bmN0aW9uIChjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHBhZ2U6IFwiaG9tZVwiLFxuICAgICAgICAgICAgdHlwZTogXCJwYXJ0eS1jcmVhdGlvbi1zdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBcImpvaW4tcGFydHktc3VjY2Vzc1wiOiBmdW5jdGlvbiAoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBwYWdlOiBcImhvbWVcIixcbiAgICAgICAgICAgIHR5cGU6IFwiam9pbi1wYXJ0eS1zdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBcImRqLWFjY2VwdFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1ZGlvU3RyZWFtID0gZ2V0QXVkaW9TdHJlYW0oKTtcbiAgICB9XG59XG5cbnZhciBub3RpZmljYXRpb24gPSB7XG4gICAgXCJqb2luLXBhcnR5XCI6IGFzeW5jIGZ1bmN0aW9uIChjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB2YXIgY29ubmVjdGlvbiA9IENvbm5lY3Rpb25NYW5hZ2VyLmdldENvbm5lY3Rpb24oKTtcbiAgICAgICAgdmFyIGNsaWVudElkcyA9IGRhdGEubWVtYmVySWRzO1xuICAgICAgICB2YXIgc3RyZWFtT2JqID0gYXdhaXQgYXVkaW9TdHJlYW07XG4gICAgICAgIGNsaWVudElkcy5mb3JFYWNoKChtZW1iZXJJZCkgPT4ge1xuICAgICAgICAgICAgdmFyIGNsaWVudFBlZXIgPSBuZXcgUlRDX0Nvbm5uZWN0b3IoaWNlU2VydmVycywgc3RyZWFtT2JqKTtcbiAgICAgICAgICAgIHBhcnR5TWVtYmVyc1ttZW1iZXJJZF0gPSBjbGllbnRQZWVyO1xuICAgICAgICAgICAgY2xpZW50UGVlci5vbignb2ZmZXJSZWFkeScsIGZ1bmN0aW9uIChvZmZlcikge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvZmZlclwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IG9mZmVyLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsaWVudFBlZXIub24oJ2NhbmRpZGF0ZVJlYWR5JywgZnVuY3Rpb24gKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjYW5kaWRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBjYW5kaWRhdGUsIG1lbWJlcklkIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy8gdmFyIHdlYnJ0YyA9IHtcbi8vICAgICBjYW5kaWRhdGU6IGZ1bmN0aW9uIGNhbmRpZGF0ZShjb25uZWN0aW9uLCBkYXRhKSB7XG4vLyAgICAgICAgIHZhciB7IGNhbmRpZGF0ZSwgbWVtYmVySWQgfSA9IGRhdGE7XG4vLyAgICAgICAgIHBlZXIuc2V0UmVtb3RlQ2FuZGlkYXRlKGNhbmRpZGF0ZSk7XG4vLyAgICAgfSxcbi8vICAgICBhbnN3ZXI6IGZ1bmN0aW9uIGFuc3dlcihjb25uZWN0aW9uLCBkYXRhKSB7XG4vLyAgICAgICAgIHZhciB7IGFuc3dlciwgbWVtYmVySWQgfSA9IGRhdGE7XG4vLyAgICAgICAgIHBlZXIuc2V0QW5zd2VyKGFuc3dlcik7XG5cbi8vICAgICB9LFxuLy8gICAgIG9mZmVyOiBmdW5jdGlvbiBvZmZlcihjb25uZWN0aW9uLCBkYXRhKSB7XG4vLyAgICAgICAgIHZhciB7IG9mZmVyLCBtZW1iZXJJZCB9ID0gZGF0YTtcbi8vICAgICAgICAgcGVlci5hY2NlcHRPZmZlcihvZmZlcik7XG4vLyAgICAgfVxuLy8gfVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgcmVzcG9uc2UsXG4gICAgbm90aWZpY2F0aW9uLFxuICAgIHdlYnJ0Y1xufVxuIiwiZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHtcbiAgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYXJyMltpXSA9IGFycltpXTtcbiAgfVxuXG4gIHJldHVybiBhcnIyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheUxpa2VUb0FycmF5OyIsImZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRoSG9sZXM7IiwidmFyIGFycmF5TGlrZVRvQXJyYXkgPSByZXF1aXJlKFwiLi9hcnJheUxpa2VUb0FycmF5XCIpO1xuXG5mdW5jdGlvbiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnJheUxpa2VUb0FycmF5KGFycik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aG91dEhvbGVzOyIsImZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZDsiLCJmdW5jdGlvbiBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIGtleSwgYXJnKSB7XG4gIHRyeSB7XG4gICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0KGVycm9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaW5mby5kb25lKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3Rocm93KGVycikge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgX25leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXN5bmNUb0dlbmVyYXRvcjsiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjazsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZlwiKTtcblxudmFyIGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdFwiKTtcblxuZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gIGlmIChpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IFJlZmxlY3QuY29uc3RydWN0O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IGZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICAgICAgdmFyIGEgPSBbbnVsbF07XG4gICAgICBhLnB1c2guYXBwbHkoYSwgYXJncyk7XG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSBGdW5jdGlvbi5iaW5kLmFwcGx5KFBhcmVudCwgYSk7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICAgIGlmIChDbGFzcykgc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdDsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzOyIsImZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9nZXRQcm90b3R5cGVPZjsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZlwiKTtcblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbmhlcml0czsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0OyIsImZ1bmN0aW9uIF9pc05hdGl2ZUZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBGdW5jdGlvbi50b1N0cmluZy5jYWxsKGZuKS5pbmRleE9mKFwiW25hdGl2ZSBjb2RlXVwiKSAhPT0gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzTmF0aXZlRnVuY3Rpb247IiwiZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlO1xuXG4gIHRyeSB7XG4gICAgRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChEYXRlLCBbXSwgZnVuY3Rpb24gKCkge30pKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3Q7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcikpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXk7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjtcbiAgdmFyIF9hcnIgPSBbXTtcbiAgdmFyIF9uID0gdHJ1ZTtcbiAgdmFyIF9kID0gZmFsc2U7XG4gIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kID0gdHJ1ZTtcbiAgICBfZSA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBfYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXlMaW1pdDsiLCJmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVJlc3Q7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfbm9uSXRlcmFibGVTcHJlYWQ7IiwidmFyIF90eXBlb2YgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQgPSByZXF1aXJlKFwiLi9hc3NlcnRUaGlzSW5pdGlhbGl6ZWRcIik7XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKGNhbGwgJiYgKF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIHJldHVybiBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm47IiwiZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgICBvLl9fcHJvdG9fXyA9IHA7XG4gICAgcmV0dXJuIG87XG4gIH07XG5cbiAgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc2V0UHJvdG90eXBlT2Y7IiwidmFyIGFycmF5V2l0aEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRoSG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXlMaW1pdCA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheUxpbWl0XCIpO1xuXG52YXIgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkgPSByZXF1aXJlKFwiLi91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheVwiKTtcblxudmFyIG5vbkl0ZXJhYmxlUmVzdCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlUmVzdFwiKTtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBub25JdGVyYWJsZVJlc3QoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc2xpY2VkVG9BcnJheTsiLCJ2YXIgYXJyYXlXaXRob3V0SG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhvdXRIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheSA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheVwiKTtcblxudmFyIHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5ID0gcmVxdWlyZShcIi4vdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXlcIik7XG5cbnZhciBub25JdGVyYWJsZVNwcmVhZCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlU3ByZWFkXCIpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBhcnJheVdpdGhvdXRIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheShhcnIpIHx8IHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgbm9uSXRlcmFibGVTcHJlYWQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdG9Db25zdW1hYmxlQXJyYXk7IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mOyIsInZhciBhcnJheUxpa2VUb0FycmF5ID0gcmVxdWlyZShcIi4vYXJyYXlMaWtlVG9BcnJheVwiKTtcblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuICBpZiAoIW8pIHJldHVybjtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuICB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7XG4gIGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7XG4gIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG4pO1xuICBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXk7IiwidmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vZ2V0UHJvdG90eXBlT2ZcIik7XG5cbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mXCIpO1xuXG52YXIgaXNOYXRpdmVGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlRnVuY3Rpb25cIik7XG5cbnZhciBjb25zdHJ1Y3QgPSByZXF1aXJlKFwiLi9jb25zdHJ1Y3RcIik7XG5cbmZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHtcbiAgdmFyIF9jYWNoZSA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IHVuZGVmaW5lZDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IF93cmFwTmF0aXZlU3VwZXIgPSBmdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gICAgaWYgKENsYXNzID09PSBudWxsIHx8ICFpc05hdGl2ZUZ1bmN0aW9uKENsYXNzKSkgcmV0dXJuIENsYXNzO1xuXG4gICAgaWYgKHR5cGVvZiBDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBfY2FjaGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmIChfY2FjaGUuaGFzKENsYXNzKSkgcmV0dXJuIF9jYWNoZS5nZXQoQ2xhc3MpO1xuXG4gICAgICBfY2FjaGUuc2V0KENsYXNzLCBXcmFwcGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBXcmFwcGVyKCkge1xuICAgICAgcmV0dXJuIGNvbnN0cnVjdChDbGFzcywgYXJndW1lbnRzLCBnZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgV3JhcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENsYXNzLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IFdyYXBwZXIsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNldFByb3RvdHlwZU9mKFdyYXBwZXIsIENsYXNzKTtcbiAgfTtcblxuICByZXR1cm4gX3dyYXBOYXRpdmVTdXBlcihDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3dyYXBOYXRpdmVTdXBlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvciwgUHJvbWlzZUltcGwpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0LCBQcm9taXNlSW1wbCkge1xuICAgIGlmIChQcm9taXNlSW1wbCA9PT0gdm9pZCAwKSBQcm9taXNlSW1wbCA9IFByb21pc2U7XG5cbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksXG4gICAgICBQcm9taXNlSW1wbFxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiJdfQ==
