#include <emscripten.h>
#include <iostream>
#include <string>

// To compile: emcc breathing_wasm.cpp -o breathing.js -s WASM=1 -s EXPORTED_FUNCTIONS="['_start_breathing']"

extern "C" {

EMSCRIPTEN_KEEPALIVE
void start_breathing() {
    std::cout << "WASM: Cycle started" << std::endl;
    // In a real app, this would likely interact with JS or use a main loop
    // For MVP, we print phase changes.
    std::cout << "WASM: Inhale..." << std::endl;
    // Note: blocking sleep doesn't work well in browser main thread, 
    // so this is just a mockup of the logic structure.
}

}
