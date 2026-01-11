package com.example.cli;

import java.util.Scanner;
import java.util.ArrayList;
import java.util.List;

public class BreathingVisualizer {
    // SWEBOK v4 "Serene Palette" (TrueColor RGB)
    private static final String COLOR_RESET = "\033[0m";
    private static final String COLOR_EMERALD = "\033[38;2;52;211;153m"; // Inhale
    private static final String COLOR_BLUE = "\033[38;2;96;165;250m"; // Hold
    private static final String COLOR_ROSE = "\033[38;2;251;113;133m"; // Exhale

    private static final String HIDE_CURSOR = "\033[?25l";
    private static final String SHOW_CURSOR = "\033[?25h";
    private static final String CLEAR_SCREEN = "\033[2J\033[H";
    private static final String MOVE_HOME = "\033[H";

    static class Phase {
        String name;
        int durationMs;
        String color;

        Phase(String name, int durationMs, String color) {
            this.name = name;
            this.durationMs = durationMs;
            this.color = color;
        }
    }

    public static void main(String[] args) {
        // Restore cursor on exit
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.print(SHOW_CURSOR + COLOR_RESET);
        }));

        System.out.print(CLEAR_SCREEN);
        System.out.println("Mindful Breathing Visualizer (Java TUI v2.0)");
        System.out.println("1. Box Breathing");
        System.out.println("2. Diaphragmatic Breathing");
        System.out.println("3. Alternate Nostril Breathing");
        System.out.print("Select a technique (1-3): ");

        Scanner scanner = new Scanner(System.in);
        String choice = scanner.nextLine();
        // Don't close scanner as it closes System.in

        List<Phase> phases = new ArrayList<>();

        switch (choice) {
            case "2":
                phases.add(new Phase("Inhale", 5000, COLOR_EMERALD));
                phases.add(new Phase("Exhale", 5000, COLOR_ROSE));
                break;
            case "3":
                phases.add(new Phase("Inhale Left", 4000, COLOR_EMERALD));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                phases.add(new Phase("Exhale Right", 4000, COLOR_ROSE));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                phases.add(new Phase("Inhale Right", 4000, COLOR_EMERALD));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                phases.add(new Phase("Exhale Left", 4000, COLOR_ROSE));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                break;
            default: // Box
                phases.add(new Phase("Inhale", 4000, COLOR_EMERALD));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                phases.add(new Phase("Exhale", 4000, COLOR_ROSE));
                phases.add(new Phase("Hold", 4000, COLOR_BLUE));
                break;
        }

        System.out.print(CLEAR_SCREEN + HIDE_CURSOR);

        try {
            while (true) {
                for (Phase p : phases) {
                    runPhase(p);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void runPhase(Phase p) throws InterruptedException {
        int fps = 60;
        long frameDelayMs = 1000 / fps;
        long startTime = System.currentTimeMillis();

        // SWEBOK KA 2 Audio Feedback using system beep (BEL)
        System.out.print("\007");
        System.out.flush();

        while (true) {
            long now = System.currentTimeMillis();
            long elapsed = now - startTime;

            if (elapsed >= p.durationMs) {
                break;
            }

            double progress = (double) elapsed / p.durationMs;
            drawFrame(p, progress, elapsed);

            Thread.sleep(frameDelayMs);
        }
    }

    private static void drawFrame(Phase p, double progress, long elapsedMs) {
        System.out.print(MOVE_HOME);
        System.out.println("\nMindful Breathing Visualizer (Java TUI v2.0)\n");

        double remainingSec = (p.durationMs - elapsedMs) / 1000.0;
        System.out.printf("Phase: %-15s (%.1fs)     \n\n", p.name, remainingSec);

        // Visual Logic
        double visualProgress = progress;
        if (p.name.contains("Exhale")) {
            visualProgress = 1.0 - progress;
        } else if (p.name.contains("Hold")) {
            visualProgress = 1.0;
        }

        // Bar
        int barWidth = 40;
        int fillWidth = (int) (visualProgress * barWidth);
        StringBuilder bar = new StringBuilder();
        for (int i = 0; i < fillWidth; i++)
            bar.append("=");

        // Pad with spaces to clear old bar
        String barStr = String.format("%-40s", bar.toString());

        System.out.printf("      %s[%s]%s\n\n", p.color, barStr, COLOR_RESET);

        // Lung
        double scale = 1.0 + (visualProgress * 2.0); // 1.0 to 3.0
        int dots = (int) (scale * 5.0);
        StringBuilder lung = new StringBuilder("( ");
        for (int i = 0; i < dots; i++)
            lung.append("●");
        lung.append(" )");

        // Pad with spaces
        String lungStr = String.format("%-40s", lung.toString());

        System.out.printf("       %s%s%s\n", p.color, lungStr, COLOR_RESET);
    }
}
