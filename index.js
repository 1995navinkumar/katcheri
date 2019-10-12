const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers];

const log = console.log;

const constraints = {
    audio: true
};

var connection;
var targetIdentifier;

//RTC data channel
var sendChannel;
var receiveChannel;

const offerOptions = {
    offerToReceiveAudio: 1,
};

//Holds client details as name, id
const client = {};


function sendToServer(msg) {
    var msgJSON = JSON.stringify(msg);

    console.log("Sending '" + msg.type + "' message: " + msgJSON);
    connection.send(msgJSON);
}

//Sends the message through data channel created
function sendMessage() {
    let message = document.getElementById("peer-message").value;

    //prints the sent message to the client
    let outgoingMsg = printMessage(message);
    outgoingMsg.classList.add('sent-msg');

    sendChannel.send(message);
}

function login() {
    connection = new WebSocket("ws://192.168.0.108:8080");

    connection.onopen = () => {
        log("created socket for user");
        let userName = document.getElementById('user-name').value;
        client.name = userName;

        sendToServer({ type: "user-name", name: userName });
    }

    connection.onmessage = (e) => {
        var msg = JSON.parse(e.data);

        switch (msg.type) {
            case "create-id":
                client.id = msg.id;
                break;

            case "user-list":
                updateUserList(msg);
                break;

            case "offer":
                joinParty(msg);
                break;

            case "answer":
                answer(msg);
                break;

            case "new-ice-candidate":
                handleReceiverICECandidateEvent(msg);
                break
        }
    }
}

//List the number of users in the current party created
function updateUserList({ userList }) {
    log('updated user list => ' + JSON.stringify(userList));
    let peersList = document.getElementById('peer-list');

    while (peersList.firstChild) {
        peersList.removeChild(peersList.firstChild);
    }
    userList.forEach(userPeer => {
        let listElement = document.createElement('li');
        listElement.onclick = (e) => {
            if (confirm("connect to " + userPeer.name)) {
                createParty(userPeer.id);
            }
        }
        listElement.innerText = userPeer.name;
        peersList.appendChild(listElement);
    });
}

function handleICEConnectionStateChangeEvent(event) {
    console.log(event);
}

function handleSendChannelStatusChange(e) {
    log("state of data channel" + sendChannel.readyState);
    if (sendChannel) {
        var state = sendChannel.readyState;
        log("channel status changed => " + state);
        if (state === "open") {

            document.querySelector('.chat-mode').style.display = "block";
        }
    }
}

function createParty(targetId) {
    targetIdentifier = targetId;
    log("target id: " + targetId);
    createPeerConnection(iceServers);

    //Event triggered when negotiation can take place as RTCpeer won't be stable
    peer.onnegotiationneeded = handleNegotiationNeededEvent;
}

function handleTrackEvent(event) {
    console.log("track event");
    audioButton.srcObject = event.streams[0];
}

async function joinParty(msg) {
    targetIdentifier = msg.id;
    log("joined party  =>" + msg.name);
    createPeerConnection(iceServers);

    var desc = new RTCSessionDescription(msg.offer);

    // If the connection isn't stable yet, wait for it...

    if (peer.signalingState != "stable") {
        log("  - But the signaling state isn't stable, so triggering rollback");

        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
            peer.setLocalDescription({ type: "rollback" }),
            peer.setRemoteDescription(desc)
        ]);
        return;
    } else {
        log("  - Setting remote description");
        await peer.setRemoteDescription(desc);

        let answer = await peer.createAnswer();
        peer.setLocalDescription(answer);

        sendToServer({
            id: client.id,
            type: "answer",
            offer: peer.localDescription,
            targetId: msg.id
        });
    }
}

async function handleNegotiationNeededEvent() {
    try {
        log("Negotiation started");

        const offer = await peer.createOffer();

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (peer.signalingState != "stable") {
            log("     -- The connection isn't stable yet; postponing...")
            return;
        }

        log("Setting to local description");
        await peer.setLocalDescription(offer);

        sendToServer({
            id: client.id,
            type: "offer",
            offer: peer.localDescription,
            targetId: targetIdentifier
        });

    } catch (error) {
        log(`Failed in Negotiation ${error}`)
    }
}

function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleDataChannelMessages;
}

function printMessage(text) {
    let msg = document.createElement('p');
    msg.textContent = text;
    document.querySelector('.chat-mode').appendChild(msg);
    return msg;
}

function handleDataChannelMessages(e) {
    let incommingMsg = printMessage(e.data);
    incommingMsg.classList.add('received-msg');
}

function createPeerConnection(iceServers) {
    peer = new RTCPeerConnection({
        iceServers
    });

    //RTC Data Channel
    sendChannel = peer.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;

    sendChannel.onclose = handleSendChannelStatusChange;

    peer.ondatachannel = receiveChannelCallback;

    peer.onicecandidate = handleMasterICECandidateEvent;
    peer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
}

function handleMasterICECandidateEvent(event) {
    console.log("ice candidate handling");
    console.log(event);
    if (event.candidate) {
        sendToServer({
            type: "new-ice-candidate",
            targetId: targetIdentifier,
            candidate: event.candidate
        })
    }
}

function handleReceiverICECandidateEvent({ candidate: remoteCandidate }) {
    var candidate = new RTCIceCandidate(remoteCandidate);
    log("Adding received ICE candidate " + JSON.stringify(candidate));

    peer.addIceCandidate(candidate)
}

function answer(msg) {
    var desc = new RTCSessionDescription(msg.offer);
    peer.setRemoteDescription(desc).then(() => console.log(peer.remoteDescription));
}