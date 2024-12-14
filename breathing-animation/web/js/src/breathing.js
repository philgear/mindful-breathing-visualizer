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
   // Method to set up the initial animation element.
    setupAnimation() {
       // Creates a new div for the animation.
       this.animationElement = document.createElement('div');
       // Assigns the correct classes so that the CSS can style it.
       this.animationElement.classList.add(this.animationStyle + '-animation');
       // clears the container
       this.animationContainer.innerHTML = '';
       // Adds the new animation element to the animation container.
       this.animationContainer.appendChild(this.animationElement);
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

               this.timerId = setTimeout(() => {
                 this.currentPhase = 'exhale';
                 this.animate();
            }, this.phaseDurations.holdDuration);
         }else if(this.currentPhase === 'exhale')
          {
               // Adds the exhale class and removes all others.
           this.animationElement.classList.add('exhale');
           this.animationElement.classList.remove('inhale', 'hold', 'holdAfterExhale');
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
    }
    // Method to start the diaphragmatic breathing exercise.
   start() {
     console.log("diaphragmatic breathing starts");
   }
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
    }
   // Method to start the alternate nostril breathing exercise.
   start() {
       console.log("alternate nostril breathing starts");
    }
    // Method to stop the alternate nostril breathing exercise.
   stop(){
        super.stop();
    }
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
    const inhaleTimeInput = document.getElementById('inhaleTime');
    const holdTimeInput = document.getElementById('holdTime');
    const exhaleTimeInput = document.getElementById('exhaleTime');
    const sessionDurationInput = document.getElementById('sessionDuration');
    const animationStyleSelect = document.getElementById('animationStyle');
    // Sets a current exercise variable to null, to be used later.
    let currentExercise = null;
    // Creates a session timer that we can manipulate.
    let sessionTimer = null;

    // Event listener for the start button, runs the function when it is clicked.
    startButton.addEventListener('click', () => {
      // Get values from the inputs.
        const inhaleTime = parseInt(inhaleTimeInput.value, 10);
        const holdTime = parseInt(holdTimeInput.value, 10);
        const exhaleTime = parseInt(exhaleTimeInput.value, 10);
        const sessionDuration = parseInt(sessionDurationInput.value, 10);
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