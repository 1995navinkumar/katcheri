import { EventHandler, pipe, messageParser } from './utils';

export default (function ConnectionManager() {
    var activeConnection;
    async function createConnection(url, queryParams, handler) {
        var ws = await makeConnection(url, queryParams);
        activeConnection = new Connection(ws, handler);
        return activeConnection;
    }
    function terminateConnection() {
        if (!activeConnection) { return };
        activeConnection.trigger("close");
        activeConnection.close();
        activeConnection = undefined;
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

async function makeConnection(url, queryParams) {
    return new Promise((resolve, reject) => {
        var ws = new WebSocket(`ws://${url}?${queryParams}`);
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

function Connection(ws, handler) {
    this.ws = ws;
    this.handler = MessageHandler.call(this, handler);
    Object.assign(this, new EventHandler());
    ws.onmessage = pipe(messageParser, this.handler);
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
        if (category && type) {
            try {
                return categoryMapper[category][type](this, data);
            } catch (error) {
                console.log(error);
            }
        }
    }
}