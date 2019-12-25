document.addEventListener("DOMContentLoaded", function addListeners() {
    var createPartyButton = document.getElementById("create-party");
    var joinPartyButton = document.getElementById("join-party");
    var homeIcon = document.getElementById("home-icon");
    var partyNameInput = document.getElementById("input__party-name");

    function disableButtons() {
        createPartyButton.disabled = true;
        joinPartyButton.disabled = true;
    }

    function enableButtons() {
        createPartyButton.disabled = false;
        joinPartyButton.disabled = false;
    }

    createPartyButton.addEventListener("click", function () {
        disableButtons();
        chrome.runtime.sendMessage({
            page: "home",
            type: "create-party"
        });
    });

    joinPartyButton.addEventListener("click", function () {
        disableButtons();
        var partyId = partyNameInput.value;
        chrome.runtime.sendMessage({
            page: "home",
            type: "join-party",
            data: { partyId }
        });
    });

    chrome.runtime.onMessage.addListener(function handler(message) {
        var page = message.page;
        var type = message.type;
        if (page == "home") {
            if (type == "party-creation-success") {
                redirectTo("party");
                enableButtons();
            } else if (type == "join-party-success") {
                redirectTo("party");
                enableButtons();
            }
        }
    })
})