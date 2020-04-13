import ConnectionManager from './connection-manager';
import RTCConnector from './rtc';
import uiHandler from './ui-handler';
import Peer from './peer';

chrome.runtime.onMessage.addListener(PopupMessageHandler.call(chrome.runtime, uiHandler));

function PopupMessageHandler(pageMapper) {
    return (message) => {
        console.log(message);
        var { page, type } = message;
        return pageMapper[page][type](this, message.data);
    }
}

window.url = "localhost:8080";
window.queryParams = new URLSearchParams({ email: "1995navinkumar@gmail.com" }).toString();
window.ConnectionManager = ConnectionManager;



