import SwiftUI

struct Phase {
    let name: String
    let duration: Double
    let color: Color
    let scale: CGFloat
}

struct BreathingView: View {
    @State private var scale: CGFloat = 1.0
    @State private var phaseText: String = "Ready"
    @State private var color: Color = Color(hex: "#34d399")
    @State private var selectedTechnique: String = "Box"
    @State private var selectedShape: String = "Circle"
    @StateObject private var audioController = AudioController()
    
    // Techniques
    let techniques: [String: [Phase]] = [
        "Box": [
            Phase(name: "Inhale", duration: 4, color: Color(hex: "#34d399"), scale: 1.5),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.5),
            Phase(name: "Exhale", duration: 4, color: Color(hex: "#fb7185"), scale: 1.0),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.0)
        ],
        "Diaphragmatic": [
            Phase(name: "Inhale", duration: 5, color: Color(hex: "#34d399"), scale: 1.5),
            Phase(name: "Exhale", duration: 5, color: Color(hex: "#fb7185"), scale: 1.0)
        ],
        "Alternate": [
            Phase(name: "Inhale Left", duration: 4, color: Color(hex: "#34d399"), scale: 1.5),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.5),
            Phase(name: "Exhale Right", duration: 4, color: Color(hex: "#fb7185"), scale: 1.0),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.0),
            Phase(name: "Inhale Right", duration: 4, color: Color(hex: "#34d399"), scale: 1.5),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.5),
            Phase(name: "Exhale Left", duration: 4, color: Color(hex: "#fb7185"), scale: 1.0),
            Phase(name: "Hold", duration: 4, color: Color(hex: "#60a5fa"), scale: 1.0)
        ]
    ]

    var body: some View {
        ZStack {
            // Background Gradient
            LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)]), startPoint: .topLeading, endPoint: .bottomTrailing)
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                Text("Mindful Breathing")
                    .font(.largeTitle)
                    .padding()
                
                Picker("Technique", selection: $selectedTechnique) {
                    Text("Box").tag("Box")
                    Text("Diaphragmatic").tag("Diaphragmatic")
                    Text("Alternate").tag("Alternate")
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()

                Picker("Shape", selection: $selectedShape) {
                    Text("Circle").tag("Circle")
                    Text("Square").tag("Square")
                    Text("Lotus").tag("Lotus")
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                Spacer()
                
                ZStack {
                    if selectedShape == "Circle" {
                         Circle()
                            .fill(color)
                            .frame(width: 200, height: 200)
                            .scaleEffect(scale)
                            .shadow(radius: 10)
                            .animation(.linear(duration: 0.5), value: color) 
                    } else if selectedShape == "Lotus" {
                         // Lotus Approximation (Rounded Rect with uneven corners logic not easily available in older SwiftUI, 
                         // so using custom RoundedRectangle with large corners to approximate petal)
                         RoundedRectangle(cornerRadius: 60)
                            .fill(color)
                            .frame(width: 200, height: 200)
                            .scaleEffect(scale)
                            .shadow(radius: 10)
                            .animation(.linear(duration: 0.5), value: color)
                    } else {
                         // Square
                         RoundedRectangle(cornerRadius: 12)
                            .fill(color)
                            .frame(width: 200, height: 200)
                            .scaleEffect(scale)
                            .shadow(radius: 10)
                            .animation(.linear(duration: 0.5), value: color)
                    }
                        .scaleEffect(scale)
                        .shadow(radius: 10)
                        .animation(.linear(duration: 0.5), value: color) // Smooth color transition
                    
                    Text(phaseText)
                        .font(.title)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .bold()
                }
                
                Spacer()
                
                Text(phaseText)
                    .font(.title2)
                    .padding()
                
                // Mute Button
                Button(action: {
                    audioController.toggleMute()
                }) {
                    Text(audioController.isMuted ? "🔇 Unmute" : "🔊 Mute")
                        .padding()
                        .background(Color.white)
                        .cornerRadius(8)
                        .shadow(radius: 2)
                }
                .padding(.bottom)
            }
        }
        .task(id: selectedTechnique) {
            audioController.start() // Ensure start
            await runBreathingLoop()
        }
        .onDisappear {
            audioController.stop()
        }
    }
    
    func runBreathingLoop() async {
        // SECURITY: Safe lookup with fallback (??) ensures loop never crashes on invalid keys.
        let currentPhases = techniques[selectedTechnique] ?? techniques["Box"]!
        
        // Infinite loop
        while !Task.isCancelled {
            for phase in currentPhases {
                if Task.isCancelled { break }
                
                // Update State
                withAnimation(.easeInOut(duration: phase.duration)) {
                    scale = phase.scale
                    color = phase.color
                }
                phaseText = phase.name
                
                // Audio Update
                audioController.setPhase(phase.name)
                
                // Wait
                // Sleep takes nanoseconds
                try? await Task.sleep(nanoseconds: UInt64(phase.duration * 1_000_000_000))
            }
        }
    }
}

// Extension to support Hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        BreathingView()
    }
}
