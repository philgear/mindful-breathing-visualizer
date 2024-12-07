import React, { useState, useEffect } from 'react';

const Timer = ({ seconds, setIsActive }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    let interval = null;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [timeLeft, setIsActive]);

  return (
    <div>
      <p>{timeLeft} seconds</p>
    </div>
  );
};

export default Timer;
