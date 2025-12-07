import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BreathingAnimation = ({ duration, inhaleDuration, holdDuration, exhaleDuration, type }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('inhale');

  useEffect(() => {
    let animationInterval;

    const totalDuration = inhaleDuration + holdDuration + exhaleDuration;
    const phaseDurations = {
      inhale: inhaleDuration,
      hold: holdDuration,
      exhale: exhaleDuration,
    };

    const startAnimation = () => {
      animationInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          if (newProgress > totalDuration) {
            clearInterval(animationInterval);
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    };

    startAnimation();

    return () => clearInterval(animationInterval);
  }, [inhaleDuration, holdDuration, exhaleDuration]);

  const phaseProgress = progress % (inhaleDuration + holdDuration + exhaleDuration);
  let currentPhase;
  if (phaseProgress < inhaleDuration) {
    currentPhase = 'inhale';
  } else if (phaseProgress < inhaleDuration + holdDuration) {
    currentPhase = 'hold';
  } else {
    currentPhase = 'exhale';
  }

  const progressPercentage = (phaseProgress / (inhaleDuration + holdDuration + exhaleDuration)) * 100;

  return (
    <div>
      <motion.div
        style={{
          width: `${progressPercentage}%`,
          height: '20px',
          backgroundColor: 'green',
          borderRadius: '5px',
        }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 1 }}
      />
      <p>{currentPhase}</p>
    </div>
  );
};

export default BreathingAnimation;
