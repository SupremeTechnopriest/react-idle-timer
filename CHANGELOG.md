### 4.6.4
- Make `ref` optional in typedef.

### 4.6.3
- Add missing `ref` to TypeScript definitions.
- Fixed a bug where reset would not propagate cross tab.
- Exported a bundle for modern browsers.  This will become the default in version 5.  If you require dead browser support, you will need to import from legacy. `import IdleTimer from 'react-idle-timer/legacy' for Webpack 5 and `import IdleTimer from 'react-idle-timer/dist/legacy' for webpack 4 and below.

### 4.6.2
- Allow for dynamically setting `onActive` and `onIdle` event handlers in conjunction with cross tab event reconciliation.

### 4.6.1
- When `emitOnAllTabs` is set to `true`, `start`, `reset`, `pause` and `resume` will be called on all tabs.
- Calling `reset` will now automatically fire `onActive` while calling `start` will not. Otherwise these two methods are functionally equivalent.
- Fixed a type-o in propTypes, typescript definitions and docs.
- Fixed an issue where the `localStorage` method would not call `idle` if there wasn't any user activity on the page.
- Fixed an issue where the `TabManager` would not deregister itself when the tab was closed if it was not the leader tab.

## 4.6.0
- Added cross tab support. See examples and README for usage and documentation.
- Added an `isLeader()` method that returns a boolean indicating wether or not the current tab is the lead orchestrator for cross tab reconciliation. 
- Added a `startManually` configuration option to enable starting of the timer and activity detection manually. An alias to `reset()` called `start()` is also exposed to keep the code more semantic. If `startManually` is set to `true`, the `IdleTimer` component and `useIdleTimer` hook wont start until `reset()` or `start()` are called.
- Fixed a bug where throttle and debounce wouldn't work at higher values in useIdleTimer.
- Updated test suite.

### 4.5.6
- Calling `resume` or `pause` from inside a `useEffect` will now properly bind and unbind events.

### 4.5.5
- Setting a timeout dynamically will now call onActive if the user is idle.

### 4.5.4
- Bind `getLastIdleTime` to component scope making the method callable.

### 4.5.3
- Bind `getTotalActiveTime` and `getTotalIdleTime` to component scope making the methods callable.

### 4.5.2
- Added the ability to set timeout after the component has been mounted. Doing so will reset the timer automatically.

### 4.5.1
- Added the ability to set timeout after the hook has been mounted. Doing so will reset the timer automatically.

## 4.5.0
- Refactor `getTotalActiveTime` to be accurate in more scenarios.
- Added  `getLastIdleTime` and `getTotalIdleTime` methods.
- Switched from travis to github actions.

### 4.4.2
- Update peerDependencies to support React versions greater than 16.

### 4.4.1
- Reduce bundle size by excluding examples from npm package.
- Update README.md.

## 4.4.0
- Added `getTotalActiveTime` method.  Returns the total time in milliseconds the user was active.

### 4.3.7
- Added more event types to typescript definition
- Fixed a type-o in the default events (mouseWheel -> mousewheel)

### 4.3.6
- Fixed a type-o in the README examples.

### 4.3.5
- Fixed a regression affecting older minifiers that don't know how to deal with `let` and `const`. Re-implement babel to transpile to `var`.

### 4.3.4
- Fixed a regression where debounced and throttled were not applied to onAction.

### 4.3.2
- Fixed an issue where callback functions were not being updated. #122

### 4.3.1
- Added TypeScript examples.
- Fixed an issue with TypeScript typings.

## 4.3.0
- Added `useIdleTimer` hook implementation.
- Added `eventsThrottle` to reduce cpu using on events that can spam the event handler. Defaults to 200ms.
- Updated all dependencies, added new examples and cleaned up build chain.

