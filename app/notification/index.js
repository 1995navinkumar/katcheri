import React from "react";
import style from './notification.css';

export default class Notification extends React.Component {
    render() {
        return (
            <div className="notification-page">
                <div className="notification-list">
                    <div className="notification-content">
                        <p className="message">Become DJ</p>
                        <p className="requester">harish@gmail.com</p>
                    </div>
                    <button>Accept</button>
                    <button>Decline</button>
                </div>
            </div>
        );
    }
}