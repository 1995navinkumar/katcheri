import React from "react";
import {
    withRouter
} from "react-router-dom";
import style from './settings.css';

class Login extends React.Component {
    goBack() {
        history.back();
    }
    render() {
        return (
            <div className="settings-page">
                <p>Signalling Server</p>
                <input id="signalling-server" type="text" />

                <p>Turn Server</p>
                <input id="turn-server" type="text" name="" />

                <button id="save-settings" onClick={this.goBack.bind(this)}>Save</button>
            </div>
        );
    }
}

export default withRouter(Login);