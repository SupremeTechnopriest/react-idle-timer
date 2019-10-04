import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Component
} from "react";
import IdleTimer from "react-idle-timer";
import prettyMilliseconds from "pretty-ms";
import useInterval from "./useInterval";

export default function App() {
  const idleTimer = useRef(null);
  const [timeout, setTimeout] = useState(3000);
  const [isIdle, setIsIdle] = useState(false);
  const [remaining, setRemaining] = useState(timeout);
  const [lastActive, setLastActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const appIsActive = () => {
    setIsIdle(false);
  };

  const appIsIdle = () => {
    setIsIdle(true);
  };

  const reset = useCallback(() => {
    idleTimer.current.reset();
  }, [idleTimer]);

  const pause = useCallback(() => {
    idleTimer.current.reset();
  }, [idleTimer]);

  const resume = useCallback(() => {
    idleTimer.current.reset();
  }, [idleTimer]);

  useInterval(() => {
    console.log(idleTimer);
    setRemaining(idleTimer.current.getRemainingTime());
    setLastActive(idleTimer.current.getLastActiveTime());
    setElapsed(idleTimer.current.getElapsedTime());
  }, 200);

  return (
    <div>
      <IdleTimer
        ref={idleTimer}
        onActive={appIsActive}
        onIdle={appIsIdle}
        timeout={timeout}
        startOnLoad
      />
      <div>
        <div>
          <h1>Timeout: {timeout} mS</h1>
          <h1>Time Remaining: {remaining} mS</h1>
          <h1>Time Elapsed: {elapsed} mS</h1>
          <h1>
            Last Active:{" "}
            {prettyMilliseconds(new Date() - lastActive, {
              keepDecimalsOnWholeSeconds: true
            })}{" "}
            ago
          </h1>
          <h1>Idle: {isIdle.toString()}</h1>
        </div>
        <div>
          <button onClick={reset}>RESET</button>
          <button onClick={pause}>PAUSE</button>
          <button onClick={resume}>RESUME</button>
        </div>
      </div>
    </div>
  );
}
