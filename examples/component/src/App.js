import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'
import format from 'date-fns/format'

export default class App extends Component {
  constructor (props) {
    super(props)
    this.idleTimer = null
    this.timeout = 3000
    this.state = {
      remaining: this.timeout,
      isIdle: false,
      lastActive: new Date(),
      elapsed: 0,
      lastEvent: 'Events Emitted on Leader',
      leader: false

    }
    // Bind event handlers and methods
    this.handleOnActive = this.handleOnActive.bind(this)
    this.handleOnIdle = this.handleOnIdle.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleResume = this.handleResume.bind(this)
  }

  componentDidMount () {
    this.setState({
      remaining: this.idleTimer.getRemainingTime(),
      lastActive: this.idleTimer.getLastActiveTime(),
      elapsed: this.idleTimer.getElapsedTime(),
      leader: this.idleTimer.isLeader(),
      isIdle: this.idleTimer.isIdle()
    })

    setInterval(() => {
      this.setState({
        remaining: this.idleTimer.getRemainingTime(),
        lastActive: this.idleTimer.getLastActiveTime(),
        elapsed: this.idleTimer.getElapsedTime(),
        leader: this.idleTimer.isLeader(),
        isIdle: this.idleTimer.isIdle()
      })
    }, 1000)
  }

  render () {
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          timeout={this.timeout}
          crossTab={{
            emitOnAllTabs: true
          }}
        />
        <div>
          <div>
            <h1>Timeout: {this.timeout}ms</h1>
            <h1>Time Remaining: {this.state.remaining}</h1>
            <h1>Time Elapsed: {this.state.elapsed}</h1>
            <h1>Last Active: {format(this.state.lastActive, 'MM-dd-yyyy HH:MM:ss.SSS')}</h1>
            <h1>Last Event: {this.state.lastEvent}</h1>
            <h1>Is Leader: {this.state.leader.toString()}</h1>
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

  handleOnActive () {
    this.setState({  lastEvent: 'active' })
  }

  handleOnIdle () {
    this.setState({  lastEvent: 'idle' })
  }

  handleReset () {
    this.idleTimer.reset()
  }

  handlePause () {
    this.idleTimer.pause()
  }

  handleResume () {
    this.idleTimer.resume()
  }
}
