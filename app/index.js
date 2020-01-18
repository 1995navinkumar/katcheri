import React from "react";
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
	return (<Router>
		<div>
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
						<RedirectToRoute />
					</Route>
				</Switch>
			</div>
		</div>
	</Router>);
}

function RedirectToRoute() {
	return (
		<Redirect to="login" />
	);
}
