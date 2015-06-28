import React from 'react';
import IdleTimer from '../build/index';

export default React.createClass({

	displayName: 'App',

	getInitialState() {
		return {
			timeout: 3000,
			remaining: null,
			isIdle: false,
			lastActive: null,
			elapsed: null
		}
	},

	componentDidMount() {
		this.setState({
			remaining: this.refs.idleTimer.getRemainingTime(),
			lastActive: this.refs.idleTimer.getLastActiveTime(),
			elapsed: this.refs.idleTimer.getElapsedTime()
		});

		setInterval(() => {
			this.setState({
				remaining: this.refs.idleTimer.getRemainingTime(),
				lastActive: this.refs.idleTimer.getLastActiveTime(),
				elapsed: this.refs.idleTimer.getElapsedTime()
			});
		}, 1000);
	},

	render() {

		return(
			<IdleTimer
				ref="idleTimer"
				activeAction={this._onActive}
				idleAction={this._onIdle}
				timeout={this.state.timeout}
				format="MM-DD-YYYY HH:MM:ss.SSS">

				<div>
					<h1>Timeout: {this.state.timeout}ms</h1>
					<h1>Time Remaining: {this.state.remaining}</h1>
					<h1>Time Elapsed: {this.state.elapsed}</h1>
					<h1>Last Active: {this.state.lastActive}</h1>
					<h1>Idle: {this.state.isIdle.toString()}</h1>
				</div>

				<div>
					<button onClick={this._reset}>RESET</button>
					<button onClick={this._pause}>PAUSE</button>
					<button onClick={this._resume}>RESUME</button>
				</div>

			</IdleTimer>
		);
	},

	_onActive() {
		this.setState({ isIdle: false });
	},

	_onIdle() {
		this.setState({ isIdle: true });
	},

	_changeTimeout() {
		this.setState({
			timeout: this.refs.timeoutInput.state.value()
		});
	},

	_reset() {
		this.refs.idleTimer.reset();
	},

	_pause() {
		this.refs.idleTimer.pause();
	},

	_resume() {
		this.refs.idleTimer.resume();
	}

});
