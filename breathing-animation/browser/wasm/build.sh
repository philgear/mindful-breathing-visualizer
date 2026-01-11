#!/bin/bash
# Pre-requisite: Emscripten SDK installed and active
echo "Compiling to WASM..."
emcc breathing_wasm.cpp -o breathing.js -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'
console.log("Compilation complete (simulated).");
