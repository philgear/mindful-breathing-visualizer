import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import kotlinx.coroutines.*
import kotlin.math.sin

class AudioController {
    private var audioTrack: AudioTrack? = null
    private var isPlaying = false
    private var job: Job? = null
    private val sampleRate = 44100
    private var frequency = 150.0
    private var targetFrequency = 150.0
    private var volume = 0.0
    private var targetVolume = 0.0
    var isMuted = false

    fun start() {
        if (isPlaying) return
        
        val minBufferSize = AudioTrack.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        audioTrack = AudioTrack(
            AudioManager.STREAM_MUSIC,
            sampleRate,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            minBufferSize,
            AudioTrack.MODE_STREAM
        )

        audioTrack?.play()
        isPlaying = true

        job = CoroutineScope(Dispatchers.Default).launch {
            val bufferSize = 1024
            val buffer = ShortArray(bufferSize)
            var phase = 0.0
            
            while (isActive && isPlaying) {
                // Smooth transitions
                val step = 0.05 // Interpolation factor
                if (!isMuted) {
                    frequency += (targetFrequency - frequency) * step
                    volume += (targetVolume - volume) * step
                } else {
                    volume += (0.0 - volume) * step
                }

                for (i in 0 until bufferSize) {
                    buffer[i] = (sin(phase) * 32767 * volume).toInt().toShort()
                    phase += 2 * Math.PI * frequency / sampleRate
                    if (phase > 2 * Math.PI) phase -= 2 * Math.PI
                }
                audioTrack?.write(buffer, 0, bufferSize)
            }
        }
    }

    fun stop() {
        isPlaying = false
        job?.cancel()
        audioTrack?.stop()
        audioTrack?.release()
        audioTrack = null
    }

    fun setPhase(phaseName: String) {
        if (phaseName.contains("Inhale", ignoreCase = true)) {
            targetFrequency = 200.0
            targetVolume = 0.2
        } else if (phaseName.contains("Exhale", ignoreCase = true)) {
            targetFrequency = 150.0
            targetVolume = 0.1
        } else {
            // Hold
            // Keep current frequency, steady volume
        }
    }
    
    fun toggleMute(): Boolean {
        isMuted = !isMuted
        return isMuted
    }
}
