import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'
import format from 'date-fns/format'

export default class App extends Component {
  constructor (props) {
    super(props)
    this.idleTimer = null
    this.state = {
      remaining: null,
      isIdle: false,
      lastActive: new Date(),
      elapsed: null
    }
    // Bind event handlers and methods
    this.handleOnActive = this._handleOnActive.bind(this)
    this.handleOnIdle = this._handleOnIdle.bind(this)
    this.handleReset = this._handleReset.bind(this)
    this.handlePause = this._handlePause.bind(this)
    this.handleResume = this._handleResume.bind(this)
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
    const timeout = 3000
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          timeout={timeout}
          eventsThrottle={500}
          startOnLoad
        />
        <div>
          <div>
            <h1>Timeout: {timeout}ms</h1>
            <h1>Time Remaining: {this.state.remaining}</h1>
            <h1>Time Elapsed: {this.state.elapsed}</h1>
            <h1>Last Active: {format(this.state.lastActive, 'MM-dd-yyyy HH:MM:ss.SSS')}</h1>
            <h1>Idle: {this.state.isIdle.toString()}</h1>
          </div>
          <div>
            <button onClick={this.handleReset}>RESET</button>
            <button onClick={this.handlePause}>PAUSE</button>
            <button onClick={this.handleResume}>RESUME</button>
          </div>
        </div>
      </div>
    )
  }

  _handleOnActive () {
    this.setState({ isIdle: false })
  }

  _handleOnIdle () {
    this.setState({ isIdle: true })
  }

  _handleReset () {
    this.idleTimer.reset()
  }

  _handlePause () {
    this.idleTimer.pause()
  }

  _handleResume () {
    this.idleTimer.resume()
  }
}
