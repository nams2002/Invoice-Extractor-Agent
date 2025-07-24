# Lottie Animations

This directory contains Lottie animation files for the voice interface.

## How to Add Lottie Files

### Option 1: Use Free Lottie Animations from LottieFiles

1. Visit [LottieFiles.com](https://lottiefiles.com/)
2. Search for animations like:
   - "microphone"
   - "voice"
   - "siri wave"
   - "sound wave"
   - "listening"
   - "speech recognition"

3. Download the JSON file and place it in this directory

### Option 2: Popular Free Voice-Related Animations

Here are some popular free animations you can download:

- **Microphone Pulse**: Search "microphone pulse" on LottieFiles
- **Voice Wave**: Search "voice wave" or "sound wave"
- **Siri-like Animation**: Search "siri" or "voice assistant"
- **Recording Animation**: Search "recording" or "audio"

### Option 3: Create Your Own

Use tools like:
- Adobe After Effects with Bodymovin plugin
- Lottie Creator
- Rive (for interactive animations)

## Usage in Components

```javascript
import Lottie from 'lottie-react';
import animationData from '../assets/lottie/microphone-animation.json';

<Lottie
  animationData={animationData}
  loop={true}
  autoplay={true}
  style={{ width: 100, height: 100 }}
/>
```

## Recommended Animation Properties

For voice interface animations:
- **Duration**: 1-3 seconds
- **Loop**: true
- **Size**: 100x100 to 200x200 pixels
- **Colors**: Match your app theme (blue/primary colors)
- **Style**: Smooth, modern, minimal

## File Naming Convention

- `microphone-pulse.json` - For microphone button animation
- `voice-wave.json` - For voice wave visualization
- `listening-indicator.json` - For listening state
- `siri-wave.json` - For Siri-like wave animation
