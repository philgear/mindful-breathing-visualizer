#!/bin/bash
# Create target directory
mkdir -p target/classes

# Compile
javac -d target/classes src/main/java/com/example/cli/BreathingVisualizer.java

if [ $? -eq 0 ]; then
    echo "Build successful. Running..."
    java -cp target/classes com.example.cli.BreathingVisualizer
else
    echo "Compilation failed."
fi
