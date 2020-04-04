import React, { useState, useEffect } from "react";

import {
	HashRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useRouteMatch
} from "react-router-dom";

import Header from './header';
import Login from './login';
import Home from './home';
import Party from './party'
import Settings from './settings'
import Notification from './notification';

import style from "./style.css";

module.exports = class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			style: {
				visibility: "visible"
			},
			route: ""
		};
	}

	componentDidMount() {
		getBackgroundPage().then(page => {
			var connection = page.ConnectionManager.getConnection();
			if (connection && connection.ws.readyState == 1) {
				this.setState({
					style: { visibility: "hidden" },
					route: "/home"
				})
			} else {
				this.setState({
					style: { visibility: "hidden" },
					route: '/party'
				})
			}
		});
	}

	render() {

		return (
			<Router>
				<Header />
				<div className="main">
					<div className="load-bar" style={this.state.style}>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="bar"></div>
					</div>
					<Switch>
						<Route path="/login">
							<Login />
						</Route>
						<Route path="/home">
							<Home />
						</Route>
						<Route path="/party">
							<Party />
						</Route>
						<Route path="/settings">
							<Settings />
						</Route>
						<Route path="/notification">
							<Notification />
						</Route>
						<Route path="/">
							{this.state.route ? <Redirect to={this.state.route} /> : "Loading..."}
						</Route>
					</Switch>
				</div>

			</Router>
		);
	}
}

function getBackgroundPage() {
	return new Promise((resolve, reject) => {
		console.log(resolve);

		chrome.runtime.getBackgroundPage(resolve);
	});
}

function RedirectToRoute() {
	return getBackgroundPage().then(function (page) {
		console.log(page);

		return (<Redirect to="/login" />);
	})
}
