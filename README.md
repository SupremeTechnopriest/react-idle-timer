# ⏱ React Idle Timer

![npm](https://img.shields.io/npm/v/react-idle-timer.svg)
![npm](https://img.shields.io/npm/dt/react-idle-timer.svg)
![Travis](https://img.shields.io/travis/SupremeTechnopriest/react-idle-timer.svg)
[![Test Coverage](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/test_coverage)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/maintainability)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/maintainability)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

⚡️ **Support for React 16**<br/>
🚀 **Support for Isomorphic React**<br/>
🎣 **Hook Implementation**

## Latest News

#### Version `4.3.0` adds a new hook implementation and some minor performance improvements:

☝️ The hook implementation is here! It takes the same properties and returns the same API as the component implementation. See [here](https://github.com/SupremeTechnopriest/react-idle-timer#hook-usage) for usage or check out the new [example](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples/hook). There are now TypeScript [examples](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples) as well.

✌️ Added a new property called `eventsThrottle`. This will throttle the event handler to help decrease cpu usage on certain events (looking at you `mousemove`).  It defaults to 200ms, but can be set however you see fit. To disable this feature, set it to `0`.


>  For the full patch notes please refer to the [CHANGELOG](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/CHANGELOG.md)

## Installation
```
yarn add react-idle-timer
``` 
or 
```
npm install react-idle-timer --save
```

## Examples
You can install the dependencies for all the examples by running:
```
npm run example-install
```

## Component Usage

> Run `npm run example-component` to build and run the component example. The example is a [create-react-app](https://github.com/facebook/create-react-app) project. IdleTimer is implemented in the [App Component](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples/component/src/App.js).

```javascript
import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'

export default class YourApp extends Component {
  constructor(props) {
    super(props)
    this.idleTimer = null
    this.handleOnAction = this.handleOnnAction.bind(this)
    this.handleOnActive = this.handleOnnActive.bind(this)
    this.handleOnIdle = this.handleOnnIdle.bind(this)
  }

  render() {
    return (
      <div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          timeout={1000 * 60 * 15}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          onAction={this.handleOnAction}
          debounce={250}
        />
        {/* your app here */}
      </div>
    )
  }

  handleOnAction (event) {
    console.log('user did something', event)
  }

  handleOnActive (event) {
    console.log('user is active', event)
    console.log('time remaining', this.idleTimer.getRemainingTime())
  }

  handleOnIdle (event) {
    console.log('user is idle', event)
    console.log('last active', this.idleTimer.getLastActiveTime())
  }
}
```

## Hook Usage

> Run `npm run example-hook` to build and run the hook example. The example is a [create-react-app](https://github.com/facebook/create-react-app) project. IdleTimer is implemented in the [App Component](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples/hook/src/App.js).

```javascript
import React from 'react'
import { useIdleTimer } from 'react-idle-timer'
import App from './App'

export default function (props) {
  const handleOnIdle = event => {
    console.log('user is idle', event)
    console.log('last active', getLastActiveTime())
  }

  const handleOnActive = event => {
    console.log('user is active', event)
    console.log('time remaining', getRemainingTime())
  }

  const handleOnAction = (e) => {
    console.log('user did something', e)
  }

  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 15,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction,
    debounce: 500
  })

  return (
    <div>
      {/* your app here */}
    </div>
  )
}
```

## Migration from v3 to v4

There are a few breaking changes in version 4:

- Although still capable of rendering children, as of version 4 we don't pass children to `IdleTimer`. Unless you are really good with `shouldComponentUpdate` you should avoid using `IdleTimer` as a wrapper component.
- The property `startOnLoad` has been renamed to `startOnMount` in order to make more sense in a React context.
- The property `activeAction` has been renamed to `onActive`.
- The property `idleAction` has been renamed to `onIdle`.

## Documentation

### Default Events
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
- **events** {*Array*} - Events to bind. See [default events](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/src/utils.js#L22-L34) for list of defaults.
- **onIdle** {*Function*} - Function to call when user is now idle.
- **onActive** {*Function*} - Function to call when user is no longer idle.
- **onAction** {*Function*} - Function to call on user action.
- **debounce** {*Number*} - Debounce the `onAction` function with delay in milliseconds.  Defaults to `0`. Cannot be set if `throttle` is set.
- **throttle** {*Number*} - Throttle the `onAction` function with delay in milliseconds. Defaults to `0`. Cannot be set if `debounce` is set.
- **eventsThrottle** {*Number*} - Throttle the event handler. Helps to reduce cpu usage on repeated events (`mousemove`). Defaults to `200`.
- **element** {*Object*} - Defaults to document, may pass a ref to another element.
- **startOnMount** {*Boolean*} - Start the timer when the component mounts.  Defaults to `true`. Set to `false` to wait for user action before starting timer.
- **stopOnIdle** {*Boolean*} - Stop the timer when user goes idle. Defaults to `false`.  If set to true you will need to manually call `reset()` to restart the timer.
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
