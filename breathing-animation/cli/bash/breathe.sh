#!/bin/bash

# The Mindful Terminal
# A minimalist breathing visualizer using ANSI escape codes.

clear
tput civis # Hide cursor

cleanup() {
    tput cnorm # Show cursor
    echo -e "\033[0m" # Reset colors
    clear
    exit
}

trap cleanup SIGINT

# Colors (Backgrounds)
BG_BLUE="\033[44m"
BG_GREEN="\033[42m"
BG_CYAN="\033[46m"
RESET="\033[0m"

# Text Colors
TXT_WHITE="\033[97m"

center_text() {
    text="$1"
    cols=$(tput cols)
    rows=$(tput lines)
    target_row=$((rows / 2))
    target_col=$(( (cols - ${#text}) / 2 ))
    
    tput cup $target_row $target_col
    echo -e "${TXT_WHITE}${text}${RESET}"
}

pulse_bg() {
    color="$1"
    duration="$2"
    phrase="$3"
    
    # 0.1s steps
    steps=$((duration * 10))
    
    for ((i=1; i<=steps; i++)); do
        clear
        if (( (i / 5) % 2 == 0 )); then
            # Flash on
            echo -e "$color"
            # Fill screen somewhat inefficiently but simply for portability
            for ((r=0; r<$(tput lines); r++)); do
               printf "%*s\n" "$(tput cols)" " "
            done
        else
            echo -e "$RESET"
        fi
        
        # Draw text on top
        center_text "$phrase"
        
        sleep 0.1
    done
}

# Better smooth approach: Expanding circle using characters
draw_circle() {
    size="$1" # 1 to 10
    char="$2" # Character to draw
    text="$3"
    
    clear
    cols=$(tput cols)
    rows=$(tput lines)
    mid_row=$((rows / 2))
    mid_col=$((cols / 2))
    
    # Draw logic roughly
    radius_y=$size
    radius_x=$((size * 2)) # Adjust for aspect ratio
    
    for ((y=-radius_y; y<=radius_y; y++)); do
        for ((x=-radius_x; x<=radius_x; x++)); do
             # Distance formula approximation
             d=$(( (x*x)/(4) + (y*y) ))
             if (( d <= size*size )); then
                 r=$((mid_row + y))
                 c=$((mid_col + x))
                 if ((r > 0 && r < rows && c > 0 && c < cols)); then
                     tput cup $r $c
                     echo -n "$char"
                 fi
             fi
        done
    done
    
    center_text "$text"
}

animate_phase() {
    phase="$1"
    seconds="$2"
    direction="$3" # 1 for grow, 0 for hold, -1 for shrink
    
    steps=$((seconds * 10))
    min_size=2
    max_size=12
    
    for ((i=0; i<steps; i++)); do
        progress=$(echo "scale=2; $i / $steps" | bc)
        
        current_size=$min_size
        if [ "$direction" -eq 1 ]; then
             # Grow
             current_size=$(echo "$min_size + ($max_size - $min_size) * $progress" | bc | awk '{print int($1)}')
             echo -ne "\033[32m" # Green
        elif [ "$direction" -eq -1 ]; then
             # Shrink
             current_size=$(echo "$max_size - ($max_size - $min_size) * $progress" | bc | awk '{print int($1)}')
             echo -ne "\033[31m" # Red
        else
             current_size=$max_size
             if [ "$phase" == "Hold (Empty)" ]; then current_size=$min_size; fi
             echo -ne "\033[34m" # Blue
        fi
        
        draw_circle "$current_size" "*" "$phase"
        sleep 0.1
    done
}

echo "Mindful Breathing Visualizer (Bash CLI)"
echo "1. Box Breathing"
echo "2. Diaphragmatic Breathing"
echo "3. Alternate Nostril Breathing"
read -p "Select a technique (1-3): " choice

while true; do
  case $choice in
    2)
      animate_phase "Inhale" 5 1
      animate_phase "Exhale" 5 -1
      ;;
    3)
      animate_phase "Inhale Left" 4 1
      animate_phase "Hold" 4 0
      animate_phase "Exhale Right" 4 -1
      animate_phase "Hold" 4 0
      animate_phase "Inhale Right" 4 1
      animate_phase "Hold" 4 0
      animate_phase "Exhale Left" 4 -1
      animate_phase "Hold" 4 0
      ;;
    *)
      animate_phase "Inhale" 4 1
      animate_phase "Hold" 4 0
      animate_phase "Exhale" 4 -1
      animate_phase "Hold" 4 0
      ;;
  esac
done
