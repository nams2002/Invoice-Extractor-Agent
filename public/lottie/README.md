# Lottie Animation Files

Place your Lottie JSON files in this directory to use them in the voice interface.

## Required Files

1. **microphone-pulse.json** - Animation for microphone button
2. **siri-wave.json** - Animation for Siri-like voice interface

## How to Get Free Lottie Files

### Method 1: LottieFiles.com (Recommended)

1. Go to [LottieFiles.com](https://lottiefiles.com/)
2. Search for these terms:
   - "microphone pulse"
   - "voice wave"
   - "siri animation"
   - "sound wave"
   - "voice assistant"

3. Download the JSON file and rename it appropriately
4. Place it in this directory

### Method 2: Specific Recommendations

Here are some great free animations you can search for:

**For microphone-pulse.json:**
- Search: "microphone recording"
- Search: "mic pulse"
- Search: "audio recording"

**For siri-wave.json:**
- Search: "voice wave"
- Search: "siri wave"
- Search: "sound visualization"

### Method 3: Create Your Own

Use Adobe After Effects with the Bodymovin plugin to create custom animations.

## File Structure

```
public/
  lottie/
    microphone-pulse.json
    siri-wave.json
    README.md (this file)
```

## Testing

After adding the files, the voice interface will automatically use them. If the files are not found, the app will fall back to CSS animations.

## File Size Recommendations

- Keep files under 100KB for best performance
- Optimize animations for web use
- Use simple, clean designs that match your app theme
