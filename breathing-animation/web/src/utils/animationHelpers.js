export const animateValue = (initialValue, finalValue, duration, currentTime) => {
  if (currentTime >= duration) {
    return finalValue;
  }
  return initialValue + (finalValue - initialValue) * currentTime / duration;
};

export const generateBreathingAnimation = (pattern, speed, duration) => {
  const animation = [];
  for (let i = 0; i < duration; i++) {
    animation.push(pattern(i, speed));
  }
  return animation;
};
