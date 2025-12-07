#!/bin/bash
javac BreathingVisualizer.java
if [ $? -eq 0 ]; then
    echo "Build successful. Running..."
    java BreathingVisualizer
else
    echo "Compilation failed."
fi
