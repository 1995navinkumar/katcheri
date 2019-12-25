document.addEventListener("DOMContentLoaded", function addListeners() {
    var becomeDJButton = document.getElementById("become-dj");
    becomeDJButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            page: "party",
            type: "become-dj"
        });
    });
    chrome.runtime.onMessage.addListener(function handler(message) { })

});