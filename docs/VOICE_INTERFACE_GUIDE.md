# Voice Interface & Lottie Animation Guide

## Overview

Your React-based invoice extracting agent now includes an advanced voice interface with Lottie animation support. This guide explains how to use and customize the voice features.

## Features

### 🎤 Voice Input
- **Microphone Button**: Click the microphone icon in the chat input to start voice recognition
- **Full-Screen Interface**: When listening, a beautiful overlay appears with real-time feedback
- **Live Transcription**: See your words appear in real-time as you speak
- **Confidence Indicator**: Visual feedback showing recognition confidence
- **Auto-Send**: High-confidence transcriptions are automatically sent

### 🎬 Lottie Animations
- **Siri-like Interface**: Beautiful wave animations during voice input
- **Fallback Animations**: CSS-based animations if Lottie files aren't available
- **Customizable**: Easy to replace with your own Lottie files

### 🔊 Text-to-Speech (Ready for Implementation)
- Framework ready for AI response speech output
- Configurable voice settings

## How to Use

### Basic Voice Input

1. **Start Voice Input**:
   - Click the microphone icon in the chat input field
   - Or click the small microphone in the file upload section

2. **Speak Your Message**:
   - Speak clearly and naturally
   - Watch the live transcription appear
   - See the confidence meter fill up

3. **Complete Input**:
   - High-confidence speech is auto-sent
   - Or click the stop button to manually send
   - Click outside the overlay to cancel

### Adding Custom Lottie Animations

1. **Get Lottie Files**:
   ```bash
   # Run the helper script
   node scripts/download-lottie.js
   ```

2. **Download from LottieFiles.com**:
   - Visit [LottieFiles.com](https://lottiefiles.com/)
   - Search for "microphone pulse" or "voice wave"
   - Download as JSON
   - Save to `public/lottie/`

3. **Required Files**:
   - `public/lottie/microphone-pulse.json` - For microphone button
   - `public/lottie/siri-wave.json` - For voice interface overlay

## Customization

### Voice Interface Settings

```javascript
// In VoiceInterface component
const recognition = new SpeechRecognition();
recognition.continuous = false;      // Single phrase mode
recognition.interimResults = true;   // Show live transcription
recognition.lang = 'en-US';         // Language setting
recognition.maxAlternatives = 1;     // Number of alternatives
```

### Animation Types

```javascript
// Use different animation types
<VoiceAnimation 
  isListening={isListening} 
  type="siri"           // 'siri' or 'microphone'
  size="xlarge"         // 'small', 'medium', 'large', 'xlarge'
  useLottie={true}      // true to use Lottie files, false for CSS
/>
```

### Styling

The voice interface uses your existing theme colors:
- Primary color: `text-primary-500`, `bg-primary-500`
- Dark theme: `bg-dark-800`, `text-white`
- Glass effect: `backdrop-blur-md`

## Browser Compatibility

### Speech Recognition Support
- ✅ Chrome/Chromium browsers
- ✅ Edge
- ✅ Safari (limited)
- ❌ Firefox (not supported)

### Fallback Behavior
- Unsupported browsers show a disabled microphone icon
- CSS animations are used if Lottie files aren't available
- Graceful degradation ensures the app works everywhere

## Technical Implementation

### Components Structure

```
src/components/
├── VoiceInterface.js      # Main voice input component
├── VoiceAnimation.js      # Lottie/CSS animation component
├── ChatInterface.js       # Updated with voice integration
└── FileUpload.js         # Added voice helper icon
```

### Key Features

1. **Real-time Transcription**: Shows words as you speak
2. **Confidence Scoring**: Visual feedback on recognition quality
3. **Auto-send Logic**: Sends high-confidence transcriptions automatically
4. **Error Handling**: Graceful handling of recognition errors
5. **Responsive Design**: Works on mobile and desktop

## Troubleshooting

### Common Issues

1. **Microphone Not Working**:
   - Check browser permissions
   - Ensure HTTPS (required for speech recognition)
   - Try refreshing the page

2. **No Lottie Animation**:
   - Check if files exist in `public/lottie/`
   - Verify JSON format is valid
   - CSS fallback animations will be used

3. **Poor Recognition**:
   - Speak clearly and slowly
   - Reduce background noise
   - Check microphone quality

### Debug Mode

Enable console logging to debug voice issues:
```javascript
// In VoiceInterface.js
recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
  // Add more detailed logging here
};
```

## Future Enhancements

### Planned Features
- [ ] Multiple language support
- [ ] Voice commands for app navigation
- [ ] Custom wake words
- [ ] Voice-to-voice conversations with AI
- [ ] Audio file upload and transcription

### Integration Ideas
- Voice-activated file upload
- Spoken invoice queries
- Audio responses from AI
- Voice-controlled navigation

## Performance Tips

1. **Optimize Lottie Files**:
   - Keep files under 100KB
   - Use simple animations
   - Optimize for web playback

2. **Voice Recognition**:
   - Use short phrases for better accuracy
   - Avoid background noise
   - Speak at normal pace

3. **Mobile Considerations**:
   - Test on actual devices
   - Consider battery usage
   - Optimize touch targets

## Security & Privacy

- Voice data is processed locally in the browser
- No audio is sent to external servers
- Speech recognition uses browser APIs only
- Transcriptions are not stored permanently

---

## Quick Start Checklist

- [x] Voice interface integrated into chat
- [x] Lottie animation support added
- [x] CSS fallback animations created
- [x] Helper scripts provided
- [ ] Download your preferred Lottie animations
- [ ] Test voice input in supported browsers
- [ ] Customize animations to match your brand

Enjoy your new voice-powered invoice assistant! 🎤✨
