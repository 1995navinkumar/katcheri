document.addEventListener("DOMContentLoaded", function addListeners() {
    var settingsIcon = document.getElementById("settings-icon");
    var serverInput = document.getElementById("signalling-server");
    serverInput.value = localStorage.getItem("server");
    var saveSettingsButton = document.getElementById("save-settings");
    settingsIcon.addEventListener("click", function () {
        redirectTo("settings");
    });
    saveSettingsButton.addEventListener("click", function () {
        var value = serverInput.value;
        localStorage.setItem("server", value);
        window.history.back();
    });
    chrome.runtime.onMessage.addListener(function handler(message) { })

})