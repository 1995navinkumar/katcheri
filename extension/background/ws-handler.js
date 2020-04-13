import { getAudioStream, getAudioTag } from './peer';
import RTC_Connnector from './rtc';
import ConnectionManager from './connection-manager';

var audioStream, peer, partyMembers = {};

const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers, turnServer];


var webrtc = {
    "dj-accept": function () {
        audioStream = getAudioStream();
    },
    "join-party": async function (data) {
        var clientIds = data.memberIds;
        var streamObj = await audioStream;
        var connection = ConnectionManager.getConnection();
        clientIds.forEach((memberId) => {
            var clientPeer = new RTC_Connnector(iceServers, streamObj);
            partyMembers[memberId] = clientPeer;
            clientPeer.on('offerReady', function (offer) {
                connection.webrtc({
                    type: "offer",
                    data: { offer, memberId }
                });
            });
            clientPeer.on('candidateReady', function (candidate) {
                connection.webrtc({
                    type: "candidate",
                    data: { candidate, memberId }
                });
            })
        });
    },

    "offer": function offer(message) {
        peer = new RTC_Connnector(iceServers);
        var memberId = message.data.memberId;
        var connection = ConnectionManager.getConnection();
        peer.on('answerReady', function (answer) {
            connection.webrtc({
                type: "answer",
                data: { answer, memberId }
            });
        });
        peer.on('candidateReady', function (candidate) {
            connection.webrtc({
                type: "candidate",
                data: { candidate, memberId }
            });
        });
        peer.on("streamReady", function ({ streams: [stream] }) {
            console.log("streamReady");
            getAudioTag().srcObject = stream;
        })
        peer.acceptOffer(message.data.offer);
    },

    "answer": function answer(message) {
        var memberId = message.data.memberId;
        var clientPeer = partyMembers[memberId];
        clientPeer.setAnswer(message.data.answer);
    },

    "candidate": function candidate(message) {
        let memberId = message.data.memberId;
        let clientPeer = partyMembers[memberId] || peer;
        clientPeer.setRemoteCandidate(message.data.candidate);
    }
}

var response = {
    "party-creation-success": function (connection, data) {
        chrome.runtime.sendMessage({
            page: "home",
            type: "party-creation-success",
            data
        })
    },
    "join-party-success": function (connection, data) {
        chrome.runtime.sendMessage({
            page: "home",
            type: "join-party-success",
            data
        })
    },
    "dj-accept": function () {
        audioStream = getAudioStream();
    }
}

var notification = {
    "join-party": async function (connection, data) {
        console.log(data);
        var connection = ConnectionManager.getConnection();
        var clientIds = data.memberIds;
        var streamObj = await audioStream;
        clientIds.forEach((memberId) => {
            var clientPeer = new RTC_Connnector(iceServers, streamObj);
            partyMembers[memberId] = clientPeer;
            clientPeer.on('offerReady', function (offer) {
                connection.webrtc({
                    type: "offer",
                    data: { offer, memberId }
                });
            });
            clientPeer.on('candidateReady', function (candidate) {
                connection.webrtc({
                    type: "candidate",
                    data: { candidate, memberId }
                });
            })
        });
    }
}

// var webrtc = {
//     candidate: function candidate(connection, data) {
//         var { candidate, memberId } = data;
//         peer.setRemoteCandidate(candidate);
//     },
//     answer: function answer(connection, data) {
//         var { answer, memberId } = data;
//         peer.setAnswer(answer);

//     },
//     offer: function offer(connection, data) {
//         var { offer, memberId } = data;
//         peer.acceptOffer(offer);
//     }
// }

export default {
    response,
    notification,
    webrtc
}
