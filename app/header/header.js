import React from "react";
import style from './header.css';

export default class ShoppingList extends React.Component {
    render() {
        return (
            <div className="header">
                <h2>Peer Party !!</h2>
                <img id="settings-icon" src="assets/img/settings.png" alt="" />
                <div className="notification-icon-container">
                    <img id="notification-icon" className="icon" src="assets/img/notification-icon.png" />
                    <div className="dot"></div>
                </div>
                <img id="logout-icon" src="assets/img/logout.png" />
            </div>
        );
    }
}