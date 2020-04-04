import React from "react";
import style from './party.css';

import {
    Redirect,
    withRouter
} from "react-router-dom";
class Party extends React.Component {
    onbecomeDjClick() {
        chrome.runtime.sendMessage({
            page: "party",
            type: "become-dj"
        })
    }

    render() {
        return (
            <div className="party-page">
            {/* <div id="party-name">{this.props.history.location.state.data.partyId}</div> */}
            <audio id="audio-player" autoPlay controls></audio>
            <div className="controls">
                <button id="become-dj" onClick={this.onbecomeDjClick.bind(this)}>Become DJ</button>
            </div>
        </div>
        );
    }
}

export default withRouter(Party)