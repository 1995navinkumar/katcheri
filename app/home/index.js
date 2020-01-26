import React from "react";
import style from './home.css';

import {
    Redirect,
    withRouter
} from "react-router-dom";
class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {partyName: ''};
        this.onMessage = this.onMessage.bind(this);
    }

    onMessage(message) {
        if(message.type === "party-creation-success") {
            this.props.history.push({
              pathname: "party",
              state: {
                type: "create",
                data: {
                  partyId: message.data.partyId
                }
              }
            });
        }

        if(message.type === "join-party-success") {
            this.props.history.push("party",{type: "join"});
        }
    }

    handleChange(event) {
        this.setState({partyName: event.target.value});
    }
    
    createParty() {
        let partyName = this.state.partyName;
        chrome.runtime.sendMessage({
            page: "home",
            type: "create-party",
        });
    }

    joinParty() {
        let partyName = this.state.partyName;
        chrome.runtime.sendMessage({
            page: "home",
            type: "join-party",
            data: {partyId: partyName}
        });
    }

    componentDidMount() {
        chrome.runtime.onMessage.addListener(this.onMessage);
    }
    componentWillUnmount() {
        chrome.runtime.onMessage.removeListener(this.onMessage);
    }
    
    render() {
        return (
            <div className="home-page">
                <input id="input__party-name" value={this.state.partyName} onChange={this.handleChange.bind(this)} type="text" placeholder="enter party name to join" />
                <button id="join-party" onClick={this.joinParty.bind(this)}>Join Party</button>
                <button id="create-party" onClick={this.createParty.bind(this)}>Create Party</button>
            </div>
        );
    }
}

export default withRouter(Home);