import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DiaphragmaticBreathing = () => {
  const [seconds, setSeconds] = useState(5);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 5) {
      clearInterval(interval);
      setSeconds(5);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
  };

  return (
    <div>
      <h1>Diaphragmatic Breathing</h1>
      <div>
        <motion.div
          style={{
            width: `${(seconds / 5) * 100}%`,
            height: '20px',
            backgroundColor: 'green',
            borderRadius: '5px',
          }}
          animate={{ width: `${(seconds / 5) * 100}%` }}
          transition={{ duration: 1 }}
        />
        <p>{seconds} seconds</p>
      </div>
      {seconds > 0 ? (
        <button onClick={handleStart}>Start</button>
      ) : (
        <button onClick={handleReset}>Reset</button>
      )}
    </div>
  );
};

export default DiaphragmaticBreathing;
