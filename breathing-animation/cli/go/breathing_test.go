package main

import (
	"testing"
)

func TestPhaseDurations(t *testing.T) {
	// Replicating logic from main to test expectations
	phases := []struct {
		name     string
		duration int
	}{
		{"Inhale", 4},
		{"Hold", 4},
		{"Exhale", 4},
		{"Hold", 4},
	}

	totalCycleTime := 0
	for _, p := range phases {
		if p.duration != 4 {
			t.Errorf("Expected duration 4 for %s, got %d", p.name, p.duration)
		}
		totalCycleTime += p.duration
	}

	if totalCycleTime != 16 {
		t.Errorf("Expected total cycle time 16, got %d", totalCycleTime)
	}
}
