#include <iostream>
#include <thread>
#include <chrono>
#include <string>
#include <vector>
#include <cmath>
#include <iomanip>

// SWEBOK v4 "Serene Palette" (TrueColor RGB)
const std::string COLOR_RESET   = "\033[0m";
const std::string COLOR_EMERALD = "\033[38;2;52;211;153m"; // Inhale
const std::string COLOR_BLUE    = "\033[38;2;96;165;250m"; // Hold
const std::string COLOR_ROSE    = "\033[38;2;251;113;133m"; // Exhale

const std::string HIDE_CURSOR = "\033[?25l";
const std::string SHOW_CURSOR = "\033[?25h";
const std::string CLEAR_SCREEN = "\033[2J\033[H";

enum class PhaseKind { Inhale, Exhale, Hold };

struct Phase {
    std::string name;
    float durationSec;
    PhaseKind kind;
};

class BreathingTUI {
public:
    void run() {
        showMenu();
        std::vector<Phase> phases = getTechnique();
        
        std::cout << HIDE_CURSOR;
        
        // Main Animation Loop
        // We'll run an infinite loop of cycles
        while (true) {
            for (size_t i = 0; i < phases.size(); ++i) {
                runPhase(phases, i);
            }
        }
    }

    ~BreathingTUI() {
        std::cout << SHOW_CURSOR << COLOR_RESET << std::endl;
    }

private:
    void showMenu() {
        std::cout << CLEAR_SCREEN;
        std::cout << "Mindful Breathing Visualizer (C++ TUI v2.0)" << std::endl;
        std::cout << "1. Box Breathing" << std::endl;
        std::cout << "2. Diaphragmatic Breathing" << std::endl;
        std::cout << "3. Alternate Nostril Breathing" << std::endl;
        std::cout << "Select a technique (1-3): ";
    }

    std::vector<Phase> getTechnique() {
        char choice;
        std::cin >> choice;
        
        // Ignore newline from enter
        std::cin.ignore();

        switch (choice) {
            case '2': // Diaphragmatic
                return {
                    {"Inhale", 5.0f, PhaseKind::Inhale},
                    {"Exhale", 5.0f, PhaseKind::Exhale}
                };
            case '3': // Alternate Nostril
                return {
                    {"Inhale Left", 4.0f, PhaseKind::Inhale}, {"Hold", 4.0f, PhaseKind::Hold},
                    {"Exhale Right", 4.0f, PhaseKind::Exhale}, {"Hold", 4.0f, PhaseKind::Hold},
                    {"Inhale Right", 4.0f, PhaseKind::Inhale}, {"Hold", 4.0f, PhaseKind::Hold},
                    {"Exhale Left", 4.0f, PhaseKind::Exhale}, {"Hold", 4.0f, PhaseKind::Hold}
                };
            default: // Box
                return {
                    {"Inhale", 4.0f, PhaseKind::Inhale}, {"Hold", 4.0f, PhaseKind::Hold},
                    {"Exhale", 4.0f, PhaseKind::Exhale}, {"Hold", 4.0f, PhaseKind::Hold}
                };
        }
    }

    void runPhase(const std::vector<Phase>& phases, size_t phaseIdx) {
        const auto& phase = phases[phaseIdx];
        auto start = std::chrono::steady_clock::now();
        int fps = 60;
        int frameDelayMs = 1000 / fps;

        while (true) {
            auto now = std::chrono::steady_clock::now();
            std::chrono::duration<float> elapsed = now - start;
            float t = elapsed.count();

            if (t >= phase.durationSec) {
                // SWEBOK KA 2 Audio Feedback (System Beep)
                std::cout << "\a" << std::flush;
                break;
            }

            float progress = t / phase.durationSec;
            drawFrame(phase, progress, phases, phaseIdx);

            std::this_thread::sleep_for(std::chrono::milliseconds(frameDelayMs));
        }
    }

    void drawFrame(const Phase& currentPhase, float progress, const std::vector<Phase>& phases, size_t phaseIdx) {
        // Double buffering is hard in raw ANSI, we just overwrite using cursor movement
        std::cout << "\033[H"; // Move to Home
        
        std::cout << "\nMindful Breathing Visualizer (Press Ctrl+C to quit)\n\n";

        // Determine Color
        std::string color;
        float visualProgress = 0.0f;

        switch (currentPhase.kind) {
            case PhaseKind::Inhale:
                color = COLOR_EMERALD;
                visualProgress = progress;
                break;
            case PhaseKind::Exhale:
                color = COLOR_ROSE;
                visualProgress = 1.0f - progress;
                break;
            case PhaseKind::Hold:
                color = COLOR_BLUE;
                // Heuristic: Check previous phase to see if we are holding Full or Empty
                size_t prevIdx = (phaseIdx == 0) ? phases.size() - 1 : phaseIdx - 1;
                if (phases[prevIdx].kind == PhaseKind::Inhale) visualProgress = 1.0f; // Full
                else if (phases[prevIdx].kind == PhaseKind::Exhale) visualProgress = 0.0f; // Empty
                else visualProgress = 0.5f;
                break;
        }

        // Draw Phase Text
        float remaining = currentPhase.durationSec * (1.0f - progress);
        std::cout << "Phase: " << std::left << std::setw(15) << currentPhase.name 
                  << std::fixed << std::setprecision(1) << "(" << remaining << "s)     \n\n";

        // Draw Progress Bar
        int barWidth = 40;
        int fillWidth = static_cast<int>(visualProgress * barWidth);
        std::string bar = "";
        for(int i=0; i<fillWidth; ++i) bar += "=";
        
        std::cout << "      " << color << "[" << std::left << std::setw(barWidth) << bar << "]" << COLOR_RESET << "\n\n";

        // Draw "Lung" Circle (ASCII Art approximation)
        float scale = 1.0f + (visualProgress * 2.0f); // 1.0 to 3.0
        int dots = static_cast<int>(scale * 5);
        std::string lung = "( ";
        for(int i=0; i<dots; ++i) lung += "●";
        lung += " )";

        std::cout << "       " << color << lung << std::string(20, ' ') << COLOR_RESET << "\n";
    }
};

int main() {
    // Basic signal handling is default (Ctrl+C terminates), relying on RAII destructor for cleanup if possible, 
    // but standard C++ doesn't guarantee destructor on SIGINT. 
    // For a simple TUI, valid terminal state restoration might fail on hard abort.
    // We assume user can `reset` terminal if needed.
    
    BreathingTUI app;
    app.run();
    return 0;
}
