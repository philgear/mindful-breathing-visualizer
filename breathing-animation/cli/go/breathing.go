package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"
)

type Phase struct {
	// SECURITY: Strictly typed struct guarantees memory layout safety.
	Name     string
	Duration int // ms
}

func main() {
	fmt.Println("Mindful Breathing Visualizer (Go CLI)")
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
		fmt.Println("Starting Diaphragmatic Breathing...")
		phases = []Phase{
			{"Inhale", 5000},
			{"Exhale", 5000},
		}
	case "3":
		fmt.Println("Starting Alternate Nostril Breathing...")
		phases = []Phase{
			{"Inhale Left", 4000},
			{"Hold", 4000},
			{"Exhale Right", 4000},
			{"Hold", 4000},
			{"Inhale Right", 4000},
			{"Hold", 4000},
			{"Exhale Left", 4000},
			{"Hold", 4000},
		}
	default:
		fmt.Println("Starting Box Breathing...")
		phases = []Phase{
			{"Inhale", 4000},
			{"Hold", 4000},
			{"Exhale", 4000},
			{"Hold", 4000},
		}
	}

	fmt.Println("Press Ctrl+C to stop.")

	// Colors
	const (
		ColorGreen = "\033[32m"
		ColorBlue  = "\033[34m"
		ColorRed   = "\033[31m"
		ColorReset = "\033[0m"
	)

	for {
		for _, p := range phases {
			color := ColorBlue
			if strings.HasPrefix(p.Name, "Inhale") {
				color = ColorGreen
			} else if strings.HasPrefix(p.Name, "Exhale") {
				color = ColorRed
			}

			fmt.Printf("\r%sPhase: %s (%ds)%s   ", color, p.Name, p.Duration/1000, ColorReset)
			time.Sleep(time.Duration(p.Duration) * time.Millisecond)
		}
	}
}
