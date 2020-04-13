import React from "react";
import {
    withRouter
} from "react-router-dom";
import style from './settings.css';

class Login extends React.Component {
    constructor(props) {
        super(props);
        var signalling = localStorage.getItem("signalling") || "localhost:8080";
        this.state = {
            signalling
        };
    }
    goBack() {
        var signalling = document.getElementById("signalling-server").value;
        localStorage.setItem("signalling", signalling);
        history.back();
    }
    componentDidMount() {
        localStorage.setItem("page", "settings");
    }
    render() {
        return (
            <div className="settings-page">
                <p>Signalling Server</p>
                <input id="signalling-server" type="text" defaultValue={this.state.signalling} />

                <p>Turn Server</p>
                <input id="turn-server" type="text" name="" />

                <button id="save-settings" onClick={this.goBack.bind(this)}>Save</button>
            </div>
        );
    }
}

export default withRouter(Login);