
var login = {
    login: function login(popup, data) {
        ConnectionManager.createConnection().then(connection => {
            chrome.storage.sync.set({loggedIn: true});
            popup.sendMessage({ page: "login", type: "login-success" });
        })
    },
    alreadyLogined: function(popup) {
        if(!ConnectionManager.getConnection()) {
            this.login(popup)
        }
    },

    logout: function logout(popup, data) {
        ConnectionManager.terminateConnection();
        chrome.storage.sync.set({loggedIn: false});
        popup.sendMessage({ page: "login", type: "logout-success" });
    }
}

var home = {
    "create-party": function (popup, data) {
        ConnectionManager.getConnection().request({
            type: "create-party"
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

}

var pageMapper = {
    login,
    home,
    party
}


chrome.runtime.onMessage.addListener(PopupMessageHandler.call(chrome.runtime, pageMapper));

function PopupMessageHandler(pageMapper) {
    return (message) => {
        console.log(message);
        var { page, type } = message;
        return pageMapper[page][type](this, message.data);
    }
}