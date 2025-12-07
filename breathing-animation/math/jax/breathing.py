import jax
import jax.numpy as jnp
import time

def piecewise_box(t_in):
    # Period = 16s (4,4,4,4)
    t = t_in % 16.0
    return jax.lax.cond(
        t < 4.0, lambda x: x / 4.0,                   # Inhale (Linear up)
        lambda x: jax.lax.cond(
            x < 8.0, lambda _: 1.0,                   # Hold Full
            lambda y: jax.lax.cond(
                y < 12.0, lambda z: 1.0 - (z - 8.0)/4.0, # Exhale (Linear down)
                lambda _: 0.0,                        # Hold Empty
                y
            ),
            x
        ),
        t
    )

def generate_breathing_curve(duration_seconds: int = 60, sample_rate: int = 10, technique: str = "box"):
    """
    Generates breathing patterns using JAX.
    Techniques:
    - 'box': 4s In, 4s Hold, 4s Out, 4s Hold (Trapezoidal/Box shape)
    - 'diaphragmatic': 5s In, 5s Out (Sine wave)
    """
    # SECURITY: Input Validation to prevent Denial of Service (DoS) via Memory Exhaustion
    if duration_seconds > 3600:
        raise ValueError("Duration cannot exceed 1 hour (3600s)")
    if sample_rate > 1000:
        raise ValueError("Sample rate cannot exceed 1000Hz")
    if duration_seconds * sample_rate > 10_000_000:
         raise ValueError("Total samples exceed unsafe limit")
    
    total_samples = duration_seconds * sample_rate
    t = jnp.linspace(0, duration_seconds, total_samples)
    
    if technique == "box":
        # Vectorize our helper
        v_box = jax.vmap(piecewise_box)
        lung_volume = v_box(t)
        
    elif technique == "diaphragmatic":
        # 5s In, 5s Out = 10s Period
        period = 10.0
        frequency = 1.0 / period
        # Shifted Cosine: starts at 0 (bottom), goes to 1, back to 0
        lung_volume = (-jnp.cos(2 * jnp.pi * frequency * t) + 1.0) / 2.0
        
    else:
        # Default to sine
        lung_volume = 0.5 * jnp.sin(t) + 0.5

    return t, lung_volume

def simulate_session():
    print("JAX Mindful Breathing Simulation")
    print("Generating numerical model of breath...")
    
    # JIT compile the generation function for speed (overkill here, but demonstrates JAX)
    generate_jit = jax.jit(generate_breathing_curve, static_argnames=['technique'])
    
    start_compute = time.time()
    # Compute Box Breathing
    t, volume_box = generate_jit(32, 10, technique="box")
    volume_box.block_until_ready()
    
    # Compute Diaphragmatic
    _, volume_dia = generate_jit(32, 10, technique="diaphragmatic")
    volume_dia.block_until_ready()
    
    end_compute = time.time()
    
    print(f"Computed models in {end_compute - start_compute:.4f}s")
    print(f"Device: {jax.devices()[0]}")
    
    # Simple ASCII visualization
    print("\n--- Box Breathing (Trapezoidal) ---")
    for i in range(len(volume_box)):
        # Downsample for display
        if i % 5 != 0: continue
        val = float(volume_box[i])
        chars = int(val * 40)
        bar = "#" * chars
        print(f"{t[i]:5.1f}s | {bar}")

    print("\n--- Diaphragmatic (Smooth Sine) ---")
    for i in range(len(volume_dia)):
        # Downsample for display
        if i % 5 != 0: continue
        val = float(volume_dia[i])
        chars = int(val * 40)
        bar = "#" * chars
        print(f"{t[i]:5.1f}s | {bar}")

if __name__ == "__main__":
    try:
        simulate_session()
    except ImportError:
        print("Please install jax and jaxlib: pip install jax jaxlib")
