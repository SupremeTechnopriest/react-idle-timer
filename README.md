# React Idle Timer

![npm](https://img.shields.io/npm/v/react-idle-timer.svg)
![npm](https://img.shields.io/npm/dt/react-idle-timer.svg)
![Travis](https://img.shields.io/travis/SupremeTechnopriest/react-idle-timer.svg)
[![Test Coverage](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/test_coverage)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/maintainability)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/maintainability)


[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

⚡️ **Support for React 16**<br/>
🚀 **Support for Isomorphic React**

## Latest News

Welcome to version 4 of IdleTimer! We have performed a complete rewrite of our build system and a refactor/ clean up of the source code. After accepting many pull requests things started to get ugly. We added test coverage and continuous integration tools (travis and codeclimate) that will automatically enforce style and test future pull requests.  

There are a few breaking changes in version 4:

- The property `startOnLoad` has been renamed to `startOnMount` in order to make more sense in a react context.
- The property `activeAction` has been renamed to `onActive`.
- The property `idleAction` has been renamed to `onIdle`.

For the full patch notes please refer to the [CHANGELOG](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/CHANGELOG.md)

## Installation
`yarn add react-idle-timer`
or
`npm install react-idle-timer --save`

## Usage

> Run `yarn example` to build and run the example `example`. The example is a [create-react-app](https://github.com/facebook/create-react-app) project. IdleTimer is implemented in the [App Component](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/example/src/App.js).

```javascript
import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'

export default class YourApp extends Component {
  constructor(props) {
    super(props)
    this.idleTimer = null
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
  }

  render() {
    return (
      <IdleTimer
        ref={ref => { this.idleTimer = ref }}
        element={document}
        onActive={this.onActive}
        onIdle={this.onIdle}
        timeout={1000 * 60 * 15}>

        <h1>Child Components</h1>

      </IdleTimer>
    )
  }

  _onActive(e) {
    console.log('user is active', e)
    console.log('time remaining', this.idleTimer.getRemainingTime())
  }

  _onIdle(e) {
    console.log('user is idle', e)
    console.log('last active', this.idleTimer.getLastActiveTime())
  }
}
```

## Documentation

> To build the source code generated html docs run `yarn docs` and open `docs/index.html` in any browser.  A markdown version is available [here](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/DOCS.md).

### Default Events
These events are bound by default:
- mousemove
- keydown
- wheel
- DOMMouseScroll
- mouseWheel
- mousedown
- touchstart
- touchmove
- MSPointerDown
- MSPointerMove

### Props
- **timeout** {*Number*} - Idle timeout in milliseconds.
- **events** {*Array*} - Events to bind. See [default events](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/src/index.js#L36-L47) for list of defaults.
- **idleAction** {*Function*} - Function to call on idle.
- **activeAction** {*Function*} - Function to call on active.
- **element** {*Object*} - Defaults to document, may pass a ref to another element.
- **startOnMount** {*Boolean*} - Start the timer on component load.  Defaults to `true`. Set to false to wait for user action before starting timer.
- **passive** {*Boolean*} - Bind events in [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode. Defaults to `true`.
- **capture** {*Boolean*} - Bind events in [capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode. Defaults to `true`.

### Methods
- **reset()** *{Void}* - Resets the idleTimer
- **pause()** *{Void}* - Pauses the idleTimer
- **resume()** *{Void}* - Resumes a paused idleTimer
- **getRemainingTime()** *{Number}* - Returns the remaining time in milliseconds
- **getElapsedTime()** *{Number}* - Returns the elapsed time in milliseconds
- **getLastActiveTime()** *{String}* - Returns the `Date` the user was last active
- **isIdle()** *{Boolean}* - Returns whether or not user is idle
