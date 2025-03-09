//web/js/src/breathing.js

// ===================================
// Base class for all breathing exercises
// ===================================
class BreathingExercise {
  constructor(animationContainer, options) {
      this.animationContainer = animationContainer;
      this.options = options;
      this.animationElement = null;
      this.timerId = null;
      this.phaseDurations = null;
      this.currentPhase = null;
      this.promptContainer = null;
      this.promptElement = null; // Keep promptElement for all exercises
  }

  setupAnimation() {
      this.animationElement = document.createElement('div');
      this.animationElement.classList.add(this.animationStyle + '-animation');
      this.animationContainer.innerHTML = '';
      this.animationContainer.appendChild(this.animationElement);

      // Create a new container for the prompt text
      if (!this.promptContainer) {
          this.promptContainer = document.createElement('div');
          this.promptContainer.classList.add('prompt-container');

          // Create the prompt element and append it to the prompt container
          this.promptElement = document.createElement('div');
          this.promptElement.classList.add('prompt-text');
          this.promptContainer.appendChild(this.promptElement);
          this.animationContainer.parentNode.insertBefore(this.promptContainer, this.animationContainer.nextSibling);
      }
      
  }

  start() {
      throw new Error("start() method must be implemented in the subclass");
  }

  stop() {
      clearTimeout(this.timerId);
      this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
      this.animationElement.style.transform = '';
      this.promptElement.style.transform = '';
      this.promptElement.textContent = ''; // Clear the prompt text
  }

  getPhaseDurations(inhaleTime, holdTime, exhaleTime) {
      return {
          inhaleDuration: inhaleTime * 1000,
          holdDuration: holdTime * 1000,
          exhaleDuration: exhaleTime * 1000
      };
  }

  animate = () => { } // Empty in base class
}

// ===================================
// Subclass for Box Breathing Exercise
// ===================================
class BoxBreathing extends BreathingExercise {
  constructor(animationContainer, options) {
      super(animationContainer, options);
      this.animationStyle = this.options.animationStyle;
      this.setupAnimation();
  }

  start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.animate();
  }

  animate = () => {
      if (this.currentPhase === 'inhale') {
          this.animationElement.classList.add('inhale');
          this.animationElement.classList.remove('exhale', 'hold', 'holdAfterExhale');
          this.promptElement.textContent = 'Inhale'; // Use promptElement
          this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration / 1000}s ease, background-color ${this.phaseDurations.inhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'scale(2)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'hold';
              this.animate();
          }, this.phaseDurations.inhaleDuration);
      } else if (this.currentPhase === 'hold') {
          this.animationElement.classList.add('hold');
          this.animationElement.classList.remove('exhale', 'inhale', 'holdAfterExhale');
          this.promptElement.textContent = 'Hold'; // Use promptElement
          this.timerId = setTimeout(() => {
              this.currentPhase = 'exhale';
              this.animate();
          }, this.phaseDurations.holdDuration);
      } else if (this.currentPhase === 'exhale') {
          this.animationElement.classList.add('exhale');
          this.animationElement.classList.remove('inhale', 'hold', 'holdAfterExhale');
          this.promptElement.textContent = 'Exhale'; // Use promptElement
          this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration / 1000}s ease, background-color ${this.phaseDurations.exhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'scale(1)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'holdAfterExhale';
              this.animate();
          }, this.phaseDurations.exhaleDuration);
      } else if (this.currentPhase === 'holdAfterExhale') {
          this.animationElement.classList.add('holdAfterExhale');
          this.animationElement.classList.remove('exhale', 'inhale', 'hold');
          this.promptElement.textContent = 'Hold'; // Use promptElement
          this.timerId = setTimeout(() => {
              this.currentPhase = 'inhale';
              this.animate();
          }, this.phaseDurations.holdDuration);
      }
  };
}

// ===================================
// Subclass for Diaphragmatic Breathing Exercise
// ===================================
class DiaphragmaticBreathing extends BreathingExercise {
  constructor(animationContainer, options) {
      super(animationContainer, options);
      this.animationStyle = this.options.animationStyle;
      this.setupAnimation();
  }

