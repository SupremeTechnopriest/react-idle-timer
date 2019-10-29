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

#### Version `4.2.0` brings typescript support and dynamic event binding to `IdleTimer`:

☝️ Events will now dynamically unbind when they are not needed (`pause()`, `stopOnIdle`) and bound when they are needed (`resume()`, `reset()`, `startOnMount`). If `onAction` is set, events will never be unbound.

✌️ Added a typescript type definition file that will be maintained alongside this library. It requires that you have the react type definitions installed.

>  For the full patch notes please refer to the [CHANGELOG](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/CHANGELOG.md)

## Installation
`yarn add react-idle-timer`
or
`npm install react-idle-timer --save`

## Usage

> Run `yarn example` to build and run the example `example`. The example is a [create-react-app](https://github.com/facebook/create-react-app) project. IdleTimer is implemented in the [App Component](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/example/src/App.js).

```javascript
import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'
import App from './App'

export default class YourApp extends Component {
  constructor(props) {
    super(props)
    this.idleTimer = null
    this.onAction = this._onAction.bind(this)
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
  }

  render() {
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
		  onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.onAction}
		  debounce={250}
          timeout={1000 * 60 * 15} />
		{/* your app here */}
      </div>
    )
  }

  _onAction(e) {
    console.log('user did something', e)
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

## Migration from v3 to v4

There are a few breaking changes in version 4:

- Although still capable of rendering children, as of version 4 we dont pass children to `IdleTimer`. Unless you are really good with `shouldComponentUpdate` you should avoid using `IdleTimer` as a wrapper component.
- The property `startOnLoad` has been renamed to `startOnMount` in order to make more sense in a React context.
- The property `activeAction` has been renamed to `onActive`.
- The property `idleAction` has been renamed to `onIdle`.

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
- visibilitychange

### Props
- **timeout** {*Number*} - Idle timeout in milliseconds.
- **events** {*Array*} - Events to bind. See [default events](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/src/index.js#L36-L47) for list of defaults.
- **onIdle** {*Function*} - Function to call when user is now idle.
- **onActive** {*Function*} - Function to call when user is no longer idle.
- **onAction** {*Function*} - Function to call on user action.
- **debounce** {Number} - Debounce the `onAction` function with delay in milliseconds.  Defaults to `0`. Cannot be set if `throttle` is set.
- **throttle** {Number} - Throttle the `onAction` function with delay in milliseconds. Defaults to `0`. Cannot be set if `debounce` is set.
- **element** {*Object*} - Defaults to document, may pass a ref to another element.
- **startOnMount** {*Boolean*} - Start the timer when the component mounts.  Defaults to `true`. Set to `false` to wait for user action before starting timer.
- **stopOnIdle** {Boolean} - Stop the timer when user goes idle. Defaults to `false`.  If set to true you will need to manually call `reset()` to restart the timer.
- **passive** {*Boolean*} - Bind events in [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode. Defaults to  `true`.
- **capture** {*Boolean*} - Bind events in [capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode. Defaults to  `true`.

### Methods
- **reset()** *{Void}* - Resets the idleTimer
- **pause()** *{Void}* - Pauses the idleTimer
- **resume()** *{Void}* - Resumes a paused idleTimer
- **getRemainingTime()** *{Number}* - Returns the remaining time in milliseconds
- **getElapsedTime()** *{Number}* - Returns the elapsed time in milliseconds
- **getLastActiveTime()** *{Number}* - Returns the `Timestamp` the user was last active
- **isIdle()** *{Boolean}* - Returns whether or not user is idle
