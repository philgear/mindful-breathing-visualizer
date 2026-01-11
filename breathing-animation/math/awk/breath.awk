#!/usr/bin/awk -f

# The Text Stream: Awk
# "Write programs that do one thing and do it well."

BEGIN {
    # 1. The Serene Palette (Variables)
    emerald = "\033[38;2;52;211;153m"
    blue    = "\033[38;2;96;165;250m"
    rose    = "\033[38;2;251;113;133m"
    reset   = "\033[0m"

    print "Starting The Text Stream (Awk)..."

    # 2. The Pattern (Parallel Arrays - Awk has no structs)
    labels[1] = "Inhale... 🌿"
    durations[1] = 4
    colors[1] = emerald

    labels[2] = "Hold... ☁️"
    durations[2] = 7
    colors[2] = blue

    labels[3] = "Exhale... 🌸"
    durations[3] = 8
    colors[3] = rose

    # 3. The Infinite Loop
    while (1) {
        for (i = 1; i <= 3; i++) {
            # Output
            printf "%s%s (%ds)%s\n", colors[i], labels[i], durations[i], reset
            
            # Flush hack (Awk buffers output sometimes)
            system("")

            # Wait
            cmd = sprintf("sleep %d", durations[i])
            system(cmd)
        }
    }
}
