const servers = {
    urls: "stun:stun.l.google.com:19302"
}

const iceServers = [servers];
const signallingServerUrl = "http://localhost:8000";

const createOfferUrl = `${signallingServerUrl}/party/createoffer`;
const getOfferUrl = `${signallingServerUrl}/party/getoffer`;

const provideAnswerUrl = `${signallingServerUrl}/party/provideanswer`;
const getAnswerUrl = `${signallingServerUrl}/party/getanswer`;

const createMasterIceCanditateUrl = `${signallingServerUrl}/party/createMasterCandidate`;
const createSlaveIceCandidateUrl = `${signallingServerUrl}/party/createSlaveCandidate`;

const getMasterIceCandidateUrl = `${signallingServerUrl}/party/getMasterCandidate`;
const getSlaveIceCandidateUrl = `${signallingServerUrl}/party/getSlaveCandidate`;


const constraints = {
    audio: true
};

const offerOptions = {
    offerToReceiveAudio: 1,
};

var masterPeer;
var slavePeer;

function sendToServer(url, body) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function getFromServer(url, params) {
    return fetch(url, {
        method: 'GET'
    });
}

function stream() {
    peer = masterPeer;
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then((localStream) => {
        peer.addStream(localStream);
        // localStream.getTracks().forEach(track => peer.addStream(track, localStream));
    });
}

function handleICEConnectionStateChangeEvent(event){
    console.log(event);
}

function createParty() {
    masterPeer = createPeerConnection(iceServers);
    masterPeer.onicecandidate = handleMasterICECandidateEvent;
    masterPeer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    masterPeer.createOffer(offerOptions).then((offer) => {
        console.log(offer);
        return masterPeer.setLocalDescription(offer);
    }).then(() => {
        console.log(masterPeer.localDescription);
        return sendToServer(createOfferUrl, {
            type: "offer",
            sdp: masterPeer.localDescription
        })
    }).then((resp) => {
        trace(resp);
    }).catch(error => {
        console.log(error);
    });
}

function handleTrackEvent(event) {
    console.log("track event");
    audioButton.srcObject = event.streams[0];
}

function joinParty() {
    slavePeer = createPeerConnection(iceServers);
    slavePeer.onicecandidate = handleSlaveICECandidateEvent;
    slavePeer.onaddstream = handleTrackEvent;
    var masterOffer = getFromServer(getOfferUrl);
    masterOffer.then(msg => {
        msg.json().then(offer => {
            var desc = new RTCSessionDescription(offer);
            slavePeer.setRemoteDescription(desc).then(() => {
                return slavePeer.createAnswer(offerOptions);
            }).then(answer => {
                slavePeer.setLocalDescription(answer);
            }).then(function () {
                return sendToServer(provideAnswerUrl, {
                    type: "answer",
                    sdp: slavePeer.localDescription
                });
            });
        });
    })
}



function createPeerConnection(iceServers) {
    return new RTCPeerConnection({
        iceServers
    });
}

function handleMasterICECandidateEvent(event) {
    console.log("master ice candidate");
    if (event.candidate) {
        sendToServer(createMasterIceCanditateUrl, {
            type: "new-ice-candidate",
            candidate: event.candidate
        }).then(resp => {
            console.log(resp)
        });
    }
}

function handleSlaveICECandidateEvent(event) {
    console.log("ice slave");
    if (event.candidate) {
        sendToServer(createSlaveIceCandidateUrl, {
            type: "new-ice-candidate",
            candidate: event.candidate
        }).then(resp => {
            console.log(resp)
        });
    }
}

function addMasterCandidateToSlave() {
    getFromServer(getMasterIceCandidateUrl).then(msg => {
        msg.json().then(connection => {
            var candidate = new RTCIceCandidate(connection.candidate);
            slavePeer.addIceCandidate(candidate)
        });
    });
}

function addSlaveCandidateToMaster() {
    getFromServer(getSlaveIceCandidateUrl).then(msg => {
        msg.json().then(connection => {
            var candidate = new RTCIceCandidate(connection.candidate);
            masterPeer.addIceCandidate(candidate)
        });
    });
}

function answer() {
    getFromServer(getAnswerUrl).then(msg => {
        msg.json().then(offer => {
            var desc = new RTCSessionDescription(offer);
            masterPeer.setRemoteDescription(desc).then(() => console.log(masterPeer.remoteDescription));
        });
    })
}

function trace(resp) {
    resp.text().then(text => {
        console.log(text)
    });
}