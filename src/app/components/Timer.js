import React, { useState, useEffect } from "react";

export default function CountdownTimer ({ initialSeconds, onComplete, style }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (timeLeft <= 0) {
        onComplete(timeElapsed)
        return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
      setTimeElapsed(timeElapsed + 1)
    }, 1000);

    
    return () => clearInterval(intervalId);
  }, [timeLeft]); 

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  };

  return (
    <div className={style}>
      <h1>Time Remaining: {formatTime(timeLeft)}</h1>
      {timeLeft === 0 && <p>Countdown complete!</p>}
    </div>
  );
}