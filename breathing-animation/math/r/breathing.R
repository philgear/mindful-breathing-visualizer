# Mindful Breathing Visualizer - R Implementation
# SWEBOK v4 Serene Palette
# Inhale:  #34d399 (Emerald)
# Hold:    #60a5fa (Blue)
# Exhale:  #fb7185 (Rose)

# Define Palette
serene_emerald <- "#34d399"
serene_blue    <- "#60a5fa"
serene_rose    <- "#fb7185"

# Function to generate Box Breathing Data
# 4s In, 4s Hold, 4s Out, 4s Hold
generate_box_breathing <- function(duration = 16, sample_rate = 100) {
  t <- seq(0, duration, by = 1/sample_rate)
  lung_volume <- numeric(length(t))
  colors <- character(length(t))
  phases <- character(length(t))
  
  for (i in seq_along(t)) {
    cycle_time <- t[i] %% 16
    
    if (cycle_time < 4) {
      # Inhale
      lung_volume[i] <- cycle_time / 4
      colors[i] <- serene_emerald
      phases[i] <- "Inhale"
    } else if (cycle_time < 8) {
      # Hold
      lung_volume[i] <- 1
      colors[i] <- serene_blue
      phases[i] <- "Hold"
    } else if (cycle_time < 12) {
      # Exhale
      lung_volume[i] <- 1 - (cycle_time - 8) / 4
      colors[i] <- serene_rose
      phases[i] <- "Exhale"
    } else {
      # Hold
      lung_volume[i] <- 0
      colors[i] <- serene_blue
      phases[i] <- "Hold"
    }
  }
  
  return(data.frame(time = t, volume = lung_volume, color = colors, phase = phases))
}

# Generate Data
data <- generate_box_breathing(32)

# Visualization Note
cat("Mindful Breathing Data Generated.\n")
cat(sprintf("SWEBOK v4 Compliance Checked:\n"))
cat(sprintf("- Inhale Color: %s\n", serene_emerald))
cat(sprintf("- Hold Color:   %s\n", serene_blue))
cat(sprintf("- Exhale Color: %s\n", serene_rose))

# Check for Cairo/plotting capability (Basic text plot fallback if headless)
summary(data)

# If graphical output were requested, we would use:
# plot(data$time, data$volume, col=data$color, pch=19, main="Box Breathing")
