import React from "react";
import style from './party.css';

export default class Party extends React.Component {
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