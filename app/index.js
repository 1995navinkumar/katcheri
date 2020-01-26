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
	let [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {

		chrome.storage.sync.get(['loggedIn'], (syncStatus) => {
			setLoggedIn(syncStatus.loggedIn);
			if (syncStatus.loggedIn) {
				chrome.runtime.sendMessage({
					page: "login",
					type: "alreadyLogined"
				})
			}
		});
	});

	function connectionState() {
		chrome.runtime.sendMessage({
			page: "login",
			type: "connection-state"
		})
	}

	

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
					{loggedIn ? <Home /> : <Login />}
				</Route>
			</Switch>
		</div>

	</Router>);
}

function RedirectToRoute() {


	console.log(loggedIn);
	return (
		<div>
			{loggedIn ? (<Redirect to="home" />) : (<Redirect to="login" />)}
		</div>
	);
}
