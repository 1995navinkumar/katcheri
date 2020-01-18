import React from "react";

import style from "./style.css";
import Header from './header/header'

import {
	HashRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";

module.exports = function App() {
	return (<Router>
		<div>
			<Switch>
				<Route path="/">
					<Application />
				</Route>
			</Switch>
		</div>
	</Router>);
}

function Application() {
	return <Header/>
}
