require_relative "mindful_breathing/version"

module MindfulBreathing
  class CLI
    # SWEBOK v4 "Serene Palette" (RGB)
    COLORS = {
      reset: "\e[0m",
      emerald: "\e[38;2;52;211;153m", # Inhale (#34d399)
      blue:    "\e[38;2;96;165;250m", # Hold   (#60a5fa)
      rose:    "\e[38;2;251;113;133m"  # Exhale (#fb7185)
    }

    TECHNIQUES = {
      "1" => { name: "Box Breathing", phases: [
        { name: "Inhale", duration: 4, color: :emerald },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale", duration: 4, color: :rose },
        { name: "Hold", duration: 4, color: :blue }
      ]},
      "2" => { name: "Diaphragmatic Breathing", phases: [
        { name: "Inhale", duration: 5, color: :emerald },
        { name: "Exhale", duration: 5, color: :rose }
      ]},
      "3" => { name: "Alternate Nostril", phases: [
        { name: "Inhale Left", duration: 4, color: :emerald },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale Right", duration: 4, color: :rose },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Inhale Right", duration: 4, color: :emerald },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale Left", duration: 4, color: :rose },
        { name: "Hold", duration: 4, color: :blue }
      ]}
    }

    def start
      puts "Mindful Breathing Visualizer (Ruby Gem v#{MindfulBreathing::VERSION})"
      puts "1. Box Breathing"
      puts "2. Diaphragmatic Breathing"
      puts "3. Alternate Nostril Breathing"
      print "Select a technique (1-3): "
      
      choice = gets.chomp
      technique = TECHNIQUES[choice] || TECHNIQUES["1"]
      
      puts "Starting #{technique[:name]}... Press Ctrl+C to stop."
      
      loop do
        technique[:phases].each do |phase|
          # SWEBOK KA 2 Audio Feedback (System Beep)
          print "\a"
          
          color_code = COLORS[phase[:color]]
          print "\r#{color_code}Phase: #{phase[:name]} (#{phase[:duration]}s)#{COLORS[:reset]}   "
          sleep phase[:duration]
        end
      end
    rescue Interrupt
      puts "\n\nNamaste. 🙏"
    end
  end
end
