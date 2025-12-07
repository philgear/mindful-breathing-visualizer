import java.util.Scanner;

public class BreathingVisualizer {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("Mindful Breathing Visualizer (Java CLI)");
        System.out.println("1. Box Breathing");
        System.out.println("2. Diaphragmatic Breathing");
        System.out.println("3. Alternate Nostril Breathing");
        System.out.print("Select a technique (1-3): ");

        // SECURITY: Java's Scanner is memory-safe and handles buffer limits
        // automatically.
        Scanner scanner = new Scanner(System.in);
        String choice = scanner.nextLine();
        scanner.close();

        String[] phases;
        int[] durations;

        switch (choice) {
            case "2":
                System.out.println("Starting Diaphragmatic Breathing...");
                phases = new String[] { "Inhale", "Exhale" };
                durations = new int[] { 5000, 5000 };
                break;
            case "3":
                System.out.println("Starting Alternate Nostril Breathing...");
                phases = new String[] { "Inhale Left", "Hold", "Exhale Right", "Hold", "Inhale Right", "Hold",
                        "Exhale Left", "Hold" };
                durations = new int[] { 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000 };
                break;
            case "1":
            default:
                System.out.println("Starting Box Breathing...");
                phases = new String[] { "Inhale", "Hold", "Exhale", "Hold" };
                durations = new int[] { 4000, 4000, 4000, 4000 };
                break;
        }

        System.out.println("Press Ctrl+C to stop.\n");

        while (true) {
            for (int i = 0; i < phases.length; i++) {
                String phase = phases[i];
                int duration = durations[i];
                System.out.print("\rPhase: " + phase + " (" + (duration / 1000) + "s)   ");

                long start = System.currentTimeMillis();
                while (System.currentTimeMillis() - start < duration) {
                    Thread.sleep(100);
                }
            }
        }
    }
}
