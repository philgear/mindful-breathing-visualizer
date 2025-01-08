//web/js/src/breathing.js

// ===================================
// Base class for all breathing exercises
// ===================================
class BreathingExercise {
  constructor(animationContainer, options) {
    // The container where the animation will be rendered
    this.animationContainer = animationContainer;
    // Options passed to the class for customization
    this.options = options;
     // Element for the animation
    this.animationElement = null;
    // Stores the ID of the timer to clear later
    this.timerId = null;
    // Stores the duration of each breathing phase
    this.phaseDurations = null;
     // Keeps track of the current breathing phase
    this.currentPhase = null;
    // Stores the prompt message div element.
    this.promptElement = null;
  }
    // Method to set up the initial animation element.
  setupAnimation() {
         // Creates a new div for the animation.
        this.animationElement = document.createElement('div');
         // Assigns the correct classes so that the CSS can style it.
        this.animationElement.classList.add(this.animationStyle + '-animation');
        // clears the container
        this.animationContainer.innerHTML = '';
      // Add the prompt to the container
        this.promptElement = document.createElement('div');
        this.promptElement.classList.add('prompt-text');
        this.animationContainer.appendChild(this.promptElement);
       // Adds the new animation element to the animation container.
       this.animationContainer.appendChild(this.animationElement);

         // Add the div to show the animation phase to the container
        this.animationPhase = document.createElement('div');
        this.animationPhase.id = 'animationPhase';
        this.animationContainer.appendChild(this.animationPhase);
    }

    // Method to start the breathing exercise, should be implemented in the subclasses
    start() {
      throw new Error("start() method must be implemented in the subclass");
    }
  // Method to stop the breathing exercise, will clear the timer, and reset animations
    stop() {
        // Clear the timer if it is running.
        clearTimeout(this.timerId);
        // Reset the classes so the animations get removed.
        this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
         // Remove the transformation styles.
         this.animationElement.style.transform = '';
         this.promptElement.textContent = '';
         //Resets the animation phase text
         this.animationPhase.textContent = '';
    }

    // Method to calculate the duration of each phase (inhale, hold, exhale) in milliseconds
    getPhaseDurations(inhaleTime, holdTime, exhaleTime){
        return {
            // Converts the user input to milliseconds.
            inhaleDuration: inhaleTime * 1000,
            holdDuration: holdTime * 1000,
            exhaleDuration: exhaleTime * 1000
        };
    }
    animate = () => {
        // This will be an empty function in the base, and will be implemented in the children classes.
    }

}

