import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'
import format from 'date-fns/format'

export default class App extends Component {
  constructor (props) {
    super(props)
    this.idleTimer = null
    this.state = {
      timeout: 3000,
      remaining: null,
      isIdle: false,
      lastActive: null,
      elapsed: null
    }
    // Bind event handlers and methods
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
    this.reset = this._reset.bind(this)
    this.pause = this._pause.bind(this)
    this.resume = this._resume.bind(this)
    this.changeTimeout = this._changeTimeout.bind(this)
  }

  componentDidMount () {
    this.setState({
      remaining: this.idleTimer.getRemainingTime(),
      lastActive: this.idleTimer.getLastActiveTime(),
      elapsed: this.idleTimer.getElapsedTime()
    })

    setInterval(() => {
      this.setState({
        remaining: this.idleTimer.getRemainingTime(),
        lastActive: this.idleTimer.getLastActiveTime(),
        elapsed: this.idleTimer.getElapsedTime()
      })
    }, 1000)
  }

  render () {
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          onActive={this.onActive}
          onIdle={this.onIdle}
          timeout={this.state.timeout}
          startOnLoad />
        <div>
          <div>
            <h1>Timeout: {this.state.timeout}ms</h1>
            <h1>Time Remaining: {this.state.remaining}</h1>
            <h1>Time Elapsed: {this.state.elapsed}</h1>
            <h1>Last Active: {format(this.state.lastActive, 'MM-DD-YYYY HH:MM:ss.SSS')}</h1>
            <h1>Idle: {this.state.isIdle.toString()}</h1>
          </div>
          <div>
            <button onClick={this.reset}>RESET</button>
            <button onClick={this.pause}>PAUSE</button>
            <button onClick={this.resume}>RESUME</button>
          </div>
        </div>
      </div>
    )
  }

  _onActive () {
    this.setState({ isIdle: false })
  }

  _onIdle () {
    this.setState({ isIdle: true })
  }

  _changeTimeout () {
    this.setState({
      timeout: this.refs.timeoutInput.state.value()
    })
  }

  _reset () {
    this.idleTimer.reset()
  }

  _pause () {
    this.idleTimer.pause()
  }

  _resume () {
    this.idleTimer.resume()
  }
}
