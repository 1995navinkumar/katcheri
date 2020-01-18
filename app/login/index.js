import React from "react";
import style from './login.css';
import { withRouter } from "react-router-dom";

class Login extends React.Component {

    login() {
        chrome.runtime.sendMessage({
            page: "login",
            type: "login"
        });
        let self = this;
        chrome.runtime.onMessage.addListener(({page, type}) => {
            if(page === "login") {
                self.props.history.push("home");
            }
        })
    }

    render() {
        return (
            <div className="login-page">
                <img id="party-icon" src="assets/img/party-icon.png" />
                <button id="login-button" onClick={this.login.bind(this)}>Dive In</button>
            </div>
        );
    }
}

export default withRouter(Login)