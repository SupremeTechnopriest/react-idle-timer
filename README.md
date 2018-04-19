# React Idle Timer
> React.js port of jQuery.idleTimer with some extras.

⚠️ We dropped support for date formatting in version 3.  React idle timer returns raw date objects and you can use which ever library you like to format it. If you would like to continue using the built in formatter, stick with version 2.

⚡️ **Updated for React 16**<br/>
🚀 **Now Supports Isomorphic React!**

[![NPM](https://nodei.co/npm/react-idle-timer.png?downloads=true&stars=true)](https://npmjs.org/package/react-idle-timer/)

# Installation
`npm install react-idle-timer`

# Usage

> Run `npm run build` to build the examples found in `src_examples`

```javascript
import React from 'react'
import IdleTimer from 'react-idle-timer';

class YourApp extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <IdleTimer
        ref="idleTimer"
        element={document}
        activeAction={this._onActive}
        idleAction={this._onIdle}
        timeout={this.state.timeout}>

        <h1>All your children</h1>

      </IdleTimer>
    )
  }
}
module.exports = YourApp

```

# Documentation

## Props

- **timeout** {*Number*} - Idle timeout in milliseconds
- **events** {*Array*} - Events to bind
- **idleAction** {*Function*} - Function to call on idle
- **activeAction** {*Function*} - Function to call on active
- **element** {*Object*} - Defaults to document, may pass a ref to another element
- **startOnLoad** {*Boolean*} - Start the timer on component load.  Defaults to `true`. Set to false to wait for user action before starting timer.

## Methods

- **reset()** *{Void}* - Resets the idleTimer
- **pause()** *{Void}* - Pauses the idleTimer
- **resume()** *{Void}* - Resumes a paused idleTimer
- **getRemainingTime()** *{Number}* - Returns the remaining time in milliseconds
- **getElapsedTime()** *{Number}* - Returns the elapsed time in milliseconds
- **lastActiveTime()** *{String}* - Returns the `Date` the user was last active
- **isIdle()** {*Boolean*} - Returns whether or not user is idle
