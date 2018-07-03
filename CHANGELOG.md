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
We dropped support for date formatting in version 3.  React idle timer returns raw date objects and you can use which ever library you like to format it. If you would like to continue using the built in formatter, stick with version 2.

## Breaking Changes
- Removed built in date formatter.