### 4.2.12
- Added `visibilitychange` event to default events. (see #98)

### 4.2.11
- Fixes an issue where in mobile devices after backgrounding with `stopOnIdle` set. (see #96)

### 4.2.10
- Fixes a bug where onIdle was not triggered consistently on iOS. (see #94)
- Refactor of toggleIdle function to prevent race conditions. (see #93)

### 4.2.9
- Fixes a bug where HMR systems would prevent events from unbinding. (see #87)

### 4.2.8
- Fixes a bug where a paused timer would return the wrong remaining time when resumed.

### 4.2.7
- Fixes a regression introduced in v4.2.6.  If you rely on `getRemainingTime()` you should update to this patch.

### 4.2.6
- Update dependencies
- Fix a bug where `reset()` was not resetting `getRemainingTime()`
- `componentWillMount` is deprecated. Moved logic to `componentDidMount`

### 4.2.5
- Remove ref from typedef as it's included in the React Component interface (see #76)

### 4.2.4
- Fixes typescript definition for evented methods
- Fixes a bug where throttled and debounced actions would not take new props

### 4.2.3
- Fixes an issue importing module with typescript (see #72)

### 4.2.2
- Fixes an issue updating state from inside onIdle (see #71)

### 4.2.1

- Added a typescript definition that will now be maintained along with this library. It expects that you have the react type definitions installed.
- Fixed a documentation error

## 4.2.0

Version `4.2.0` will now dynamically bind and unbind events.

Events are unbound when:
- `stopOnIdle` is set to `true` and the user goes idle
- `pause()` is called

Events are bound when:
- component is mounted
- `reset()` is called
- `resume()` is called

### 4.1.3
- `stopOnIdle` will now keep `IdleTimer` in idle state until `reset()` is called

### 4.1.2
- Fixes a bug where `stopOnIdle` logic was being applied to active state

### 4.1.1
- Fixes a bug where initial `onIdle` event was not firing when `stopOnIdle` is set

## 4.1.0

- Added property `stopOnIdle` defaults to `false`. Setting to `true` will prevent user activity from restarting the `IdleTimer` once it has gone idle.  This useful if you want to do some custom async stuff before the `IdleTimer` gets restarted.  In order to restart the `IdleTimer` call `reset()` on your ref.
- Added event handler `onActive` which enables reporting of all user activity from `IdleTimer`.  The built in `debounce` or `throttle` properties will help increase performance if you are using the `onActive` event. By default `debounce` and `throttle` are off.  Only one can be enabled at a time.
- Added property `debounce` defaults to 0.  Set the `onActive` debounce delay in milliseconds. The `throttle` property cannot be set if this property is set.
- Added property `throttle` defaults to 0.  Set the `onActive` throttle delay in milliseconds.  The `debounce` property cannot be set if this property is set.

### 4.0.9

- Fixes a memory leak when IdleTimer is unmounted.  Events need to be removed exactly the same way they are added. See [here](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal)

### 4.0.8
- Fixed a bug where passive and capture were not being passed to the event listener.  The function has been reformated so it reads better.

### 4.0.7
- Fixed some inconsistencies in the README
- Added default prop values to documentation

### 4.0.5 - 4.0.6
- Fixes a bug where setting `startOnMount` to `false` starts IdleTimer in the wrong state

### 4.0.4
- Fixes a bug where the module could not be imported

### 4.0.1 - 4.0.3
- Minor documentation updates
- Continuous integration bugfixes

# 4.0.0
Version 4.0 contains a rewrite of the build system and a refactor of the source code for IdleTimer.  After accepting many pull requests, the projects code style was destroyed.  We added in some forced styling and will not be accepting PRs that don't respect this style. Contribution guide now on the README.  

## Breaking Changes
- The property `startOnLoad` has been renamed to `startOnMount` to make more sense in a react context.
- The property `activeAction` has been renamed to `onActive`.
- The property `idleAction` has been renamed to `onIdle`.

## Enhancements
- Added [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) property.  Defaults to `true`, bind events with passive mode enabled
- Added [capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) property.  Defaults to `true`, bind events with capture mode enabled
- Pass event through to `idle` and `active` handler functions

## Bugfixes
- Fixed installation bug on windows machines. This was due to the use of environment variables in the build scripts. The new build system does not rely on environment variables defined at the cli level

# 3.0.0
We dropped support for date formatting in version 3. React idle timer returns raw date objects and you can use which ever library you like to format it. If you would like to continue using the built in formatter, stick with version 2.

## Breaking Changes
- Removed built in date formatter.

# 2.0.0
Added support for isomorphic react!

# 1.0.0
Initial release
