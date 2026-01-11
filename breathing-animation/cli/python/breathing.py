import time
import sys
import math
import signal

# SWEBOK v4 "Serene Palette" (TrueColor RGB)
COLOR_RESET = "\033[0m"
# Inhale: Emerald #34d399 (52, 211, 153)
COLOR_EMERALD = "\033[38;2;52;211;153m"
# Hold: Blue #60a5fa (96, 165, 250)
COLOR_BLUE = "\033[38;2;96;165;250m"
# Exhale: Rose #fb7185 (251, 113, 133)
COLOR_ROSE = "\033[38;2;251;113;133m"

HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"
CLEAR_SCREEN = "\033[2J\033[H"
MOVE_HOME = "\033[H"

TECHNIQUES = {
    "1": {
        "name": "Box Breathing",
        "phases": [
            ("Inhale", 4.0, COLOR_EMERALD),
            ("Hold", 4.0, COLOR_BLUE),
            ("Exhale", 4.0, COLOR_ROSE),
            ("Hold", 4.0, COLOR_BLUE)
        ]
    },
    "2": {
        "name": "Diaphragmatic Breathing",
        "phases": [
            ("Inhale", 5.0, COLOR_EMERALD),
            ("Exhale", 5.0, COLOR_ROSE)
        ]
    },
    "3": {
        "name": "Alternate Nostril",
        "phases": [
            ("Inhale Left", 4.0, COLOR_EMERALD),
            ("Hold", 4.0, COLOR_BLUE),
            ("Exhale Right", 4.0, COLOR_ROSE),
            ("Hold", 4.0, COLOR_BLUE),
            ("Inhale Right", 4.0, COLOR_EMERALD),
            ("Hold", 4.0, COLOR_BLUE),
            ("Exhale Left", 4.0, COLOR_ROSE),
            ("Hold", 4.0, COLOR_BLUE)
        ]
        ]
    },
    "4": {
        "name": "4-7-8 Relaxing Breath",
        "phases": [
            ("Inhale", 4.0, COLOR_EMERALD),
            ("Hold", 7.0, COLOR_BLUE),
            ("Exhale", 8.0, COLOR_ROSE)
        ]
    }
}

def signal_handler(sig, frame):
    sys.stdout.write(SHOW_CURSOR + COLOR_RESET + "\nNamaste.\n")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def draw_frame(phase_name, progress, color, duration):
    # Move to top left
    sys.stdout.write(MOVE_HOME)
    
    # Header
    sys.stdout.write(f"\nMindful Breathing Visualizer (Python TUI v2.0)\n\n")

    # Phase Status
    remaining = duration * (1.0 - progress)
    sys.stdout.write(f"Phase: {phase_name:<15} ({remaining:5.1f}s)     \n\n")

    # Progress Bar
    bar_width = 40
    
    # Visual Progress Calculation (Expand on Inhale, Contract on Exhale)
    visual_progress = progress
    if "Inhale" in phase_name:
        visual_progress = progress
    elif "Exhale" in phase_name:
        visual_progress = 1.0 - progress
    else: 
         # Hold logic: if holding after inhale, stay full. 
         # Note: Simple stateless hold logic for now involves just checking the name
         # Ideally we'd pass previous state, but this heuristic works for standard techniques
         # If we just finished Inhale, we are Full. If Exhale, Empty.
         # This simple script assumes Hold is usually "Full" in Box Breathing contexts shown here for simplicity,
         # or we can just keep it static at 50% or full. 
         # Let's keep it simple: 
         visual_progress = 1.0 # Default to "Full" hold for visual stability

    current_width = int(visual_progress * bar_width)
    bar_str = "=" * current_width
    
    sys.stdout.write(f"      {color}[{bar_str:<{bar_width}}]{COLOR_RESET}\n\n")

    # Breathing Circle (Text Scale)
    scale = 1.0 + (visual_progress * 2.0)
    dots = int(scale * 5)
    lung_str = "( " + ("●" * dots) + " )"
    
    sys.stdout.write(f"       {color}{lung_str:<30}{COLOR_RESET}\n")
    
    sys.stdout.flush()

def run_phase(phase):
    name, duration, color = phase
    fps = 60
    frame_delay = 1.0 / fps
    start_time = time.time()

    while True:
        now = time.time()
        elapsed = now - start_time
        
        if elapsed >= duration:
            # SWEBOK KA 2 Audio Feedback (System Beep)
            sys.stdout.write("\a")
            sys.stdout.flush()
            break
            
        progress = elapsed / duration
        draw_frame(name, progress, color, duration)
        time.sleep(frame_delay)

def main():
    sys.stdout.write(CLEAR_SCREEN)
    print("Mindful Breathing Visualizer (Python TUI v2.0)")
    print("1. Box Breathing")
    print("2. Diaphragmatic Breathing")
    print("3. Alternate Nostril Breathing")
    print("4. 4-7-8 Relaxing Breath")
    choice = input("Select a technique (1-4): ").strip()
    
    technique = TECHNIQUES.get(choice, TECHNIQUES["1"])
    phases = technique["phases"]

    sys.stdout.write(CLEAR_SCREEN + HIDE_CURSOR)

    try:
        while True:
            for phase in phases:
                run_phase(phase)
    except KeyboardInterrupt:
        sys.stdout.write(SHOW_CURSOR + COLOR_RESET + "\nNamaste.\n")

if __name__ == "__main__":
    main()
