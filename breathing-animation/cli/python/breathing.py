import time
import sys

def breathing_visualizer():
    print("Mindful Breathing Visualizer (Python CLI)")
    print("1. Box Breathing")
    print("2. Diaphragmatic Breathing")
    print("3. Alternate Nostril Breathing")
    
    choice = input("Select a technique (1-3): ")
    
    if choice == '2':
        phases = [("Inhale", 5), ("Exhale", 5)]
        print("Starting Diaphragmatic Breathing...")
    elif choice == '3':
        phases = [
            ("Inhale Left", 4), ("Hold", 4), ("Exhale Right", 4), ("Hold", 4),
            ("Inhale Right", 4), ("Hold", 4), ("Exhale Left", 4), ("Hold", 4)
        ]
        print("Starting Alternate Nostril Breathing...")
    else:
        phases = [("Inhale", 4), ("Hold", 4), ("Exhale", 4), ("Hold", 4)]
        print("Starting Box Breathing...")

    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            for name, duration in phases:
                # Simulate animation progress
                start_time = time.time()
                while time.time() - start_time < duration:
                    elapsed = time.time() - start_time
                    progress = int((elapsed / duration) * 20)
                    bar = "█" * progress + "-" * (20 - progress)
                    sys.stdout.write(f"\rPhase: {name} ({duration}s) [{bar}]    ")
                    sys.stdout.flush()
                    time.sleep(0.05)
                
    except KeyboardInterrupt:
        print("\n\nNamaste. 🙏")

if __name__ == "__main__":
    breathing_visualizer()