  start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.animate();
  }

  animate = () => {
      if (this.currentPhase === 'inhale') {
          this.animationElement.classList.add('inhale');
          this.animationElement.classList.remove('exhale');
          this.promptElement.textContent = 'Inhale'; // Use promptElement
          this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration / 1000}s ease, background-color ${this.phaseDurations.inhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'scale(1.5)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'exhale';
              this.animate();
          }, this.phaseDurations.inhaleDuration);
      } else if (this.currentPhase === 'exhale') {
          this.animationElement.classList.add('exhale');
          this.animationElement.classList.remove('inhale');
          this.promptElement.textContent = 'Exhale'; // Use promptElement
          this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration / 1000}s ease, background-color ${this.phaseDurations.exhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'scale(1)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'inhale';
              this.animate();
          }, this.phaseDurations.exhaleDuration);
      }
  };
}

// ===================================
// Subclass for Alternate Nostril Breathing Exercise
// ===================================
class AlternateNostrilBreathing extends BreathingExercise {
  constructor(animationContainer, options) {
      super(animationContainer, options);
      this.animationStyle = this.options.animationStyle;
      this.setupAnimation();
  }

  start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.animate();
  }

  animate = () => {
      if (this.currentPhase === 'inhale') {
          this.animationElement.classList.add('inhale');
          this.animationElement.classList.remove('exhale', 'hold', 'holdAfterExhale');
          this.promptElement.textContent = 'Inhale Left';
          this.promptElement.classList.add('prompt-left'); 
          this.promptElement.classList.remove('prompt-right'); 

          this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration / 1000}s ease, background-color ${this.phaseDurations.inhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'translateX(-50px)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'hold';
              this.animate();
          }, this.phaseDurations.inhaleDuration);

      } else if (this.currentPhase === 'hold') {
          this.animationElement.classList.add('hold');
          this.animationElement.classList.remove('inhale', 'exhale', 'holdAfterExhale');
          this.promptElement.textContent = 'Hold';
          this.promptElement.classList.add('prompt-left'); // Keep left class
          this.promptElement.classList.remove('prompt-right'); // Ensure right is removed
          this.timerId = setTimeout(() => {
              this.currentPhase = 'exhale';
              this.animate();
          }, this.phaseDurations.holdDuration);

      } else if (this.currentPhase === 'exhale') {
          this.animationElement.classList.add('exhale');
          this.animationElement.classList.remove('inhale', 'hold', 'holdAfterExhale');
          this.promptElement.textContent = 'Exhale Right';
          this.promptElement.classList.add('prompt-right'); // Add right class
          this.promptElement.classList.remove('prompt-left');  // Remove left class

          this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration / 1000}s ease, background-color ${this.phaseDurations.exhaleDuration / 1000}s ease`;
          this.animationElement.style.transform = 'translateX(50px)';
          this.timerId = setTimeout(() => {
              this.currentPhase = 'holdAfterExhale';
              this.animate();
          }, this.phaseDurations.exhaleDuration);
      } else if (this.currentPhase === 'holdAfterExhale') {
          this.animationElement.classList.add('holdAfterExhale');
          this.animationElement.classList.remove('inhale', 'exhale', 'hold');
          this.promptElement.textContent = 'Hold';
          this.promptElement.classList.add('prompt-right'); // Keep right class
          this.promptElement.classList.remove('prompt-left'); // Ensure left is removed
          this.timerId = setTimeout(() => {
              this.currentPhase = 'inhale';
              this.animate();
          }, this.phaseDurations.holdDuration);
      }
  }
}

// Function to populate a select element with options from 1 to 10
function populateSelectOptions(selectElement, maxValue) {
  for (let i = 1; i <= maxValue; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = i;
      selectElement.appendChild(option);
  }
}

// Function to set default values for select elements
function setDefaultSelectValues(inhaleId, holdId, exhaleId, sessionId, inhaleVal, holdVal, exhaleVal, sessionVal) {
  document.getElementById(inhaleId).value = inhaleVal;
  document.getElementById(holdId).value = holdVal;
  document.getElementById(exhaleId).value = exhaleVal;
  document.getElementById(sessionId).value = sessionVal;
}

// ===================================
// DOM Manipulation and Logic
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  const animationContainer = document.getElementById('animation-container');
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const exerciseSelect = document.getElementById('exerciseSelect');
  const inhaleTimeSelect = document.getElementById('inhaleTime');
  const holdTimeSelect = document.getElementById('holdTime');
  const exhaleTimeSelect = document.getElementById('exhaleTime');
  const sessionDurationSelect = document.getElementById('sessionDuration');
  const animationStyleSelect = document.getElementById('animationStyle');
  const instructionsContainer = document.getElementById('instructions-container');
  const optionsContainer = document.querySelector('.options');
  let currentExercise = null;
  let sessionTimer = null;

  // Populate select elements with options.
  populateSelectOptions(inhaleTimeSelect, 10);
  populateSelectOptions(holdTimeSelect, 10);
  populateSelectOptions(exhaleTimeSelect, 10);
  populateSelectOptions(sessionDurationSelect, 10);

  // Set default values for select elements.
  setDefaultSelectValues('inhaleTime', 'holdTime', 'exhaleTime', 'sessionDuration', '4', '4', '4', '5');

  // Default instructions (Box Breathing).
  const defaultInstructions = `
      <h3>Box Breathing Instructions</h3>
      <p>Box breathing is a simple yet powerful technique...</p>
      <ul>
          <li><strong>Inhale:</strong> Breathe in slowly...</li>
          <li><strong>Hold:</strong> Hold your breath...</li>
          <li><strong>Exhale:</strong> Breathe out slowly...</li>
          <li><strong>Hold:</strong> Hold your breath again...</li>
      </ul>
      <p>Repeat this cycle...</p>
  `;
  instructionsContainer.innerHTML = defaultInstructions;

  // Create the initial BoxBreathing instance (but don't start it yet).
  currentExercise = new BoxBreathing(animationContainer, { animationStyle: animationStyleSelect.value });


  // Event listener for changing breathing exercise.
  exerciseSelect.addEventListener('change', () => {
    const instructions = {
        boxBreathing: `
            <h3>Box Breathing Instructions</h3>
            <p>Box breathing is a simple yet powerful technique that involves inhaling, holding, exhaling, and holding again, each for the same count. It's like tracing the four sides of a box with your breath.</p>
            <p>Here's how to practice it:</p>
            <ul>
                <li><strong>Inhale:</strong> Breathe in slowly and deeply through your nose to a count of 4 seconds.</li>
                <li><strong>Hold:</strong> Hold your breath for a count of 4 seconds.</li>
                <li><strong>Exhale:</strong> Breathe out slowly through your mouth to a count of 4 seconds.</li>
                <li><strong>Hold:</strong> Hold your breath again for a count of 4 seconds.</li>
            </ul>
            <p>Repeat this cycle for the duration of the session. Focus on the rhythm and the sensation of your breath.</p>
        `,
        diaphragmaticBreathing: `
            <h3>Diaphragmatic Breathing Instructions</h3>
            <p>Diaphragmatic breathing, also known as belly breathing, involves fully engaging the stomach, abdominal muscles, and diaphragm when breathing. This technique helps you use your diaphragm correctly and efficiently.</p>
            <p>Follow these steps:</p>
            <ul>
                <li><strong>Position:</strong> Lie on your back on a flat surface or in bed, with your knees bent and your head supported. You can place a pillow under your knees for added comfort.</li>
                <li><strong>Hand Placement:</strong> Place one hand on your upper chest and the other just below your rib cage. This will allow you to feel your diaphragm move as you breathe.</li>
                <li><strong>Inhale:</strong> Breathe in slowly through your nose so that your stomach moves out against your hand. The hand on your chest should remain as still as possible.</li>
                <li><strong>Exhale:</strong> Tighten your stomach muscles, letting them fall inward as you exhale through pursed lips. The hand on your upper chest should remain as still as possible.</li>
            </ul>
            <p>Practice for 5 to 10 minutes, several times a day if possible. Focus on feeling your belly rise and fall with each breath.</p>
        `,
        alternateNostrilBreathing: `
            <h3>Alternate Nostril Breathing Instructions</h3>
            <p>Alternate Nostril Breathing is a yogic practice that involves breathing in and out through alternate nostrils. It's believed to balance the two hemispheres of the brain and calm the mind.</p>
            <p>Follow these steps:</p>
            <ul>
                <li><strong>Position:</strong> Sit comfortably with your spine straight and your body relaxed.</li>
                <li><strong>Hand Placement:</strong> Place your left hand on your left knee. Use your right hand to control your breath.</li>
                <li><strong>Inhale:</strong> Close your right nostril with your right thumb and inhale slowly through your left nostril.</li>
                <li><strong>Hold:</strong> Close both nostrils (use your ring finger to close the left nostril) and hold the breath.</li>
                <li><strong>Exhale:</strong> Release your thumb and exhale slowly through your right nostril.</li>
                <li><strong>Inhale:</strong> Inhale slowly through your right nostril.</li>
                <li><strong>Hold:</strong> Close both nostrils again and hold.</li>
                <li><strong>Exhale:</strong> Release your ring finger and exhale slowly through your left nostril.</li>
            </ul>
            <p>Continue this cycle, alternating between nostrils after each inhalation. Focus on making each breath smooth and controlled.</p>
        `
    };

    instructionsContainer.innerHTML = instructions[exerciseSelect.value] || defaultInstructions;
    instructionsContainer.classList.add('fade-in');

    // Stop and reset any existing exercise. VERY IMPORTANT!
    stopBreathing();

    // Create a new instance of the *selected* exercise (but don't start).
    const animationStyle = animationStyleSelect.value; // Get current style.
    if (exerciseSelect.value === 'boxBreathing') {
        currentExercise = new BoxBreathing(animationContainer, { animationStyle: animationStyle });
    } else if (exerciseSelect.value === 'diaphragmaticBreathing') {
        currentExercise = new DiaphragmaticBreathing(animationContainer, { animationStyle: animationStyle});
    } else if (exerciseSelect.value === 'alternateNostrilBreathing') {
        currentExercise = new AlternateNostrilBreathing(animationContainer, { animationStyle: animationStyle });
    }
});

  // Trigger the 'change' event on page load to set initial instructions.
  exerciseSelect.dispatchEvent(new Event('change'));

  // Event listener for the start button.
  startButton.addEventListener('click', () => {
      const inhaleTime = parseInt(inhaleTimeSelect.value, 10);
      const holdTime = parseInt(holdTimeSelect.value, 10);
      const exhaleTime = parseInt(exhaleTimeSelect.value, 10);
      const sessionDuration = parseInt(sessionDurationSelect.value, 10);

      // Start the *existing* exercise with the *current* values.
      currentExercise.start(inhaleTime, holdTime, exhaleTime);
      startSessionTimer(sessionDuration);

      startButton.disabled = true;
      stopButton.disabled = false;

      // Add fade-out to options, start button, and instructions.
      document.querySelector('.options').classList.add('fade-out');
      startButton.classList.add('fade-out');
      optionsContainer.classList.add('fade-out');
      instructionsContainer.classList.add('fade-out');

      // Add fade-out to all select elements and input groups.
      document.querySelectorAll('select, .input-group').forEach(element => {
          element.classList.add('fade-out');
      });
  });

  // Event listener for the stop button.
  stopButton.addEventListener('click', stopBreathing);

  // Function to stop the breathing exercise and reset UI.
  function stopBreathing() {
      if (currentExercise) {
          currentExercise.stop();
      }
      clearInterval(sessionTimer);

      // Remove the timer display if it exists.
      const timerDisplay = document.getElementById('timerDisplay');
      if (timerDisplay) {
          timerDisplay.remove();
          
      }

      startButton.disabled = false;
      stopButton.disabled = true;

      // Remove fade-out classes.
      document.querySelector('.options').classList.remove('fade-out');
      startButton.classList.remove('fade-out');
      optionsContainer.classList.remove('fade-out');
      instructionsContainer.classList.remove('fade-out');
      document.querySelectorAll('select, .input-group').forEach(element => {
          element.classList.remove('fade-out');
      });
  }

  // Event listener for animation style change.
  animationStyleSelect.addEventListener('change', (e) => {
      if (currentExercise) {
          stopBreathing();
          currentExercise.animationStyle = e.target.value;
          currentExercise.setupAnimation();
      }
  });

  // Function to start the session timer.
  function startSessionTimer(durationInMinutes) {
    let timeLeft = durationInMinutes * 60;

    // Create the timer display element.
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timerDisplay';
    timerDisplay.classList.add('timer-display');

    // Insert the timer display before the animation container.
    animationContainer.parentNode.insertBefore(timerDisplay, animationContainer);

    const updateDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            stopBreathing();
            return;
        }
        timeLeft--;
    };

    updateDisplay(); // Initial display.
    sessionTimer = setInterval(updateDisplay, 1000); // Update every second.
}
});
