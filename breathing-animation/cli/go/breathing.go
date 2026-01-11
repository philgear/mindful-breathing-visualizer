package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"
)

// SWEBOK v4 "Serene Palette" (TrueColor RGB)
const (
	ColorReset   = "\033[0m"
	ColorEmerald = "\033[38;2;52;211;153m"  // Inhale
	ColorBlue    = "\033[38;2;96;165;250m"  // Hold
	ColorRose    = "\033[38;2;251;113;133m" // Exhale
)

const (
	HideCursor  = "\033[?25l"
	ShowCursor  = "\033[?25h"
	ClearScreen = "\033[2J\033[H"
	MoveHome    = "\033[H"
)

type Phase struct {
	Name     string
	Duration time.Duration // internal duration
	Color    string
}

func main() {
	fmt.Print(ClearScreen)
	fmt.Println("Mindful Breathing Visualizer (Go TUI v2.0)")
	fmt.Println("1. Box Breathing")
	fmt.Println("2. Diaphragmatic Breathing")
	fmt.Println("3. Alternate Nostril Breathing")
	fmt.Print("Select a technique (1-3): ")

	reader := bufio.NewReader(os.Stdin)
	choice, _ := reader.ReadString('\n')
	choice = strings.TrimSpace(choice)

	var phases []Phase

	switch choice {
	case "2":
		phases = []Phase{
			{"Inhale", 5 * time.Second, ColorEmerald},
			{"Exhale", 5 * time.Second, ColorRose},
		}
	case "3":
		phases = []Phase{
			{"Inhale Left", 4 * time.Second, ColorEmerald},
			{"Hold", 4 * time.Second, ColorBlue},
			{"Exhale Right", 4 * time.Second, ColorRose},
			{"Hold", 4 * time.Second, ColorBlue},
			{"Inhale Right", 4 * time.Second, ColorEmerald},
			{"Hold", 4 * time.Second, ColorBlue},
			{"Exhale Left", 4 * time.Second, ColorRose},
			{"Hold", 4 * time.Second, ColorBlue},
		}
	default:
		phases = []Phase{
			{"Inhale", 4 * time.Second, ColorEmerald},
			{"Hold", 4 * time.Second, ColorBlue},
			{"Exhale", 4 * time.Second, ColorRose},
			{"Hold", 4 * time.Second, ColorBlue},
		}
	}

	fmt.Print(ClearScreen + HideCursor)

	// Main Loop
	for {
		for _, p := range phases {
			runPhase(p)
		}
	}
}

func runPhase(p Phase) {
	fps := 60
	frameDelay := time.Second / time.Duration(fps)
	startTime := time.Now()

	// SWEBOK KA 2 Audio Feedback
	fmt.Print("\a")

	for {
		elapsed := time.Since(startTime)
		if elapsed >= p.Duration {
			break
		}

		progress := float64(elapsed) / float64(p.Duration)
		drawFrame(p, progress, elapsed)
		time.Sleep(frameDelay)
	}
}

func drawFrame(p Phase, progress float64, elapsed time.Duration) {
	fmt.Print(MoveHome)
	fmt.Printf("\nMindful Breathing Visualizer (Go TUI v2.0)\n\n")

	remaining := p.Duration.Seconds() - elapsed.Seconds()
	fmt.Printf("Phase: %-15s (%0.1fs)     \n\n", p.Name, remaining)

	// Visual Logic
	visualProgress := progress
	if strings.Contains(p.Name, "Exhale") {
		visualProgress = 1.0 - progress
	} else if strings.Contains(p.Name, "Hold") {
		visualProgress = 1.0 // Simple heuristic
	}

	// Bar
	barWidth := 40
	fillWidth := int(visualProgress * float64(barWidth))
	bar := strings.Repeat("=", fillWidth)
	fmt.Printf("      %s[%-40s]%s\n\n", p.Color, bar, ColorReset)

	// Lung
	scale := 1.0 + (visualProgress * 2.0)
	dots := int(scale * 5.0)
	lungStr := "( " + strings.Repeat("●", dots) + " )"
	fmt.Printf("       %s%-30s%s\n", p.Color, lungStr, ColorReset)
}
