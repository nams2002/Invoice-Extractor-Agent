#!/usr/bin/env node

/**
 * Script to help download popular Lottie animations for the voice interface
 * 
 * Usage: node scripts/download-lottie.js
 * 
 * This script provides URLs to popular free Lottie animations that work well
 * for voice interfaces. You can manually download them or use this as a reference.
 */

const fs = require('fs');
const path = require('path');

const LOTTIE_RECOMMENDATIONS = {
  'microphone-pulse.json': [
    {
      name: 'Microphone Recording',
      url: 'https://lottiefiles.com/animations/microphone-recording',
      description: 'Simple microphone with pulse animation'
    },
    {
      name: 'Voice Recording',
      url: 'https://lottiefiles.com/animations/voice-recording',
      description: 'Microphone with sound waves'
    },
    {
      name: 'Audio Pulse',
      url: 'https://lottiefiles.com/animations/audio-pulse',
      description: 'Clean microphone pulse animation'
    }
  ],
  'siri-wave.json': [
    {
      name: 'Voice Wave',
      url: 'https://lottiefiles.com/animations/voice-wave',
      description: 'Siri-like voice wave animation'
    },
    {
      name: 'Sound Visualization',
      url: 'https://lottiefiles.com/animations/sound-visualization',
      description: 'Audio wave visualization'
    },
    {
      name: 'Voice Assistant',
      url: 'https://lottiefiles.com/animations/voice-assistant',
      description: 'Voice assistant interface animation'
    }
  ]
};

function createLottieDirectory() {
  const lottieDir = path.join(process.cwd(), 'public', 'lottie');
  if (!fs.existsSync(lottieDir)) {
    fs.mkdirSync(lottieDir, { recursive: true });
    console.log('✅ Created public/lottie directory');
  }
  return lottieDir;
}

function generateInstructions() {
  console.log('\n🎬 Lottie Animation Setup Instructions\n');
  console.log('To add voice animations to your app, follow these steps:\n');

  Object.entries(LOTTIE_RECOMMENDATIONS).forEach(([filename, animations]) => {
    console.log(`📁 ${filename}:`);
    console.log('   Choose one of these animations:\n');
    
    animations.forEach((anim, index) => {
      console.log(`   ${index + 1}. ${anim.name}`);
      console.log(`      URL: ${anim.url}`);
      console.log(`      Description: ${anim.description}\n`);
    });
    
    console.log(`   Steps:`);
    console.log(`   1. Visit one of the URLs above`);
    console.log(`   2. Click "Download" and select "Lottie JSON"`);
    console.log(`   3. Save the file as "public/lottie/${filename}"`);
    console.log(`   4. Refresh your app to see the animation\n`);
    console.log('   ' + '─'.repeat(50) + '\n');
  });

  console.log('💡 Tips:');
  console.log('   • Look for animations with blue/primary colors to match your theme');
  console.log('   • Choose simple, clean animations for best performance');
  console.log('   • File size should be under 100KB');
  console.log('   • If no Lottie files are found, the app uses CSS fallback animations');
  console.log('\n🔗 Alternative: Search LottieFiles.com for:');
  console.log('   • "microphone pulse"');
  console.log('   • "voice wave"');
  console.log('   • "siri animation"');
  console.log('   • "sound visualization"');
}

function createSampleLottieFiles() {
  const lottieDir = createLottieDirectory();
  
  // Create a simple sample file to show the structure
  const sampleAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Sample",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [100] },
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 30, s: [120] },
              { t: 60, s: [100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [20, 20] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.2, 0.6, 1, 1] },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      }
    ]
  };

  const samplePath = path.join(lottieDir, 'sample-animation.json');
  fs.writeFileSync(samplePath, JSON.stringify(sampleAnimation, null, 2));
  console.log('✅ Created sample animation file at public/lottie/sample-animation.json');
}

// Main execution
console.log('🎬 Lottie Animation Helper for Voice Interface\n');

createLottieDirectory();
createSampleLottieFiles();
generateInstructions();

console.log('\n🚀 Ready! Your voice interface will now look for Lottie files in public/lottie/');
console.log('   If files are not found, it will use beautiful CSS fallback animations.');
