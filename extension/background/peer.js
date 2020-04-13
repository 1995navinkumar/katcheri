var audioStream;

const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers, turnServer];

var peer, partyMembers = {};

function reset() {
    if (peer) {
        peer.close();
        peer = undefined;
    }
    if (Object.keys(partyMembers).length > 0) {
        partyMembers.forEach(peerCon => {
            peerCon.close();
        })
        partyMembers = {};
    }
}

export function getAudioTag() {
    var window = chrome.extension.getViews({ type: "popup" })[0];
    return window.document.getElementById("audio-player");
}

export function getAudioStream() {
    if (!audioStream) {
        audioStream = new Promise(function (resolve, reject) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabCapture.capture({ audio: true }, (stream) => {
                    var audioTag = getAudioTag();
                    audioTag.srcObject = stream;
                    audioStream = stream;
                    console.log(audioStream);
                    resolve(stream);
                });
            });
        })
    }
    return audioStream;
}
