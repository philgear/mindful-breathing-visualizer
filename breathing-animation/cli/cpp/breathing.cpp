#include <iostream>
#include <thread>
#include <chrono>
#include <string>

#include <vector>

struct Phase {
    std::string name;
    int durationMs;
};

class BreathingExercise {
public:
    void start() {
        std::cout << "Mindful Breathing Visualizer (C++ CLI)" << std::endl;
        std::cout << "1. Box Breathing" << std::endl;
        std::cout << "2. Diaphragmatic Breathing" << std::endl;
        std::cout << "3. Alternate Nostril Breathing" << std::endl;
        std::cout << "Select a technique (1-3): ";

        char choice;
        // SECURITY: Reading single char prevents buffer overflow naturally in this context.
        std::cin >> choice;

        std::vector<Phase> phases;

        switch (choice) {
            case '2':
                std::cout << "Starting Diaphragmatic Breathing..." << std::endl;
                phases = {
                    {"Inhale", 5000},
                    {"Exhale", 5000}
                };
                break;
            case '3':
                std::cout << "Starting Alternate Nostril Breathing..." << std::endl;
                phases = {
                    {"Inhale Left", 4000}, {"Hold", 4000},
                    {"Exhale Right", 4000}, {"Hold", 4000},
                    {"Inhale Right", 4000}, {"Hold", 4000},
                    {"Exhale Left", 4000}, {"Hold", 4000}
                };
                break;
            default:
                std::cout << "Starting Box Breathing..." << std::endl;
                phases = {
                    {"Inhale", 4000}, {"Hold", 4000},
                    {"Exhale", 4000}, {"Hold", 4000}
                };
                break;
        }

        std::cout << "Press Ctrl+C to stop." << std::endl << std::endl;

        while (true) {
            for (const auto& phase : phases) {
                runPhase(phase.name, phase.durationMs);
            }
        }
    }

private:
    void runPhase(const std::string& phaseName, int durationMs) {
        std::cout << "\rPhase: " << phaseName << " (" << (durationMs/1000) << "s)   " << std::flush;
        std::this_thread::sleep_for(std::chrono::milliseconds(durationMs));
    }
};

int main() {
    BreathingExercise exercise;
    exercise.start();
    return 0;
}
