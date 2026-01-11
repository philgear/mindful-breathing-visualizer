#!/bin/bash

# Mindful Breathing Visualizer (Bash TUI v2.0 - SWEBOK Compliant)
# Features: TrueColor Support, Audio Feedback (System Bell)

# SWEBOK v4 "Serene Palette" (TrueColor RGB)
COLOR_RESET="\033[0m"
COLOR_EMERALD="\033[38;2;52;211;153m" # Inhale
COLOR_BLUE="\033[38;2;96;165;250m"    # Hold
COLOR_ROSE="\033[38;2;251;113;133m"    # Exhale

HIDE_CURSOR="\033[?25l"
SHOW_CURSOR="\033[?25h"
CLEAR_SCREEN="\033[2J\033[H"
MOVE_HOME="\033[H"

# Trap to restore cursor on exit
cleanup() {
    echo -e "${SHOW_CURSOR}${COLOR_RESET}"
    exit
}
trap cleanup SIGINT

draw_frame() {
    local phase_name="$1"
    local progress="$2"
    local color="$3"
    local duration="$4"
    local elapsed="$5"
    
    local remaining=$(echo "$duration - $elapsed" | bc)
    
    # Header
    echo -e "${MOVE_HOME}"
    echo -e "\nMindful Breathing Visualizer (Bash TUI v2.0)\n"
    
    # Phase Info
    printf "Phase: %-15s (%0.1fs)     \n\n" "$phase_name" "$remaining"
    
    # Visual Progress
    local bar_width=40
    local visual_progress=0
    
    # Determine visual progress based on phase name (heuristic)
    if [[ "$phase_name" == *"Inhale"* ]]; then
         visual_progress=$progress
    elif [[ "$phase_name" == *"Exhale"* ]]; then
         visual_progress=$(echo "1.0 - $progress" | bc)
    else 
         # Hold logic (simplified)
         visual_progress=1.0
    fi
    
    # Bar Calculation
    local fill_width=$(echo "$visual_progress * $bar_width" | bc | awk '{print int($1)}')
    local bar=""
    for ((i=0; i<fill_width; i++)); do bar+="="; done
    
    # Draw Bar
    printf "      ${color}[%-40s]${COLOR_RESET}\n\n" "$bar"
    
    # Draw Lung Circle (simplified)
    local scale=$(echo "1.0 + ($visual_progress * 2.0)" | bc)
    local dots=$(echo "$scale * 5" | bc | awk '{print int($1)}')
    local lung_str="( "
    for ((i=0; i<dots; i++)); do lung_str+="●"; done
    lung_str+=" )"
    
    printf "       ${color}%-30s${COLOR_RESET}\n" "$lung_str"
}

run_phase() {
    local name="$1"
    local duration="$2"
    local color="$3"
    
    local start_time=$(date +%s.%N)
    
    # SWEBOK KA 2 Audio Feedback using 'tput bel' or '\a'
    # printf "\a" ensures cross-platform compatibility better than echo -e in some shells
    printf "\a"
    
    while true; do
        local now=$(date +%s.%N)
        local elapsed=$(echo "$now - $start_time" | bc)
        
        if (( $(echo "$elapsed >= $duration" | bc -l) )); then
            break
        fi
        
        local progress=$(echo "$elapsed / $duration" | bc -l)
        
        draw_frame "$name" "$progress" "$color" "$duration" "$elapsed"
        
        # 0.05s sleep (~20fps for bash)
        sleep 0.05
    done
}

# Main Menu
clear
echo "Mindful Breathing Visualizer (Bash TUI v2.0)"
echo "1. Box Breathing"
echo "2. Diaphragmatic Breathing"
echo "3. Alternate Nostril Breathing"
read -p "Select a technique (1-3): " choice

echo -e "${CLEAR_SCREEN}${HIDE_CURSOR}"

while true; do
    case "$choice" in
        2)
            run_phase "Inhale" 5 "$COLOR_EMERALD"
            run_phase "Exhale" 5 "$COLOR_ROSE"
            ;;
        3)
            run_phase "Inhale Left" 4 "$COLOR_EMERALD"
            run_phase "Hold" 4 "$COLOR_BLUE"
            run_phase "Exhale Right" 4 "$COLOR_ROSE"
            run_phase "Hold" 4 "$COLOR_BLUE"
            run_phase "Inhale Right" 4 "$COLOR_EMERALD"
            run_phase "Hold" 4 "$COLOR_BLUE"
            run_phase "Exhale Left" 4 "$COLOR_ROSE"
            run_phase "Hold" 4 "$COLOR_BLUE"
            ;;
        *)
            run_phase "Inhale" 4 "$COLOR_EMERALD"
            run_phase "Hold" 4 "$COLOR_BLUE"
            run_phase "Exhale" 4 "$COLOR_ROSE"
            run_phase "Hold" 4 "$COLOR_BLUE"
            ;;
    esac
done
