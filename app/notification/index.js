import React from "react";
import style from './notification.css';

export default class Notification extends React.Component {
    componentDidMount() {
        localStorage.setItem("page", "notification");
    }
    render() {
        return (
            <div className="notification-page">
                <div className="notification-list">
                    <div className="notification-avatar"></div>
                    <div className="notification-content">
                        <p className="message">Become DJ</p>
                        <p className="requester">harish@gmail.com</p>
                    </div>
                    <div className="notification-action">
                        <button>Accept</button>
                        <button>Decline</button>
                    </div>
                </div>
            </div>
        );
    }
}