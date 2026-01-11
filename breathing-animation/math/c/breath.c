/* The ANSI Foundation: C99 */
/* "With great power comes great responsibility." */

#define _POSIX_C_SOURCE 199309L
#include <stdio.h>
#include <time.h>
#include <unistd.h>

/* 1. The Structure (Data Layout) */
typedef struct {
    const char* label;
    double duration;
    const char* color;
} BreathPhase;

/* 2. The Serene Palette (ANSI Escape Codes) */
const char* EMERALD = "\x1b[38;2;52;211;153m";
const char* BLUE    = "\x1b[38;2;96;165;250m";
const char* ROSE    = "\x1b[38;2;251;113;133m";
const char* RESET   = "\x1b[0m";

/* 3. The Kernel Interaction (Syscall Wrapper) */
void sleep_seconds(double seconds) {
    struct timespec ts;
    ts.tv_sec = (time_t)seconds;
    ts.tv_nsec = (long)((seconds - ts.tv_sec) * 1e9);
    nanosleep(&ts, NULL);
}

int main() {
    /* 4. The Pattern (Stack Allocation) */
    BreathPhase cycle[] = {
        { "Inhale... 🌿", 4.0, EMERALD },
        { "Hold... ☁️",   7.0, BLUE },
        { "Exhale... 🌸", 8.0, ROSE }
    };
    
    int steps = sizeof(cycle) / sizeof(cycle[0]);

    printf("Starting The ANSI Foundation (C99)...\n");

    /* 5. The Infinite Loop (No Safety Net) */
    while (1) {
        for (int i = 0; i < steps; i++) {
            BreathPhase* p = &cycle[i]; // Pointer access
            
            // Output
            printf("%s%s (%.1fs)%s\n", p->color, p->label, p->duration, RESET);
            fflush(stdout); // Force kernel buffer flush
            
            // Wait
            sleep_seconds(p->duration);
        }
    }
    return 0;
}
