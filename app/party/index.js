import React from "react";
import style from './party.css';

import {
    Redirect,
    withRouter
} from "react-router-dom";
class Party extends React.Component {
    constructor(e) {
        super(e);
        this.state = { isPlaying: false };
    }

    onbecomeDjClick() {
        chrome.runtime.sendMessage({
            page: "party",
            type: "become-dj"
        })
    }

    onMessage(message) {
        if (message.type == "stream") {
            this.setState({isPlaying: true});
        }
    }

    onPlay() {
        this.setState({isPlaying: true})
        chrome.runtime.sendMessage({
            page: "audio",
            type: "play"
        });
    }
    
    onPause() {
        this.setState({isPlaying: false})
        chrome.runtime.sendMessage({
            page: "audio",
            type: "pause"
        });
    }

    componentDidMount() {
        chrome.runtime.onMessage.addListener(this.onMessage);
        localStorage.setItem("page", "party");

        chrome.runtime.sendMessage({
            page: 'audio',
            type: 'isPlaying'
        }, (res) => {
            res && this.setState({isPlaying: true});
        });
    }

    componentWillUnmount() {
        chrome.runtime.onMessage.removeListener(this.onMessage);
    }


    render() {
        let comp = this;
        return (
            <div className="party-page">
                {function() {
                    if(comp.state.isPlaying) {
                        return <button onClick={comp.onPause.bind(comp)}>Pause</button>
                    } else {
                        return <button onClick={comp.onPlay.bind(comp)}>Play</button>
                    }
                }()}
                {/* <audio id="audio-player" onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)} controls></audio> */}
                <div className="controls">
                    <button id="become-dj" onClick={this.onbecomeDjClick.bind(this)}>Become DJ</button>
                </div>
            </div>
        );
    }
}

export default withRouter(Party)