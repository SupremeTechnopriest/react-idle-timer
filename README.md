# ⏱ React Idle Timer

[![npm](https://img.shields.io/npm/v/react-idle-timer.svg)](https://www.npmjs.com/package/react-idle-timer)
[![npm](https://img.shields.io/npm/dt/react-idle-timer.svg)](https://www.npmjs.com/package/react-idle-timer)
![Tests](https://github.com/SupremeTechnopriest/react-idle-timer/workflows/tests/badge.svg)
[![Test Coverage](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/test_coverage)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/df30651fb377f18aeb63/maintainability)](https://codeclimate.com/github/SupremeTechnopriest/react-idle-timer/maintainability)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

⚡️ **Cross Tab Event Reconciliation**<br/>
🚀 **Support for Isomorphic React**<br/>
🎣 **Hook Implementation**

## Upcoming breaking changes in v5

In the next major version, IdleTimer will be dropping default support for dead browsers. The main exports will be for modern browsers and ES Modules only. Version `4.6.3` added a new export for modern browsers to allow Content Security Policies to be added without regenerator-runtime violations:

```javascript
import IdleTimer, { useIdleTimer } from 'react-idle-timer/modern'
```

If your build chain does not support node sub-modules (Webpack <= v4), you will need to import directly from dist. 

```javascript
import IdleTimer, { useIdleTimer } from 'react-idle-timer/dist/modern'
```

In version 5 this will be inverted. The default export will be for modern browsers. If you need support for CommonJS/ Babel compiled source, you will need to import the legacy package:

```javascript
import IdleTimer, { useIdleTimer } from 'react-idle-timer/legacy'
``` 

Again, if your build chain does not support node sub-modules (Webpack <= v4), you will need to import directly from dist.

```javascript
import IdleTimer, { useIdleTimer } from 'react-idle-timer/dist/legacy' 
```

If you have any questions or concerns feel free to open an issue on [github](https://github.com/SupremeTechnopriest/react-idle-timer/issues). The version 5 release is planned for late Q3 - early Q4 2021.

## Latest News

#### Version `4.6.0` adds cross tab support:
☝️ Added robust cross tab support with configurable modes and messaging strategies. See the [documentation](https://github.com/SupremeTechnopriest/react-idle-timer#cross-tab) and [examples](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples) for capabilities and usage.

✌️ Added a `startManually` configuration option enabling manual starting of the timer and activity detection.  A new method called `start()` is also exposed to keep implementations more semantic. It is functionally equivalent to `reset`, but won't call `onActive`.

> This release also includes updates to the test suite and various bug fixes.  See the [CHANGELOG](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/CHANGELOG.md) for a complete list of updates in this version.

#### Version `4.5.0` adds user idle time tracking:

☝️ Added `getTotalIdleTime()` and `getLastIdleTime()` methods to track user idle timings.

#### Version `4.4.0` adds user active time tracking and reduces module size:

☝️ Added `getTotalActiveTime()` method to get the total milliseconds a user has been active for the current session.

✌️ Reduced NPM package size by excluding examples from downloaded module.

#### Version `4.3.0` adds a new hook implementation and some minor performance improvements:

☝️ The hook implementation is here! It takes the same properties and returns the same API as the component implementation. See [here](https://github.com/SupremeTechnopriest/react-idle-timer#hook-usage) for usage or check out the new [example](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples/hook). There are now TypeScript [examples](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/examples) as well.

✌️ Added a new property called `eventsThrottle`. This will throttle the event handler to help decrease cpu usage on certain events (looking at you `mousemove`).  It defaults to 200ms, but can be set however you see fit. To disable this feature, set it to `0`.

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
    this.handleOnAction = this.handleOnAction.bind(this)
    this.handleOnActive = this.handleOnActive.bind(this)
    this.handleOnIdle = this.handleOnIdle.bind(this)
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

  const handleOnAction = event => {
    console.log('user did something', event)
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

## Cross Tab
The `IdleTimer` component and the `useIdleTimer` hook now support cross tab reconciliation of `onIdle` and `onActive` events. This functionality is off by default, so updating to this version will not change how your app operates unless you enable the feature.

The cross tab feature has two modes of operation: **Emit on Leader** and **Emit on All Tabs**.  The default mode is emit on leader:

### Emit on Leader
While in emit on leader mode, the lead tab will be the only emitter of `onIdle` and `onActive` functions.  This is useful if your events should only emit one time once all tabs are idle or when a tab becomes active from an "all idle" state.  To enable this mode, just set `crossTab` to true. 

```javascript
// Hook
useIdleTimer({
  ...
  crossTab: true
})

// Component
<IdleTimer crossTab ... />
```

### Emit on All Tabs
While in emit on all tabs mode, the lead tab will detect when all tabs have become idle or when a tab has become active from an "all idle" state and instruct all tabs to emit their `onIdle` and `onActive` events.  This is useful when your events are used to open a modal, or some other UI intermediary. To enable this mode, set `crossTab` to an object with the property `emitOnAllTabs` set to true.

> If `emitOnAllTabs` is enabled, `start`, `reset`, `pause` and `resume` will also be emitted on all tabs.

```javascript
// Hook
useIdleTimer({
  ...
  crossTab: {
    emitOnAllTabs: true
  }
})

// Component
<IdleTimer 
  ...
  crossTab={{
    emitOnAllTabs: true
  }}
/>
```

### Messaging Strategies
There are three messaging strategies that can be used: `broadcastChannel`, `localStorage` and `simulate`.  By default, the best strategy is chosen automatically.  `broadcastChannel` where it is supported and `localStorage` as a fallback.  The `simulate` strategy is intended for use in test suites and is not considered during automatic strategy selection.

You can override default selection by supplying a `type` parameter to the `crossTab` configuration.

```javascript
// Hook
useIdleTimer({
  ...
  crossTab: {
    type: 'simulate'
  }
})

// Component
<IdleTimer 
  ...
  crossTab={{
    type: 'simulate'
  }}
/>
```

### Additional configuration
The [typescript definitions](https://github.com/SupremeTechnopriest/react-idle-timer/blob/master/src/index.d.ts) and [documentation](https://github.com/SupremeTechnopriest/react-idle-timer#cross-tab) contain all the available configuration options, but you most likely won't need to change them. Here is an example of a fully configured hook and component with their default values. More information about each option is available in the [documentation](https://github.com/SupremeTechnopriest/react-idle-timer#cross-tab) below.

```javascript
// Hook
useIdleTimer({
  crossTab: {
    type: undefined,
    channelName: 'idle-timer',
    fallbackInterval: 2000,
    responseTime: 100,
    removeTimeout: 1000 * 60,
    emitOnAllTabs: false
  }
})

// Component
<IdleTimer 
  crossTab={{
    type: undefined,
    channelName: 'idle-timer',
    fallbackInterval: 2000,
    responseTime: 100,
    removeTimeout: 1000 * 60,
    emitOnAllTabs: false
  }}
/>
```

## Documentation

### Default Events
- `mousemove`
- `keydown`
- `wheel`
- `DOMMouseScroll`
- `mousewheel`
- `mousedown`
- `touchstart`
- `touchmove`
- `MSPointerDown`
- `MSPointerMove`
- `visibilitychange`

### Props

|Name|Type|Default|Description|
|-|-|-|-|
|timeout|`Number`|1000 * 60 * 20|Idle timeout in milliseconds.|
|events|`Array`|[default events](https://github.com/SupremeTechnopriest/react-idle-timer#default-events)|Events to bind.|
|onIdle|`Function`|() => {}|Function to call when user is now idle.|
|onActive|`Function`|() => {}|Function to call when user is no longer idle.|
|onAction|`Function`|() => {}|Function to call on user action.|
|debounce|`Number`|0|Debounce the `onAction` function with delay in milliseconds. Cannot be set if `throttle` is set.|
|throttle|`Number`|0|Throttle the `onAction` function with delay in milliseconds. Cannot be set if `debounce` is set.|
|eventsThrottle|`Number`|200|Throttle the event handler. Helps to reduce cpu utilization on repeated events (`mousemove`).|
|element|`Object`|document|Defaults to document, may pass a ref to another element.|
|startOnMount|`Boolean`|true|Start the timer when the component mounts. Set to `false` to wait for user action before starting timer.|
|startManually|`Boolean`|false|Require the timer to be started manually by calling `reset()` or `start()`.|
|stopOnIdle|`Boolean`|false|Stop the timer when user goes idle. If set to true you will need to manually call `reset()` or `start()` to restart the timer.|
|passive|`Boolean`|true|Bind events in [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode.|
|capture|`Boolean`|true|Bind events in [capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) mode.|
|crossTab|`Boolean`\|`Object`|false|Enable cross tab event reconciliation.|
|crossTab.emitOnAllTabs|`Boolean`|false|Emit events on all tabs.|
|crossTab.type|`String`|undefined|Message strategy to use. Selected automatically if left `undefined`. Can be one of `broadcastChannel`, `localStorage` or `simulate`.|
|crossTab.channelName|`String`|idle-timer|Name of the BroadcastChannel or localStorage key.|
|crossTab.fallbackInterval|`Number`|2000|How often renegotiation for leader will occur.|
|crossTab.responseTime|`Number`|100|How long tab instances will have to respond.|
|crossTab.removeTimeout|`Number`|1000 * 60|LocalStorage item time to live.|

### Methods
| Name                 | Returns   | Description                                                                                |
|----------------------|-----------|--------------------------------------------------------------------------------------------|
| start()              | `Void`    | Starts the idleTimer. Won't call `onActive`.                                               |
| reset()              | `Void`    | Resets the idleTimer. Calls `onActive`.                                                    |
| pause()              | `Void`    | Pauses the idleTimer.                                                                      |
| resume()             | `Void`    | Resumes a paused idleTimer.                                                                |
| getRemainingTime()   | `Number`  | Returns the remaining time in milliseconds.                                                |
| getElapsedTime()     | `Number`  | Returns the elapsed time in milliseconds.                                                  |
| getLastIdleTime()    | `Number`  | Returns the `Timestamp` the user was last idle.                                            |
| getTotalIdleTime()   | `Number`  | Returns the amount of time in milliseconds the user was idle.                              |
| getLastActiveTime()  | `Number`  | Returns the `Timestamp` the user was last active.                                          |
| getTotalActiveTime() | `Number`  | Returns the amount of time in milliseconds the user was active.                            |
| isIdle()             | `Boolean` | Returns whether or not user is idle.                                                       |
| isLeader()           | `Boolean` | Returns whether or not this is the leader tab. Always `true` if `crossTab` is not enabled. |