// ===================================
// Subclass for Box Breathing Exercise
// ===================================
class BoxBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
        // Calls the constructor of the base class.
        super(animationContainer, options);
         // Stores the current animation style chosen.
        this.animationStyle = this.options.animationStyle;
        // Calls the setup animation method.
        this.setupAnimation();
    }
    // Method to start the box breathing animation
  start(inhaleTime, holdTime, exhaleTime) {
      // Gets all the durations for the animation.
    this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
    // Sets the current animation to the inhale animation.
    this.currentPhase = 'inhale';
    // Runs the animate method
    this.animate();
  }

  // Method that animates the breathing exercise.
    animate = () => {
        // Checks which phase the animation is currently on.
       if (this.currentPhase === 'inhale') {
             // Adds the inhale class, and removes all other classes.
              this.animationElement.classList.add('inhale');
             this.animationElement.classList.remove('exhale', 'hold', 'holdAfterExhale');
             this.promptElement.textContent = 'Inhale';
             this.animationPhase.textContent = 'Inhale';
             // Adds the transition so the animation is smooth.
             this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration/1000}s ease, background-color ${this.phaseDurations.inhaleDuration/1000}s ease`;
             // Scales the animation to make it look like it is breathing.
             this.animationElement.style.transform = 'scale(2)';
            // Sets a timer to move onto the next step.
          this.timerId = setTimeout(() => {
            this.currentPhase = 'hold';
           this.animate();
            }, this.phaseDurations.inhaleDuration);
        } else if (this.currentPhase === 'hold') {
            // Adds the hold class and removes all others.
             this.animationElement.classList.add('hold');
             this.animationElement.classList.remove('exhale', 'inhale', 'holdAfterExhale');
             this.promptElement.textContent = 'Hold';
              this.animationPhase.textContent = 'Hold';
               this.timerId = setTimeout(() => {
                 this.currentPhase = 'exhale';
                 this.animate();
            }, this.phaseDurations.holdDuration);
         }else if(this.currentPhase === 'exhale')
          {
               // Adds the exhale class and removes all others.
           this.animationElement.classList.add('exhale');
           this.animationElement.classList.remove('inhale', 'hold', 'holdAfterExhale');
          this.promptElement.textContent = 'Exhale';
            this.animationPhase.textContent = 'Exhale';
           // Adds the transition to the animation.
           this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration/1000}s ease, background-color ${this.phaseDurations.exhaleDuration/1000}s ease`;
           // Scales the animation to look like it's breathing.
          this.animationElement.style.transform = 'scale(1)';
             this.timerId =  setTimeout(() => {
              this.currentPhase = 'holdAfterExhale';
               this.animate();
              }, this.phaseDurations.exhaleDuration);
         }
        else if(this.currentPhase === 'holdAfterExhale')
        {
          // Adds the holdAfterExhale class and removes all others.
             this.animationElement.classList.add('holdAfterExhale');
             this.animationElement.classList.remove('exhale', 'inhale', 'hold');
             this.promptElement.textContent = 'Hold';
              this.animationPhase.textContent = 'Hold';
             this.timerId =  setTimeout(() => {
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
        // Calls the base class constructor.
        super(animationContainer, options);
         // Stores the current animation style chosen.
        this.animationStyle = this.options.animationStyle;
        // Calls the setup animation method.
        this.setupAnimation();
    }

     // Method to start the diaphragmatic breathing animation
   start(inhaleTime, holdTime, exhaleTime) {
         // Gets all the durations for the animation.
    this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
    // Sets the current animation to the inhale animation.
    this.currentPhase = 'inhale';
      // Runs the animate method
     this.animate();
  }
  // Method that animates the diaphragmatic breathing exercise
   animate = () => {
       if (this.currentPhase === 'inhale') {
            this.animationElement.classList.add('inhale');
             this.animationElement.classList.remove('exhale');
            this.promptElement.textContent = 'Inhale';
            this.animationPhase.textContent = 'Inhale';
           this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration/1000}s ease, background-color ${this.phaseDurations.inhaleDuration/1000}s ease`;
           this.animationElement.style.transform = 'scale(1.5)';
           this.timerId = setTimeout(() => {
                 this.currentPhase = 'exhale';
                this.animate();
            }, this.phaseDurations.inhaleDuration);
         }else if (this.currentPhase === 'exhale')
         {
               this.animationElement.classList.add('exhale');
               this.animationElement.classList.remove('inhale');
                 this.promptElement.textContent = 'Exhale';
                this.animationPhase.textContent = 'Exhale';
               this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration/1000}s ease, background-color ${this.phaseDurations.exhaleDuration/1000}s ease`;
               this.animationElement.style.transform = 'scale(1)';
                 this.timerId =  setTimeout(() => {
                     this.currentPhase = 'inhale';
                     this.animate();
                }, this.phaseDurations.exhaleDuration);
         }
    };

    // Method to stop the diaphragmatic breathing exercise.
   stop() {
       super.stop();
    }
}

