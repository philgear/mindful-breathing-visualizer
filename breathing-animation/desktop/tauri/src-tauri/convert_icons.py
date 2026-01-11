from PIL import Image
import os

src = "/home/phil/Coding/MindfulBreathingVisualizer/mindful-breathing-visualizer/breathing-animation/frontend/vanilla-js/public/assets/branding/lotus-native.png"
if not os.path.exists('icons'):
    os.makedirs('icons')

img = Image.open(src).convert('RGBA')
img.resize((32, 32)).save('icons/32x32.png', 'PNG')
img.resize((128, 128)).save('icons/128x128.png', 'PNG')
print("Icons generated")
