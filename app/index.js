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

module.exports = function App() {
	let [connectionState, setConnectionState] = useState(false);

	chrome.runtime.sendMessage({
		page: "login",
		type: "connection-state"
	})

	useEffect(() => {

	})

	setTimeout(() => {
		setConnectionState(true);
	}, 2000)

	chrome.runtime.onMessage.addListener(message => {

	});



	return (<Router>
		<Header />
		<div className="main">
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
					{connectionState ? <RedirectToRoute /> : <div>Loading....</div>}
				</Route>
			</Switch>
		</div>

	</Router>);
}

function RedirectToRoute() {
	var connectionState = localStorage.getItem("connectionState");
	var route;

	if (connectionState == "online") {
		route = <Redirect to="/login" />;
	} else {
		route = <Redirect to="/settings" />;

	}
	return (
		route
	);
}