// ===================================
// Subclass for Alternate Nostril Breathing Exercise
// ===================================
class AlternateNostrilBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
         // Calls the base class constructor.
        super(animationContainer, options);
        // Stores the current animation style chosen.
        this.animationStyle = this.options.animationStyle;
        // Calls the setup animation method.
        this.setupAnimation();
    }
   // Method to start the alternate nostril breathing exercise.
  start(inhaleTime, holdTime, exhaleTime) {
        // Gets all the durations for the animation.
    this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
     // Sets the current animation to the inhale animation.
    this.currentPhase = 'inhale';
     // Runs the animate method
    this.animate();
  }
    // Method that animates the alternate nostril breathing exercise.
    animate = () => {
       if(this.currentPhase === 'inhale')
       {
           this.animationElement.classList.add('inhale');
            this.animationElement.classList.remove('exhale');
             this.promptElement.textContent = 'Inhale Left';
            this.animationPhase.textContent = 'Inhale';
            this.animationElement.style.transition = `transform ${this.phaseDurations.inhaleDuration/1000}s ease, background-color ${this.phaseDurations.inhaleDuration/1000}s ease`;
            this.animationElement.style.transform = 'translateX(-50px)';
              this.timerId = setTimeout(() => {
                this.currentPhase = 'hold';
                this.animate();
           }, this.phaseDurations.inhaleDuration);

        } else if(this.currentPhase === 'hold')
        {
          this.animationElement.classList.add('hold')
            this.animationElement.classList.remove('inhale', 'exhale')
            this.promptElement.textContent = 'Hold';
            this.animationPhase.textContent = 'Hold';
            this.timerId = setTimeout(() => {
               this.currentPhase = 'exhale';
                this.animate();
            }, this.phaseDurations.holdDuration);
        }
       else if (this.currentPhase === 'exhale')
        {
            this.animationElement.classList.add('exhale');
            this.animationElement.classList.remove('inhale', 'hold');
            this.promptElement.textContent = 'Exhale Right';
            this.animationPhase.textContent = 'Exhale';
             this.animationElement.style.transition = `transform ${this.phaseDurations.exhaleDuration/1000}s ease, background-color ${this.phaseDurations.exhaleDuration/1000}s ease`;
            this.animationElement.style.transform = 'translateX(50px)';
              this.timerId = setTimeout(() => {
                   this.currentPhase = 'holdAfterExhale';
                  this.animate();
             }, this.phaseDurations.exhaleDuration);
        }
        else if (this.currentPhase === 'holdAfterExhale')
        {
             this.animationElement.classList.add('holdAfterExhale');
              this.animationElement.classList.remove('inhale', 'exhale','hold')
                this.promptElement.textContent = 'Hold';
            this.animationPhase.textContent = 'Hold';
            this.timerId = setTimeout(() => {
                this.currentPhase = 'inhale';
                this.animate();
            }, this.phaseDurations.holdDuration);
         }

    }
  // Method to stop the alternate nostril breathing exercise.
   stop(){
        super.stop();
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
    // Gets the animation container from the HTML
    const animationContainer = document.getElementById('animation-container');
    // Get the buttons from the HTML
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    // Get all of the options from the HTML
    const exerciseSelect = document.getElementById('exerciseSelect');
    const inhaleTimeSelect = document.getElementById('inhaleTime');
    const holdTimeSelect = document.getElementById('holdTime');
    const exhaleTimeSelect = document.getElementById('exhaleTime');
    const sessionDurationSelect = document.getElementById('sessionDuration');
    const animationStyleSelect = document.getElementById('animationStyle');
    // Get the instructions container from the HTML
    const instructionsContainer = document.getElementById('instructions-container');
    // Sets a current exercise variable to null, to be used later.
    let currentExercise = null;
    // Creates a session timer that we can manipulate.
    let sessionTimer = null;

    // Populate select elements with options from 1 to 10
    populateSelectOptions(inhaleTimeSelect, 10);
    populateSelectOptions(holdTimeSelect, 10);
    populateSelectOptions(exhaleTimeSelect, 10);
    populateSelectOptions(sessionDurationSelect, 10);

    // Set default values for the select elements
    setDefaultSelectValues('inhaleTime', 'holdTime', 'exhaleTime', 'sessionDuration', '4', '4', '4', '5');
    // Sets default instructions
    const defaultInstructions = `
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
    `;
     instructionsContainer.innerHTML = defaultInstructions;

     // Event listener for changing breathing exercise
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

          // Display the instructions for the selected exercise
        instructionsContainer.innerHTML = instructions[exerciseSelect.value] || defaultInstructions;
         //Add the fade-in effect
        instructionsContainer.classList.add('fade-in');
    });

    // Event listener for the start button, runs the function when it is clicked.
    startButton.addEventListener('click', () => {
      // Get values from the inputs.
        const inhaleTime = parseInt(inhaleTimeSelect.value, 10);
        const holdTime = parseInt(holdTimeSelect.value, 10);
        const exhaleTime = parseInt(exhaleTimeSelect.value, 10);
        const sessionDuration = parseInt(sessionDurationSelect.value, 10);
        const animationStyle = animationStyleSelect.value;

        // Options for the exercise.
      let exerciseOptions = {
            animationStyle: animationStyle
         };
          // Based on the selected exercise, runs the start animation
          if(exerciseSelect.value === 'boxBreathing')
          {
            currentExercise = new BoxBreathing(animationContainer, exerciseOptions);
          }
          else if(exerciseSelect.value === 'diaphragmaticBreathing')
         {
            currentExercise = new DiaphragmaticBreathing(animationContainer, exerciseOptions);
        }
          else if(exerciseSelect.value === 'alternateNostrilBreathing')
        {
            currentExercise = new AlternateNostrilBreathing(animationContainer, exerciseOptions);
         }
         // starts the animation with the given options.
        currentExercise.start(inhaleTime, holdTime, exhaleTime);
        // Starts the session timer, with the given session duration.
      startSessionTimer(sessionDuration);
       // Disable the start button, so that it cannot be clicked again during the animation.
        startButton.disabled = true;
         // Enables the stop button so it can be used to stop the animation.
        stopButton.disabled = false;
         // Add the fade-out class to the options section, the start button, and instructions
         document.querySelector('.options').classList.add('fade-out');
         startButton.classList.add('fade-out');
         instructionsContainer.classList.add('fade-out');
         instructionsContainer.classList.add('fade-out');
 
         // Get all select elements and add fade-out class
         const selectElements = document.querySelectorAll('select');
         selectElements.forEach(element => {
             element.classList.add('fade-out');
         });
 
         // Get all input-group divs and add fade-out class
         const inputGroups = document.querySelectorAll('.input-group');
         inputGroups.forEach(element => {
             element.classList.add('fade-out');
         });
    });

    // Event listener for the stop button, runs the stop breathing function when it is clicked.
     stopButton.addEventListener('click', stopBreathing);

    //  Function to stop the breathing exercise
    function stopBreathing() {
       // Checks if there is a current exercise, and then stops it.
        if(currentExercise) {
           currentExercise.stop();
        }
         // Clears the session timer.
        clearInterval(sessionTimer);
        // Enables the start button, and disables the stop button.
       startButton.disabled = false;
       stopButton.disabled = true;
        // Remove the fade-out class from the options section, the start button, and instructions
        document.querySelector('.options').classList.remove('fade-out');
        startButton.classList.remove('fade-out');
        instructionsContainer.classList.remove('fade-out');

        // Get all select elements and remove fade-out class
        const selectElements = document.querySelectorAll('select');
        selectElements.forEach(element => {
            element.classList.remove('fade-out');
        });

        // Get all input-group divs and remove fade-out class
        const inputGroups = document.querySelectorAll('.input-group');
        inputGroups.forEach(element => {
            element.classList.remove('fade-out');
        });
    }

    // Event listener for the animation style change.
      animationStyleSelect.addEventListener('change', (e) => {
        // Checks if there is a current exercise, and if there is, stops it, changes the animation style and re-renders it.
         if(currentExercise){
              currentExercise.stop();
              currentExercise.animationStyle = e.target.value;
              currentExercise.setupAnimation();
           }
       });
      // Event listener for the exercise dropdown
      exerciseSelect.addEventListener('change', (e) => {
         // Calls the stop breathing function when a different exercise is selected.
         stopBreathing();
    });

   // Function to start the session timer.
     function startSessionTimer(durationInMinutes) {
       // sets the initial time.
        let timeLeft = durationInMinutes * 60;
       // Creates the timer display in the html.
        const timerDisplay = document.createElement('div');
         timerDisplay.id = 'timerDisplay'
         animationContainer.appendChild(timerDisplay)
          // Update the timer display.
           const updateDisplay = () => {
            // calculates the minutes and seconds left on the timer.
              const minutes = Math.floor(timeLeft / 60);
              const seconds = timeLeft % 60;
              // Updates the content of the time display, with proper formatting.
              timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             // Checks if the timer is at zero.
             if(timeLeft <= 0){
                stopBreathing();
                // remove the timer display.
                 timerDisplay.remove()
                return;
             }
           // Decreases the timeLeft by 1.
          timeLeft--;
        }
       // Call the first update to the timer
        updateDisplay();
         // Set the timer to update every second.
       sessionTimer = setInterval(updateDisplay, 1000);
     }

});