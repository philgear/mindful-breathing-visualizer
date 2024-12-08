export const breathingPatterns = {
  square: (time, speed) => {
    const cycleDuration = 60 / speed;
    const phase = time % cycleDuration;
    if (phase < cycleDuration / 4) {
      return phase / (cycleDuration / 4);
    } else if (phase < cycleDuration / 2) {
      return 1;
    } else if (phase < 3 * cycleDuration / 4) {
      return 1 - (phase - cycleDuration / 2) / (cycleDuration / 4);
    } else {
      return 0;
    }
  },
  triangle: (time, speed) => {
    const cycleDuration = 120 / speed;
    const phase = time % cycleDuration;
    if (phase < cycleDuration / 2) {
      return phase / (cycleDuration / 2);
    } else {
      return 1 - (phase - cycleDuration / 2) / (cycleDuration / 2);
    }
  },
  sine: (time, speed) => {
    return 0.5 + 0.5 * Math.sin(2 * Math.PI * time / (60 / speed));
  }
};
