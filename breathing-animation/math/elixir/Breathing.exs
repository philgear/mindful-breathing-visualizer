# The Concurrent Breath: Elixir
# "Everything is a process."

defmodule Breathing do
  # 1. The Serene Palette (Pattern Matching Constants)
  def color(:emerald), do: "\u001b[38;2;52;211;153m"
  def color(:blue),    do: "\u001b[38;2;96;165;250m"
  def color(:rose),    do: "\u001b[38;2;251;113;133m"
  def color(:reset),   do: "\u001b[0m"

  # 2. The Actor (The "Loop")
  # The recursive function that receives messages and transitions state.
  def loop do
    receive do
      {:phase, label, duration, color_atom} ->
        # Effect: Print to Shell
        IO.puts "#{color(color_atom)}#{label} (#{duration}s)#{color(:reset)}"
        
        # Effect: Sleep (Simulate Duration)
        Process.sleep(trunc(duration * 1000))
        
        # Transition: Determine next phase and send message to SELF
        next_phase = case label do
          "Inhale... 🌿" -> {:phase, "Hold... ☁️",   7.0, :blue}
          "Hold... ☁️"   -> {:phase, "Exhale... 🌸", 8.0, :rose}
          "Exhale... 🌸" -> {:phase, "Inhale... 🌿", 4.0, :emerald}
        end
        
        send(self(), next_phase)
        loop()
    end
  end

  # 3. Initialization
  def start do
    IO.puts "Starting The Concurrent Breath (Elixir BEAM)..."
    pid = spawn(fn -> loop() end)
    # Bootstrap the infinite cycle
    send(pid, {:phase, "Inhale... 🌿", 4.0, :emerald})
    
    # Keep main process alive indefinitely
    Process.sleep(:infinity)
  end
end

# Execution
Breathing.start()
