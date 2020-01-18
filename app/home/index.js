import React from "react";
import style from './home.css';

export default class Home extends React.Component {
    render() {
        return (
            <div className="home-page">
                <input id="input__party-name" type="text" placeholder="enter party name to join" />
                <button id="join-party">Join Party</button>
                <button id="create-party">Create Party</button>
            </div>
        );
    }
}