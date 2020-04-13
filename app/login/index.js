import React from "react";
import style from './login.css';
import { withRouter } from "react-router-dom";
import Snackbar from '../snackbar';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.onMessage = this.onMessage.bind(this);
    }
    login() {
        chrome.runtime.sendMessage({
            page: "login",
            type: "login"
        });
    }
    onMessage({ page, type }) {
        if (page === "login") {
            this.props.history.push("home");
        }
    }
    componentDidMount() {
        chrome.runtime.onMessage.addListener(this.onMessage);
        localStorage.setItem("page","login");
    }
    componentWillUnmount() {
        chrome.runtime.onMessage.removeListener(this.onMessage);
    }
    render() {
        return (
            <div className="login-page">
                <div className="login-content">
                    <img id="party-icon" src="assets/img/party-icon.png" />
                    <button id="login-button" onClick={this.login.bind(this)}>Dive In</button>
                </div>
            </div>
        );
    }
}

export default withRouter(Login)