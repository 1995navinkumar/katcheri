

async function getUserProfile() {
    return new Promise((resolve, reject) => {
        chrome.identity.getProfileUserInfo(resolve);
    })
}


var ConnectionManager = (function ConnectionManager() {
    var activeConnection;
    async function createConnection() {
        var userProfile = await getUserProfile();
        var hostName = localStorage.getItem("server") || "192.168.43.57:8080";
        var ws = await makeConnection(hostName, userProfile);
        activeConnection = new Connection(ws);
        return activeConnection;
    }
    function terminateConnection() {
        activeConnection.trigger("close");
        activeConnection.close();
        console.log("connection terminated");
    }
    function getConnection() {
        return activeConnection;
    }
    return {
        createConnection,
        terminateConnection,
        getConnection
    }
})();


async function makeConnection(hostName, profile) {
    return new Promise((resolve, reject) => {
        var ws = new WebSocket(`ws://${hostName}?email=${profile.email}`);
        ws.onopen = function () {
            console.log("socket connection established ");
            resolve(ws);
        };
        ws.onerror = function (e) {
            console.log("error in connection establishment", e);
            reject(e);
        }
        ws.onclose = function () {
            console.log("socket closed");
        }
    });
}

function Connection(ws) {
    this.ws = ws;
    this.IncomingMessageHandler = MessageHandler.call(this, IncomingMessageHandler);
    Object.assign(this, composeEventHandler());
    ws.onmessage = pipe(messageParser, this.IncomingMessageHandler);
}

Connection.prototype.close = function close() {
    this.ws.close(1000, "logged out");
}

Connection.prototype.signal = function signal(message) {
    this.ws.send(JSON.stringify(message))
}

Connection.prototype.request = function request(message) {
    message.category = "request";
    this.signal(message);
}

Connection.prototype.respond = function respond(to, message) {
    message.category = "response";
    message.data.memberId = to;
    this.signal(message);
}

Connection.prototype.action = function action(message) {
    message.category = "action";
    this.signal(message);
}

Connection.prototype.webrtc = function webrtc(message) {
    message.category = "webrtc";
    this.signal(message);
}

function MessageHandler(categoryMapper) {
    return (message) => {
        console.log(message);
        var { category, type, data } = message;
        return categoryMapper[category][type](this, data);
    }
}