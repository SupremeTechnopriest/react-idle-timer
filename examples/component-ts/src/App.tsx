import React, { Component } from 'react'
import IdleTimer, { IdleTimerProps } from 'react-idle-timer'
import format from 'date-fns/format'

export default class YourApp extends Component {
  idleTimer : IdleTimer | null
  timeout : number
  state : { 
    remaining: number
    isIdle: boolean
    lastActive: Date
    elapsed: number
  }

  constructor(props: IdleTimerProps) {
    super(props)
    this.timeout = 3000
    this.idleTimer = null
    this.state = {
      remaining: this.timeout,
      isIdle: false,
      lastActive: new Date(),
      elapsed: 0
    }
    // Bind event handlers and methods
    this.handleOnActive = this.handleOnActive.bind(this)
    this.handleOnIdle = this.handleOnIdle.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleResume = this.handleResume.bind(this)
  }

  componentDidMount() {
    this.setState({
      remaining: this.idleTimer && this.idleTimer.getRemainingTime(),
      lastActive: this.idleTimer && this.idleTimer.getLastActiveTime(),
      elapsed: this.idleTimer && this.idleTimer.getElapsedTime()
    })

    setInterval(() => {
      this.setState({
        remaining: this.idleTimer && this.idleTimer.getRemainingTime(),
        lastActive: this.idleTimer && this.idleTimer.getLastActiveTime(),
        elapsed: this.idleTimer && this.idleTimer.getElapsedTime()
      })
    }, 1000)
  }

  render() {
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          timeout={this.timeout}
        />
        <div>
          <div>
            <h1>Timeout: {this.timeout}ms</h1>
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

  handleOnActive() {
    this.setState({ isIdle: false })
  }

  handleOnIdle() {
    this.setState({ isIdle: true })
  }

  handleReset() {
    if (this.idleTimer) this.idleTimer.reset()
  }

  handlePause() {
    if (this.idleTimer) this.idleTimer.pause()
  }

  handleResume() {
    if (this.idleTimer) this.idleTimer.resume()
  }
}
