import React from 'react';
import IdleTimer from '../src/index';

import {
	TextField,
	Dialog,
	RaisedButton
} from 'LUi';

export default React.createClass({

	displayName: 'App',

	getInitialState() {
		return {
			timeout: 3000
		}
	},

	render() {

		return(
			<IdleTimer
				activeAction={this._onActive}
				idleAction={this._onIdle}
				timeout={this.state.timeout}>

				<div><h1>a child</h1></div>

			</IdleTimer>
		);
	},

	_onActive() {
		console.log('active');
	},

	_onIdle() {
		console.log('idle');
	}

});
