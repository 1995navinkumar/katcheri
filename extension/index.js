(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.audio = void 0;
var audio = new Audio();
exports.audio = audio;

},{}],2:[function(require,module,exports){
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

},{"./utils":7,"@babel/runtime/helpers/asyncToGenerator":13,"@babel/runtime/helpers/interopRequireDefault":19,"@babel/runtime/regenerator":33}],3:[function(require,module,exports){
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

},{"./connection-manager":2,"./peer":4,"./rtc":5,"./ui-handler":6,"@babel/runtime/helpers/interopRequireDefault":19}],4:[function(require,module,exports){
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
          audio: true,
          audioConstraints: {
            mandatory: {
              echoCancellation: false
            }
          }
        }, function (stream) {
          resolve(stream);
        });
      });
    });
  }

  return audioStream;
}

},{}],5:[function(require,module,exports){
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

},{"./utils":7,"@babel/runtime/helpers/assertThisInitialized":12,"@babel/runtime/helpers/asyncToGenerator":13,"@babel/runtime/helpers/classCallCheck":14,"@babel/runtime/helpers/createClass":16,"@babel/runtime/helpers/getPrototypeOf":17,"@babel/runtime/helpers/inherits":18,"@babel/runtime/helpers/interopRequireDefault":19,"@babel/runtime/helpers/possibleConstructorReturn":26,"@babel/runtime/helpers/wrapNativeSuper":32,"@babel/runtime/regenerator":33}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _wsHandler = _interopRequireDefault(require("./ws-handler"));

var _audioHandler = require("./audio-handler");

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
var audio = {
  play: function play() {
    _audioHandler.audio && _audioHandler.audio.play();
  },
  pause: function pause() {
    _audioHandler.audio && _audioHandler.audio.pause();
  },
  isPlaying: function isPlaying() {
    return _audioHandler.audio && !_audioHandler.audio.paused;
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
  audio: audio,
  party: party
};
exports["default"] = _default;

},{"./audio-handler":1,"./ws-handler":8,"@babel/runtime/helpers/asyncToGenerator":13,"@babel/runtime/helpers/interopRequireDefault":19,"@babel/runtime/regenerator":33}],7:[function(require,module,exports){
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

},{"@babel/runtime/helpers/interopRequireDefault":19,"@babel/runtime/helpers/toConsumableArray":29}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _peer = require("./peer");

var _rtc = _interopRequireDefault(require("./rtc"));

var _connectionManager = _interopRequireDefault(require("./connection-manager"));

var _audioHandler = require("./audio-handler");

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
  "offer": function offer(connection, data) {
    peer = new _rtc["default"](iceServers);
    var memberId = data.memberId;

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
      _audioHandler.audio.srcObject = stream;

      _audioHandler.audio.play();
    });
    peer.acceptOffer(data.offer);
  },
  "answer": function answer(connection, data) {
    var memberId = data.memberId;
    var clientPeer = partyMembers[memberId];
    clientPeer.setAnswer(data.answer);
  },
  "candidate": function candidate(connection, data) {
    var memberId = data.memberId;
    var clientPeer = partyMembers[memberId] || peer;
    clientPeer.setRemoteCandidate(data.candidate);
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
  "dj-accept": function () {
    var _djAccept = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _peer.getAudioStream)();

            case 2:
              audioStream = _context.sent;

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function djAccept() {
      return _djAccept.apply(this, arguments);
    }

    return djAccept;
  }()
};
var notification = {
  "join-party": function () {
    var _joinParty = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(connection, data) {
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

    function joinParty(_x, _x2) {
      return _joinParty.apply(this, arguments);
    }

    return joinParty;
  }()
};
var _default = {
  response: response,
  notification: notification,
  webrtc: webrtc
};
exports["default"] = _default;

},{"./audio-handler":1,"./connection-manager":2,"./peer":4,"./rtc":5,"@babel/runtime/helpers/asyncToGenerator":13,"@babel/runtime/helpers/interopRequireDefault":19,"@babel/runtime/helpers/slicedToArray":28,"@babel/runtime/regenerator":33}],9:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
},{}],10:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],11:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
},{"./arrayLikeToArray":9}],12:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],15:[function(require,module,exports){
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
},{"./isNativeReflectConstruct":21,"./setPrototypeOf":27}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],18:[function(require,module,exports){
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
},{"./setPrototypeOf":27}],19:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],20:[function(require,module,exports){
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
},{}],25:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
},{}],26:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"../helpers/typeof":30,"./assertThisInitialized":12}],27:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],28:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":10,"./iterableToArrayLimit":23,"./nonIterableRest":24,"./unsupportedIterableToArray":31}],29:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":11,"./iterableToArray":22,"./nonIterableSpread":25,"./unsupportedIterableToArray":31}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{"./arrayLikeToArray":9}],32:[function(require,module,exports){
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
},{"./construct":15,"./getPrototypeOf":17,"./isNativeFunction":20,"./setPrototypeOf":27}],33:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":34}],34:[function(require,module,exports){
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

},{}]},{},[3]);
