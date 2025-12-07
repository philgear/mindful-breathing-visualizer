
import AVFoundation

class AudioController: ObservableObject {
    private var engine: AVAudioEngine?
    private var sourceNode: AVAudioSourceNode?
    private var isPlaying = false
    private var currentFrequency: Float = 150.0
    private var targetFrequency: Float = 150.0
    private var currentVolume: Float = 0.0
    private var targetVolume: Float = 0.0
    @Published var isMuted = false

    private let sampleRate: Double = 44100.0
    private var phase: Float = 0.0

    func start() {
        if isPlaying { return }
        
        engine = AVAudioEngine()
        let mainMixer = engine!.mainMixerNode
        let outputNode = engine!.outputNode
        let format = outputNode.inputFormat(forBus: 0)
        
        // Create a source node for manual signal generation
        sourceNode = AVAudioSourceNode { _, _, frameCount, audioBufferList -> OSStatus in
            let ablPointer = UnsafeMutableAudioBufferListPointer(audioBufferList)
            
            for frame in 0..<Int(frameCount) {
                // Smooth interpolation
                let step: Float = 0.005 
                
                if !self.isMuted {
                    self.currentFrequency += (self.targetFrequency - self.currentFrequency) * step
                    self.currentVolume += (self.targetVolume - self.currentVolume) * step
                } else {
                     self.currentVolume += (0.0 - self.currentVolume) * step
                }

                let value = sin(self.phase) * self.currentVolume
                self.phase += 2.0 * Float.pi * self.currentFrequency / Float(format.sampleRate)
                if self.phase > 2.0 * Float.pi {
                    self.phase -= 2.0 * Float.pi
                }
                
                for buffer in ablPointer {
                    let buf: UnsafeMutableBufferPointer<Float> = UnsafeMutableBufferPointer(buffer)
                    if frame < buf.count {
                        buf[frame] = value
                    }
                }
            }
            return noErr
        }
        
        engine!.attach(sourceNode!)
        engine!.connect(sourceNode!, to: mainMixer, format: format)
        engine!.connect(mainMixer, to: outputNode, format: format)
        
        do {
            try engine!.start()
            isPlaying = true
        } catch {
            print("Could not start audio engine: \(error)")
        }
    }
    
    func stop() {
        engine?.stop()
        isPlaying = false
    }
    
    func setPhase(_ phaseName: String) {
        if phaseName.contains("Inhale") {
            targetFrequency = 200.0
            targetVolume = 0.2
        } else if phaseName.contains("Exhale") {
            targetFrequency = 150.0
            targetVolume = 0.1
        } else {
            // Hold
        }
    }
    
    func toggleMute() {
        isMuted.toggle()
    }
}
