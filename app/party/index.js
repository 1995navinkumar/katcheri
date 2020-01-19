import React from "react";
import style from './party.css';

import {
    Redirect,
    withRouter
} from "react-router-dom";
class Party extends React.Component {
    constructor(props) {
        super(props)
        console.log(this.props.history.location);
    }

    render() {
        return (
            <div className="party-page">
            <div id="party-name"></div>
            <audio id="audio-player" autoPlay controls></audio>
            <div className="controls">
                <button id="become-dj">Become DJ</button>
            </div>
        </div>
        );
    }
}

export default withRouter(Party)