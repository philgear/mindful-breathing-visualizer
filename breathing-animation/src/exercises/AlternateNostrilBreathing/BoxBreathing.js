import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BoxBreathing = () => {
  const [seconds, setSeconds] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 5) {
      clearInterval(interval);
      setSeconds(5);
      setCurrentPhase('inhale');
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds === 0) {
      setIsActive(false);
    }
  }, [seconds]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
  };

  const phaseDurations = {
    inhale: 5,
    hold: 5,
    exhale: 5,
    hold2: 5,
  };

  let currentPhase;
  if (seconds === 5) {
    currentPhase = 'inhale';
  } else if (seconds === 0) {
    currentPhase = 'inhale';
  } else if (seconds <= 0) {
    currentPhase = 'inhale';
  } else if (seconds <= phaseDurations.inhale) {
    currentPhase = 'inhale';
  } else if (seconds <= phaseDurations.inhale + phaseDurations.hold) {
    currentPhase = 'hold';
  } else if (seconds <= phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale) {
    currentPhase = 'exhale';
  } else {
    currentPhase = 'hold2';
  }

  return (
    <div>
      <h1>Box Breathing</h1>
      <div>
        <motion.div
          style={{
            width: `${(seconds / 5)