import React from "react";
import style from './login.css';

export default class Login extends React.Component {
    render() {
        return (
            <div className="login-page">
                <img id="party-icon" src="assets/img/party-icon.png" />
                <button id="login-button">Dive In</button>
            </div>
        );
    }
}