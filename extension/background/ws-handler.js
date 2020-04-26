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
    "offer": function offer(connection, data) {
        peer = new RTC_Connnector(iceServers);
        var memberId = data.memberId;
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
        peer.acceptOffer(data.offer);
    },

    "answer": function answer(connection, data) {
        var memberId = data.memberId;
        var clientPeer = partyMembers[memberId];
        clientPeer.setAnswer(data.answer);
    },

    "candidate": function candidate(connection,data) {
        let memberId = data.memberId;
        let clientPeer = partyMembers[memberId] || peer;
        clientPeer.setRemoteCandidate(data.candidate);
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

export default {
    response,
    notification,
    webrtc
}
