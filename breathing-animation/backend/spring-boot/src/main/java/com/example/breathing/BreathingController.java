package com.example.breathing;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // SECURITY: Explicitly whitelisted origin
public class BreathingController {

        // Java Record: Concise, immutable data carriers.
        // SECURITY: Immutability prevents state tampering/side-effects during
        // processing.
        public record BreathingPhase(String name, int duration) {
        }

        public record BreathingTechnique(String name, List<BreathingPhase> phases) {
        }

        @GetMapping("/api/techniques")
        public Map<String, BreathingTechnique> getTechniques() {
                return Map.of(
                                "box", new BreathingTechnique(
                                                "Box Breathing",
                                                List.of(
                                                                new BreathingPhase("Inhale", 4000),
                                                                new BreathingPhase("Hold", 4000),
                                                                new BreathingPhase("Exhale", 4000),
                                                                new BreathingPhase("Hold", 4000))),
                                "diaphragmatic", new BreathingTechnique(
                                                "Diaphragmatic",
                                                List.of(
                                                                new BreathingPhase("Inhale", 5000),
                                                                new BreathingPhase("Exhale", 5000))),
                                "alternate", new BreathingTechnique(
                                                "Alternate Nostril",
                                                List.of(
                                                                new BreathingPhase("Inhale Left", 4000),
                                                                new BreathingPhase("Hold", 4000),
                                                                new BreathingPhase("Exhale Right", 4000),
                                                                new BreathingPhase("Hold", 4000),
                                                                new BreathingPhase("Inhale Right", 4000),
                                                                new BreathingPhase("Hold", 4000),
                                                                new BreathingPhase("Exhale Left", 4000),
                                                                new BreathingPhase("Hold", 4000))));
        }

        @GetMapping("/")
        public String home() {
                return "<h1>Mindful Breathing API</h1><p>Visit <a href='/api/techniques'>/api/techniques</a> for breathing patterns.</p>";
        }
}
