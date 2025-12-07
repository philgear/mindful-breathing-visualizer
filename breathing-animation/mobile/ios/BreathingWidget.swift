import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), phase: "Inhale")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), phase: "Inhale")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        
        // Defined Techniques (Examples)
        let boxPhases = ["Inhale", "Hold", "Exhale", "Hold"]
        let diaphragmaticPhases = ["Inhale", "Exhale"]
        let alternatePhases = ["Inhale Left", "Hold", "Exhale Right", "Hold", "Inhale Right", "Hold", "Exhale Left", "Hold"]
        
        // Default to Box Breathing for the timeline
        for offset in 0 ..< 15 {
            let entryDate = Calendar.current.date(byAdding: .second, value: offset * 4, to: currentDate)!
            let phase = boxPhases[offset % boxPhases.count]
            let entry = SimpleEntry(date: entryDate, phase: phase)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let phase: String
}

struct BreathingWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack {
            Text(entry.phase)
                .font(.headline)
            
            Circle()
                .fill(colorForPhase(entry.phase))
                .scaleEffect(entry.phase == "Inhale" || entry.phase == "Hold" ? 1.0 : 0.5)
                .animation(.easeInOut(duration: 4), value: entry.phase)
                .frame(width: 60, height: 60)
        }
    }
    
    func colorForPhase(_ phase: String) -> Color {
        switch phase {
        case "Inhale": return .green
        case "Hold": return .blue
        case "Exhale": return .red
        default: return .blue
        }
    }
}

@main
struct BreathingWidget: Widget {
    let kind: String = "BreathingWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            BreathingWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Mindful Breathing")
        .description("Breathe along with your home screen.")
    }
}
