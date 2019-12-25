window.addEventListener("hashchange", function () {
    var hash = window.location.hash;
    updatePage(hash.slice(1));
});

document.addEventListener("DOMContentLoaded", function addListeners() {
    setPageAndState();
});

function redirectTo(pageName) {
    window.location.hash = pageName;
}

function setPageAndState() {
    var state = localStorage.getItem("state") || "disconnected";
    var page = localStorage.getItem("page") || "login";
    document.body.setAttribute("state", state);
    document.body.setAttribute("page", page);
    window.location.hash = page; // Initial hashchange is not detected !!!
}

function updateState(state) {
    localStorage.setItem("state", state);
    document.body.setAttribute("state", state);
}

function updatePage(page) {
    localStorage.setItem("page", page);
    document.body.setAttribute("page", page);
}

function showMessage(msg) {
    messageContainer.innerText = msg;
    setTimeout(function () {
        messageContainer.innerText = ""
    }, 2000);
}