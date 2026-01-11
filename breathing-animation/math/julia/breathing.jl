# Mindful Breathing Visualizer - Julia Implementation
# SWEBOK v4 Serene Palette

using Dates

# Define Palette (ANSI TrueColor)
const SERENE_EMERALD = "\e[38;2;52;211;153m"
const SERENE_BLUE    = "\e[38;2;96;165;250m"
const SERENE_ROSE    = "\e[38;2;251;113;133m"
const RESET          = "\e[0m"
const BEEP           = "\7"

# Phase Struct
struct Phase
    name::String
    duration::Int
    color::String
end

# Box Breathing Sequence
phases = [
    Phase("Inhale", 4, SERENE_EMERALD),
    Phase("Hold",   4, SERENE_BLUE),
    Phase("Exhale", 4, SERENE_ROSE),
    Phase("Hold",   4, SERENE_BLUE)
]

function run_breathing()
    println("Starting Mindful Breathing (Julia)...")
    sleep(1)

    while true
        for phase in phases
            # Clear Screen
            print("\e[2J\e[H")
            
            # Audio Feedback
            print(BEEP)

            # Display Header
            println("$(phase.color)--------------------------------")
            println("          $(uppercase(phase.name))")
            println("--------------------------------$(RESET)")

            # Countdown
            for i in 1:phase.duration
                bar = "=" ^ (i * 2)
                print("\r$(phase.color)$(bar)> $(RESET)")
                sleep(1)
            end
            println()
        end
    end
end

if abspath(PROGRAM_FILE) == @__FILE__
    run_breathing()
end
