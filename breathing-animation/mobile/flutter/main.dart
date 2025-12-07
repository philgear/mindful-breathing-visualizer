import 'package:flutter/services.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mindful Breathing',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const BreathingPage(),
    );
  }
}

// IMMUTABILITY: Use immutable data class
@immutable
class BreathingGenericPhase {
  final String name;
  final int duration; // seconds
  final Color color;
  final double scale;

  const BreathingGenericPhase(this.name, this.duration, this.color, this.scale);
}

// SECURITY: Define techniques as static const to prevent runtime tampering
class BreathingData {
  // Static Const: Memory efficient and secure against modification
  static const Map<String, List<BreathingGenericPhase>> techniques = {
    "Box": [
      BreathingGenericPhase("Inhale", 4, Color(0xFF34D399), 1.5),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.5),
      BreathingGenericPhase("Exhale", 4, Color(0xFFFB7185), 1.0),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.0),
    ],
    "Diaphragmatic": [
      BreathingGenericPhase("Inhale", 5, Color(0xFF34D399), 1.5),
      BreathingGenericPhase("Exhale", 5, Color(0xFFFB7185), 1.0),
    ],
    "Alternate": [
      BreathingGenericPhase("Inhale Left", 4, Color(0xFF34D399), 1.5),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.5),
      BreathingGenericPhase("Exhale Right", 4, Color(0xFFFB7185), 1.0),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.0),
      BreathingGenericPhase("Inhale Right", 4, Color(0xFF34D399), 1.5),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.5),
      BreathingGenericPhase("Exhale Left", 4, Color(0xFFFB7185), 1.0),
      BreathingGenericPhase("Hold", 4, Color(0xFF60A5FA), 1.0),
    ]
  };
}

class BreathingPage extends StatefulWidget {
  const BreathingPage({super.key});

  @override
  State<BreathingPage> createState() => _BreathingPageState();
}

class _BreathingPageState extends State<BreathingPage> with SingleTickerProviderStateMixin {
  String phase = "Ready";
  double scale = 1.0;
  Color color = const Color(0xFF34D399); // Green
  String selectedTechnique = "Box";
  String selectedShape = "Circle";
  Duration currentDuration = const Duration(seconds: 4);
  
  // Audio
  static const platform = MethodChannel('com.philgear.breathing/audio');
  bool isMuted = false;

  @override
  void initState() {
    super.initState();
    _startAudioEngine();
    startBreathingCycle();
  }
  
  void _startAudioEngine() async {
    try {
      await platform.invokeMethod('start');
    } on PlatformException catch (_) {
      // Audio not supported or channel missing
    }
  }
  
  void _stopAudioEngine() async {
    try {
        await platform.invokeMethod('stop');
    } on PlatformException catch (_) {}
  }
  
  void _setAudioPhase(String phaseName) async {
    if (isMuted) return;
    try {
        await platform.invokeMethod('setPhase', {'phase': phaseName});
    } on PlatformException catch (_) {}
  }
  
  void _toggleMute() {
    setState(() {
        isMuted = !isMuted;
    });
    // Can also notify native side if needed, or handle gain there.
    // For now, we gate calls here.
    if (isMuted) {
         // Optionally tell native to silence
         try { platform.invokeMethod('mute'); } catch(_) {}
    } else {
         try { platform.invokeMethod('unmute'); } catch(_) {}
    }
  }
  
  @override
  void dispose() {
    _stopAudioEngine();
    super.dispose();
  }

  int _cycleId = 0;

  void startBreathingCycle() async {
    _cycleId++;
    int myId = _cycleId;
    
    // Allow UI to settle
    await Future.delayed(Duration.zero);

    while (mounted && myId == _cycleId) {
      // SECURITY: Safe lookup with fallback
      List<BreathingGenericPhase> phases = BreathingData.techniques[selectedTechnique] ?? BreathingData.techniques["Box"]!;
      
      for (var p in phases) {
        if (!mounted || myId != _cycleId) break;
        
        setState(() {
          phase = p.name;
          color = p.color;
          scale = p.scale;
          currentDuration = Duration(seconds: p.duration);
        });
        
        // Audio
        _setAudioPhase(p.name);
        
        // Wait for duration, checking for interruption
        int steps = p.duration * 10;
        for(int i=0; i<steps; i++) {
           if (!mounted || myId != _cycleId) break;
           await Future.delayed(const Duration(milliseconds: 100));
        }
      }
    }
  }

  void onTechniqueChanged(String? newValue) {
    // SECURITY: Validate input against allowed keys
    if (newValue != null && BreathingData.techniques.containsKey(newValue) && newValue != selectedTechnique) {
      setState(() {
        selectedTechnique = newValue;
      });
      // Restart loop
      startBreathingCycle();
    }
  }

  BoxDecoration _getShapeDecoration() {
    if (selectedShape == "Circle") {
      return BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 5,
          )
        ],
      );
    } else if (selectedShape == "Lotus") {
       return BoxDecoration(
        color: color,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(50),
            topRight: Radius.circular(70),
            bottomRight: Radius.circular(80),
            bottomLeft: Radius.circular(40)
        ), // Approximate organic shape
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 5,
          )
        ],
      );     
    } else {
      // Square (Rounded)
      return BoxDecoration(
        color: color,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 5,
          )
        ],
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Mindful Breathing",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
             const SizedBox(height: 20),
             
             // Mute Button
             ElevatedButton.icon(
                onPressed: _toggleMute,
                icon: Icon(isMuted ? Icons.volume_off : Icons.volume_up),
                label: Text(isMuted ? "Unmute" : "Mute"),
             ),
             const SizedBox(height: 20),
            
            // Shape Dropdown
            DropdownButton<String>(
               value: selectedShape,
               items: ["Circle", "Square", "Lotus"].map<DropdownMenuItem<String>>((String value) {
                 return DropdownMenuItem<String>(
                   value: value,
                   child: Text(value),
                 );
               }).toList(),
               onChanged: (String? newValue) {
                 if (newValue != null) {
                   setState(() {
                     selectedShape = newValue;
                   });
                 }
               },
            ),
            
            const SizedBox(height: 10),

            // Technique Dropdown
            DropdownButton<String>(
              value: selectedTechnique,
              items: BreathingData.techniques.keys.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              onChanged: onTechniqueChanged,
            ),
            const SizedBox(height: 40),
            AnimatedContainer(
              duration: currentDuration,
              curve: Curves.easeInOut,
              width: 200 * scale,
              height: 200 * scale,
              decoration: _getShapeDecoration(),
              alignment: Alignment.center,
              child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    phase,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
              ),
            ),
            const SizedBox(height: 60),
            Text(
              phase,
              style: const TextStyle(fontSize: 24),
            ),
          ],
        ),
      ),
    );
  }
}
