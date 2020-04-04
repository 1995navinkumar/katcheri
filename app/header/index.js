import React from "react";
import {
    Redirect,
    withRouter
} from "react-router-dom";
import style from './header.css';

class Header extends React.Component {
    redirectToSettings() {
        this.props.history.push("settings");
    }
    redirectToNotification() {
        this.props.history.push("notification");
    }
    redirectToLogin() {
        chrome.runtime.sendMessage({
            page: "login",
            type: "logout"
        });

        let self = this;
        chrome.runtime.onMessage.addListener(({page, type}) => {
            if(page === "login" && type === "logout-success") {
                self.props.history.push("login");
            }
        })
    }
    render() {
        return (
            <div className="header">
                <h2>Katcheri</h2>
                <img id="settings-icon" src="assets/img/settings.png" onClick={this.redirectToSettings.bind(this)} />
                <div className="notification-icon-container" onClick={this.redirectToNotification.bind(this)}>
                    <img id="notification-icon" className="icon" src="assets/img/notification-icon.png" />
                    <div className="dot"></div>
                </div>
                <img id="logout-icon" src="assets/img/logout.png" onClick={this.redirectToLogin.bind(this)} />
            </div>
        );
    }
}

export default withRouter(Header);