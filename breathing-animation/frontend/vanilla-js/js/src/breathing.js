//web/js/src/breathing.js

(function () {
    // ===================================
    // Audio Controller (Private to IIFE)
    // ===================================
    class AudioController {
        constructor() {
            this.ctx = null;
            this.oscillator = null;
            this.gainNode = null;
            this.isPlaying = false;
            this.isMuted = false;
        }

        init() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.ctx.createGain();
                this.gainNode.connect(this.ctx.destination);
                this.gainNode.gain.value = 0;
            }
        }

        startTone() {
            if (this.isMuted) return;
            this.init();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            if (this.oscillator) {
                this.oscillator.stop();
            }

            this.oscillator = this.ctx.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = 150; // Base frequency
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
            this.isPlaying = true;

            // Gentle fade in
            this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
            this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1);
        }

        stopTone() {
            if (this.oscillator && this.isPlaying) {
                const now = this.ctx.currentTime;
                this.gainNode.gain.cancelScheduledValues(now);
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
                this.gainNode.gain.linearRampToValueAtTime(0, now + 1);

                setTimeout(() => {
                    if (this.oscillator) {
                        this.oscillator.stop();
                        this.oscillator = null;
                    }
                }, 1000);
                this.isPlaying = false;
            }
        }

        setPhase(phase, duration) {
            if (this.isMuted || !this.isPlaying || !this.ctx) return;

            const now = this.ctx.currentTime;
            const rampTime = duration / 1000;

            this.oscillator.frequency.cancelScheduledValues(now);
            this.gainNode.gain.cancelScheduledValues(now);

            if (phase === 'inhale') {
                // Pitch goes up slightly, volume up
                this.oscillator.frequency.cancelScheduledValues(now);
                this.oscillator.frequency.setValueAtTime(150, now);
                this.oscillator.frequency.linearRampToValueAtTime(200, now + rampTime);

                this.gainNode.gain.setValueAtTime(0.1, now);
                this.gainNode.gain.linearRampToValueAtTime(0.2, now + rampTime);

            } else if (phase === 'hold') {
                // Steady pitch/volume
                this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);

            } else if (phase === 'exhale') {
                // Pitch down, volume down
                this.oscillator.frequency.cancelScheduledValues(now);
                this.oscillator.frequency.setValueAtTime(200, now);
                this.oscillator.frequency.linearRampToValueAtTime(150, now + rampTime);

                this.gainNode.gain.setValueAtTime(0.2, now);
                this.gainNode.gain.linearRampToValueAtTime(0.1, now + rampTime);

            } else if (phase === 'holdAfterExhale') {
                this.oscillator.frequency.setValueAtTime(150, now);
                this.gainNode.gain.setValueAtTime(0.1, now);
            }
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                if (this.gainNode) this.gainNode.gain.value = 0;
            } else {
                // Resume volume if playing
                if (this.isPlaying && this.gainNode) this.gainNode.gain.value = 0.1;
            }
            return this.isMuted;
        }
    }

    // Instantiate audio controller
    const audioController = new AudioController();

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
            this.promptElement = null;
            this.rafId = null;
            this.announcerElement = null;
        }

        setupAnimation() {
            // Clear previous content strictly
            while (this.animationContainer.firstChild) {
                this.animationContainer.removeChild(this.animationContainer.firstChild);
            }

            this.animationElement = document.createElement('div');
            // Safe class usage: using predefined prefix + validated/controlled input
            const safeStyle = ['circle', 'square', 'lotus', 'sun', 'alternate-nostril'].includes(this.options.animationStyle)
                ? this.options.animationStyle
                : 'circle';
            this.animationElement.className = safeStyle + '-animation';
            this.animationContainer.appendChild(this.animationElement);

            this.promptContainer = document.createElement('div');
            this.promptContainer.className = 'prompt-container';

            this.promptElement = document.createElement('div');
            this.promptElement.className = 'prompt-text';
            this.promptContainer.appendChild(this.promptElement);
            this.animationContainer.appendChild(this.promptContainer);

            // UX: Progress Bar (Moved to main container)
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'progress-bar';
            this.progressFill = document.createElement('div');
            this.progressFill.className = 'progress-fill';
            this.progressBar.appendChild(this.progressFill);
            this.animationContainer.appendChild(this.progressBar);

            this.announcerElement = document.getElementById('a11y-announcer');
        }

        announce(text) {
            if (this.announcerElement) {
                this.announcerElement.textContent = text;
            }
        }

        start() {
            throw new Error("start() method must be implemented in the subclass");
        }

        stop() {
            clearTimeout(this.timerId);
            if (this.animationElement) {
                this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
                // Remove custom properties
                this.animationContainer.style.removeProperty('--current-duration'); // Updated to container
            }
            if (this.promptElement) {
                this.promptElement.textContent = '';
                this.promptElement.className = 'prompt-text';
                this.promptContainer.className = 'prompt-container'; // Reset classes
            }
            if (this.progressBar) {
                this.progressBar.className = 'progress-bar';
            }
            document.title = 'Mindful Breathing Visualizer'; // UX: Reset Title
        }

        getPhaseDurations(inhaleTime, holdTime, exhaleTime) {
            // Ensure inputs are valid numbers
            const i = Math.max(1, Math.min(60, Number(inhaleTime) || 4));
            const h = Math.max(0, Math.min(60, Number(holdTime) || 4));
            const e = Math.max(1, Math.min(60, Number(exhaleTime) || 4));
            return {
                inhaleDuration: i * 1000,
                holdDuration: h * 1000,
                exhaleDuration: e * 1000
            };
        }

        // Helper to set transition info on CSS variables
        setTransitionDuration(durationMs) {
            if (this.animationContainer) {
                // UX: Set on container so siblings can access it
                this.animationContainer.style.setProperty('--current-duration', (durationMs / 1000) + 's');
            }
        }
    }


    // ===================================
    // Subclass for Box Breathing
    // ===================================
    class BoxBreathing extends BreathingExercise {
        constructor(animationContainer, options) {
            super(animationContainer, options);
            this.setupAnimation();
        }

        start(inhaleTime, holdTime, exhaleTime) {
            this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
            this.currentPhase = 'inhale';
            audioController.startTone();
            this.animate();
        }

        stop() {
            super.stop();
            audioController.stopTone();
        }

        animate() {
            // Reset classes
            this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
            this.progressBar.className = 'progress-bar';

            // Read durations safely
            const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

            // UX: Force reflow for progress bar animation restart
            void this.progressFill.offsetWidth;

            if (this.currentPhase === 'inhale') {
                this.setTransitionDuration(inhaleDuration);
                this.animationElement.classList.add('inhale');
                this.progressBar.classList.add('inhale');
                this.promptElement.textContent = 'Inhale';
                document.title = 'Inhale... 🌿'; // UX: Dynamic Title
                this.announce('Inhale');
                audioController.setPhase('inhale', inhaleDuration);

                // Note: Transforms are now handled effectively via CSS using the state classes,
                // but if specific scale values are needed, they can be set via CSS vars too.
                // Assuming CSS handles the scale(1.5) on .inhale class.

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'hold';
                    this.animate();
                }, inhaleDuration);

            } else if (this.currentPhase === 'hold') {
                this.setTransitionDuration(holdDuration);
                this.animationElement.classList.add('hold');
                this.progressBar.classList.add('hold');
                this.promptElement.textContent = 'Hold';
                document.title = 'Hold... ✋';
                this.announce('Hold');
                audioController.setPhase('hold', holdDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'exhale';
                    this.animate();
                }, holdDuration);

            } else if (this.currentPhase === 'exhale') {
                this.setTransitionDuration(exhaleDuration);
                this.animationElement.classList.add('exhale');
                this.progressBar.classList.add('exhale');
                this.promptElement.textContent = 'Exhale';
                document.title = 'Exhale... 🌬️';
                this.announce('Exhale');
                audioController.setPhase('exhale', exhaleDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'holdAfterExhale';
                    this.animate();
                }, exhaleDuration);

            } else if (this.currentPhase === 'holdAfterExhale') {
                this.setTransitionDuration(holdDuration);
                this.animationElement.classList.add('holdAfterExhale');
                this.progressBar.classList.add('holdAfterExhale');
                this.promptElement.textContent = 'Hold';
                document.title = 'Hold... ✋';
                this.announce('Hold');
                audioController.setPhase('holdAfterExhale', holdDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'inhale';
                    this.animate();
                }, holdDuration);
            }
        }
    }

    // ===================================
    // Subclass for Diaphragmatic Breathing
    // ===================================
    class DiaphragmaticBreathing extends BreathingExercise {
        constructor(animationContainer, options) {
            super(animationContainer, options);
            this.setupAnimation();
        }

        start(inhaleTime, holdTime, exhaleTime) {
            this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
            this.currentPhase = 'inhale';
            audioController.startTone();
            this.animate();
        }

        stop() {
            super.stop();
            audioController.stopTone();
        }

        animate() {
            this.animationElement.classList.remove('inhale', 'exhale');
            this.progressBar.className = 'progress-bar';

            // UX: Force reflow
            void this.progressFill.offsetWidth;

            const { inhaleDuration, exhaleDuration } = this.phaseDurations;

            if (this.currentPhase === 'inhale') {
                this.setTransitionDuration(inhaleDuration);
                this.animationElement.classList.add('inhale');
                this.progressBar.classList.add('inhale');
                this.promptElement.textContent = 'Inhale';
                document.title = 'Inhale... 🌿';
                audioController.setPhase('inhale', inhaleDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'exhale';
                    this.animate();
                }, inhaleDuration);

            } else if (this.currentPhase === 'exhale') {
                this.setTransitionDuration(exhaleDuration);
                this.animationElement.classList.add('exhale');
                this.progressBar.classList.add('exhale');
                this.promptElement.textContent = 'Exhale';
                document.title = 'Exhale... 🌬️';
                audioController.setPhase('exhale', exhaleDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'inhale';
                    this.animate();
                }, exhaleDuration);
            }
        }
    }

    // ===================================
    // Subclass for Alternate Nostril Breathing
    // ===================================
    class AlternateNostrilBreathing extends BreathingExercise {
        constructor(animationContainer, options) {
            super(animationContainer, options);
            this.side = 'left'; // Start with inhaling left
            this.setupAnimation();
        }

        start(inhaleTime, holdTime, exhaleTime) {
            this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
            this.currentPhase = 'inhale';
            audioController.startTone();
            this.animate();
        }

        stop() {
            super.stop();
            audioController.stopTone();
        }

        animate() {
            this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale', 'left', 'right');
            this.progressBar.className = 'progress-bar';

            // UX: Force reflow
            void this.progressFill.offsetWidth;

            const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

            // Side logic variables
            const startSide = this.side; // 'left' or 'right'
            const endSide = this.side === 'left' ? 'right' : 'left';

            if (this.currentPhase === 'inhale') {
                this.setTransitionDuration(inhaleDuration);
                this.animationElement.classList.add('inhale', startSide);
                this.progressBar.classList.add('inhale');

                const inhaleSideText = startSide === 'left' ? 'Left' : 'Right';

                this.promptElement.textContent = `Inhale ${inhaleSideText}`;
                document.title = `Inhale ${inhaleSideText}... 🌿`;
                audioController.setPhase('inhale', inhaleDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'hold';
                    this.animate();
                }, inhaleDuration);

            } else if (this.currentPhase === 'hold') {
                this.setTransitionDuration(holdDuration);
                // Move Inside: Animate from startSide to endSide
                this.animationElement.classList.add('hold', endSide);
                this.progressBar.classList.add('hold');

                this.promptElement.textContent = 'Hold';
                document.title = 'Hold... ✋';
                audioController.setPhase('hold', holdDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'exhale';
                    this.animate();
                }, holdDuration);

            } else if (this.currentPhase === 'exhale') {
                this.setTransitionDuration(exhaleDuration);
                this.animationElement.classList.add('exhale', endSide);
                this.progressBar.classList.add('exhale');

                const exhaleSideText = endSide === 'left' ? 'Left' : 'Right';

                this.promptElement.textContent = `Exhale ${exhaleSideText}`;
                document.title = `Exhale ${exhaleSideText}... 🌬️`;
                audioController.setPhase('exhale', exhaleDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'holdAfterExhale';
                    this.animate();
                }, exhaleDuration);

            } else if (this.currentPhase === 'holdAfterExhale') {
                this.setTransitionDuration(holdDuration);
                // Stay on endSide
                this.animationElement.classList.add('holdAfterExhale', endSide);
                this.progressBar.classList.add('holdAfterExhale');
                this.promptElement.textContent = 'Hold';
                document.title = 'Hold... ✋';
                audioController.setPhase('holdAfterExhale', holdDuration);

                this.timerId = setTimeout(() => {
                    this.currentPhase = 'inhale';
                    // Swap side for next inhale logic to pick up
                    this.side = endSide;
                    this.animate();
                }, holdDuration);
            }
        }
    }

    // ===================================
    // DOM Manipulation and Logic
    // ===================================

    function populateSelectOptions(selectElement, maxValue) {
        selectElement.innerHTML = '';
        for (let i = 1; i <= maxValue; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            selectElement.appendChild(option);
        }
    }

    function setDefaultSelectValues(inhaleId, holdId, exhaleId, sessionId, inhaleVal, holdVal, exhaleVal, sessionVal) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };
        setVal(inhaleId, inhaleVal);
        setVal(holdId, holdVal);
        setVal(exhaleId, exhaleVal);
        setVal(sessionId, sessionVal);
    }

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
        const timerDisplay = document.getElementById('timerDisplay');
        const muteBtn = document.getElementById('muteButton');

        let currentExercise = null;
        let sessionTimer = null;

        // Populate selects
        populateSelectOptions(inhaleTimeSelect, 10);
        populateSelectOptions(holdTimeSelect, 10);
        populateSelectOptions(exhaleTimeSelect, 10);
        populateSelectOptions(sessionDurationSelect, 60);

        // Defaults
        setDefaultSelectValues('inhaleTime', 'holdTime', 'exhaleTime', 'sessionDuration', '4', '4', '4', '5');

        // Exercise Definitions
        const exerciseClasses = Object.freeze({
            boxBreathing: BoxBreathing,
            diaphragmaticBreathing: DiaphragmaticBreathing,
            alternateNostrilBreathing: AlternateNostrilBreathing
        });
        // Safe lookup
        const safeKey = Object.keys(exerciseClasses).includes(exerciseSelect.value) ? exerciseSelect.value : 'boxBreathing';
        const ExerciseClass = exerciseClasses[safeKey];

        if (ExerciseClass) {
            currentExercise = new ExerciseClass(animationContainer, { animationStyle: animationStyleSelect.value });
        }

        const instructions = Object.freeze({
            boxBreathing: `
                <h3>Box Breathing</h3>
                <ul>
                    <li><strong>Inhale</strong> slowly for 4 seconds.</li>
                    <li><strong>Hold</strong> your lungs full for 4 seconds.</li>
                    <li><strong>Exhale</strong> slowly for 4 seconds.</li>
                    <li><strong>Hold</strong> your lungs empty for 4 seconds.</li>
                </ul>
            `,
            diaphragmaticBreathing: `
                <h3>Diaphragmatic Breathing</h3>
                 <ul>
                    <li><strong>Inhale</strong> deeply through your nose, expanding your belly.</li>
                    <li><strong>Exhale</strong> slowly through your mouth, relaxing your belly.</li>
                </ul>
            `,
            alternateNostrilBreathing: `
                <h3>Alternate Nostril Breathing</h3>
                 <ul>
                    <li><strong>Inhale</strong> through the left nostril.</li>
                    <li><strong>Hold</strong> your breath.</li>
                    <li><strong>Exhale</strong> through the right nostril.</li>
                    <li>Repeat, alternating sides.</li>
                </ul>
            `
        });

        function initExercise() {
            if (currentExercise) {
                currentExercise.stop();
            }

            // Safe lookup
            const safeKey = Object.keys(exerciseClasses).includes(exerciseSelect.value) ? exerciseSelect.value : 'boxBreathing';
            const ExerciseClass = exerciseClasses[safeKey];

            if (ExerciseClass) {
                currentExercise = new ExerciseClass(animationContainer, { animationStyle: animationStyleSelect.value });
            }

            instructionsContainer.innerHTML = instructions[safeKey] || '';
            instructionsContainer.classList.remove('hidden');
        }

        // Initial setup
        initExercise();

        // Listeners
        exerciseSelect.addEventListener('change', initExercise);
        animationStyleSelect.addEventListener('change', () => {
            if (currentExercise) {
                currentExercise.options.animationStyle = animationStyleSelect.value;
                currentExercise.setupAnimation();
            }
        });

        startButton.addEventListener('click', () => {
            const inhaleTime = parseInt(inhaleTimeSelect.value, 10);
            const holdTime = parseInt(holdTimeSelect.value, 10);
            const exhaleTime = parseInt(exhaleTimeSelect.value, 10);
            const sessionDuration = parseInt(sessionDurationSelect.value, 10);

            if (currentExercise) {
                currentExercise.start(inhaleTime, holdTime, exhaleTime);
            }

            startSessionTimer(sessionDuration);

            // UI State
            startButton.classList.add('hidden');
            stopButton.classList.remove('hidden');

            // UX: Focus Mode
            document.body.classList.add('focus-mode'); // Enable Focus

            document.querySelectorAll('.settings-group').forEach(el => el.classList.add('fade-out'));
            document.querySelectorAll('.settings-group select').forEach(el => el.disabled = true);
            instructionsContainer.classList.add('fade-out');
        });

        stopButton.addEventListener('click', () => {
            stopSession();
        });

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = audioController.toggleMute();
                muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound On';
            });
        }

        // Dark Mode Logic
        const darkModeBtn = document.getElementById('darkModeButton');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                darkModeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            });
        }

        // Haptic Feedback Helper
        function pulseHaptics(pattern) {
            if (navigator.vibrate) {
                navigator.vibrate(pattern);
            }
        }

        // Override animate methods to include haptics
        // We inject haptics into the shared announcement or setPhase calls would be cleaner,
        // but let's hook into the phase transitions in the subclasses or AudioController wrapper?
        // Actually, let's just create a global phase observer or monkey-patch.
        // For simplicity/reliability in this vanilla structure, let's add it to the `setPhase` of AudioController
        // since that's called on every transition.

        const originalSetPhase = audioController.setPhase.bind(audioController);
        audioController.setPhase = function (phase, duration) {
            originalSetPhase(phase, duration);
            // Haptics Logic
            if (phase === 'inhale') {
                pulseHaptics(200); // 200ms vibe on Inhale
            } else if (phase === 'exhale') {
                pulseHaptics(100); // 100ms vibe on Exhale
            }
        };

        function stopSession() {
            if (currentExercise) {
                currentExercise.stop();
            }
            clearInterval(sessionTimer);

            // UX: Disable Focus Mode
            document.body.classList.remove('focus-mode');
            document.title = 'Mindful Breathing Visualizer';

            document.getElementById('startButton').classList.remove('hidden');
            document.getElementById('stopButton').classList.remove('hidden'); // Fix: ensure stop disappears? 
            // original code had start hidden, stop remove hidden.
            // On stop, swap back?
            document.getElementById('stopButton').classList.add('hidden'); // Corrected logic

            document.getElementById('timerDisplay').textContent = '';
            document.querySelectorAll('.settings-group').forEach(el => el.classList.remove('fade-out'));
            document.querySelectorAll('.settings-group select').forEach(el => el.disabled = false);
            instructionsContainer.classList.remove('fade-out');
        }

        function startSessionTimer(durationMinutes) {
            let secondsLeft = durationMinutes * 60;

            const updateTimer = () => {
                const m = Math.floor(secondsLeft / 60);
                const s = secondsLeft % 60;
                timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

                if (secondsLeft <= 0) {
                    stopSession();
                }
                secondsLeft--;
            };

            updateTimer();
            sessionTimer = setInterval(updateTimer, 1000);
        }

    });
})();
