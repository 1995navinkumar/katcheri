
import wsHandler from './ws-handler';

async function getUserProfile() {
    return new Promise((resolve, reject) => {
        chrome.identity.getProfileUserInfo(resolve);
    })
}

var login = {
    login: function login(popup, data) {
        getUserProfile().then(profile => {
            var url = localStorage.getItem("signalling") || "localhost:8080";
            var queryParams = new URLSearchParams({ email: profile.email }).toString();
            ConnectionManager.createConnection(url, queryParams, wsHandler).then(connection => {
                console.log(connection);
                popup.sendMessage({ page: "login", type: "login-success" });
            })
        })
    },

    logout: function logout(popup, data) {
        ConnectionManager.terminateConnection();
        popup.sendMessage({ page: "login", type: "logout-success" });
    }
}

var home = {
    "create-party": function (popup, data) {
        ConnectionManager.getConnection().request({
            type: "create-party",
            data
        });
    },
    "join-party": function (popup, data) {
        ConnectionManager.getConnection().request({
            type: "join-party",
            data
        })
    }
}

var party = {
    "become-dj": function () {
        ConnectionManager.getConnection().request({
            type: "become-dj",
        })
    }
}

export default {
    login,
    home,
    party
}