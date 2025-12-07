import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

data class BreathingPhase(
    val name: String,
    // SECURITY: Immutable properties prevent state tampering during animation loops
    val durationMillis: Int,
    val color: Color,
    val scale: Float
)

@Composable
fun BreathingScreen() {
    var selectedTechnique by remember { mutableStateOf("Box") }
    var selectedShape by remember { mutableStateOf("Circle") }
    var phase by remember { mutableStateOf("Ready") }
    var scaleTarget by remember { mutableStateOf(1.0f) }
    var colorTarget by remember { mutableStateOf(Color(0xFF34D399)) } // Green
    var currentDuration by remember { mutableStateOf(4000) }

    // Animation states
    val scale by animateFloatAsState(
        targetValue = scaleTarget,
        animationSpec = tween(durationMillis = currentDuration, easing = LinearEasing)
    )

    // Techniques Data
    val boxPhases = listOf(
        BreathingPhase("Inhale", 4000, Color(0xFF34D399), 1.5f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.5f),
        BreathingPhase("Exhale", 4000, Color(0xFFFB7185), 1.0f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.0f)
    )

    val diaphragmaticPhases = listOf(
        BreathingPhase("Inhale", 5000, Color(0xFF34D399), 1.5f),
        BreathingPhase("Exhale", 5000, Color(0xFFFB7185), 1.0f)
    )

    val alternatePhases = listOf(
        BreathingPhase("Inhale Left", 4000, Color(0xFF34D399), 1.5f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.5f),
        BreathingPhase("Exhale Right", 4000, Color(0xFFFB7185), 1.0f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.0f),
        BreathingPhase("Inhale Right", 4000, Color(0xFF34D399), 1.5f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.5f),
        BreathingPhase("Exhale Left", 4000, Color(0xFFFB7185), 1.0f),
        BreathingPhase("Hold", 4000, Color(0xFF60A5FA), 1.0f)
    )

    // Audio Controller
    val audioController = remember { AudioController() }
    var isMuted by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        audioController.start()
        onDispose {
            audioController.stop()
        }
    }

    // Effect loop that reacts to technique change
    LaunchedEffect(selectedTechnique) {
        val phases = when (selectedTechnique) {
            "Diaphragmatic" -> diaphragmaticPhases
            "Alternate" -> alternatePhases
            else -> boxPhases
        }

        while (true) {
            for (p in phases) {
                phase = p.name
                scaleTarget = p.scale
                colorTarget = p.color
                currentDuration = p.durationMillis
                
                // Audio Update
                audioController.setPhase(p.name)
                
                delay(p.durationMillis.toLong())
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF0F4F8)),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "Mindful Breathing", fontSize = 32.sp, modifier = Modifier.padding(bottom = 20.dp))
            
            // Mute Button
            Button(
                onClick = { isMuted = audioController.toggleMute() },
                modifier = Modifier.padding(bottom = 20.dp)
            ) {
                Text(if (isMuted) "🔇 Unmute" else "🔊 Mute")
            }

            // Technique Selectors
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp)
            ) {
                Button(onClick = { selectedTechnique = "Box" }) { Text("Box") }
                Button(onClick = { selectedTechnique = "Diaphragmatic" }) { Text("Dia") }
                Button(onClick = { selectedTechnique = "Alternate" }) { Text("Alt") }
            }

            // Shape Selectors
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth().padding(bottom = 40.dp)
            ) {
                Button(onClick = { selectedShape = "Circle" }) { Text("Circle") }
                Button(onClick = { selectedShape = "Square" }) { Text("Square") }
                Button(onClick = { selectedShape = "Lotus" }) { Text("Lotus") }
            }
            
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(200.dp)
                    .scale(scale)
                    .background(
                        color = colorTarget, 
                        shape = when (selectedShape) {
                            "Square" -> androidx.compose.foundation.shape.RoundedCornerShape(12.dp)
                            "Lotus" -> androidx.compose.foundation.shape.RoundedCornerShape(
                                topStart = 40.dp, bottomStart = 30.dp, topEnd = 60.dp, bottomEnd = 50.dp
                            )
                            else -> CircleShape
                        }
                    )
            ) {
                Text(text = phase, color = Color.White, fontSize = 24.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
            
            Text(text = phase, fontSize = 24.sp, modifier = Modifier.padding(top = 60.dp))
        }
    }
}
