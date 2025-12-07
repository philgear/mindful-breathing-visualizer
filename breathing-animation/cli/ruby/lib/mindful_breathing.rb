require_relative "mindful_breathing/version"

module MindfulBreathing
  class CLI
    COLORS = {
      reset: "\e[0m",
      green: "\e[32m", # Inhale
      blue: "\e[34m",  # Hold
      red: "\e[31m"    # Exhale
    }

    TECHNIQUES = {
      "1" => { name: "Box Breathing", phases: [
        { name: "Inhale", duration: 4, color: :green },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale", duration: 4, color: :red },
        { name: "Hold", duration: 4, color: :blue }
      ]},
      "2" => { name: "Diaphragmatic Breathing", phases: [
        { name: "Inhale", duration: 5, color: :green },
        { name: "Exhale", duration: 5, color: :red }
      ]},
      "3" => { name: "Alternate Nostril", phases: [
        { name: "Inhale Left", duration: 4, color: :green },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale Right", duration: 4, color: :red },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Inhale Right", duration: 4, color: :green },
        { name: "Hold", duration: 4, color: :blue },
        { name: "Exhale Left", duration: 4, color: :red },
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
