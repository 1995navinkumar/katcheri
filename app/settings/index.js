import React from "react";
import style from './settings.css';

export default class Login extends React.Component {
    render() {
        return (
            <div className="settings-page">
                <p>Signalling Server</p>
                <input id="signalling-server" type="text" />

                <p>Turn Server</p>
                <input id="turn-server" type="text" name="" />

                <button id="save-settings">Save</button>
            </div>
        );
    }
}