import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';

// You can use any of these free Lottie animations for voice/microphone
// Option 1: Simple microphone pulse animation (JSON data)
const microphoneAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 200,
  "h": 200,
  "nm": "Microphone",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Microphone",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [100]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 30, "s": [120]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 60, "s": [100]},
            {"t": 90, "s": [100]}
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "rc",
              "d": 1,
              "s": {"a": 0, "k": [40, 60]},
              "p": {"a": 0, "k": [0, -10]},
              "r": {"a": 0, "k": 20}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.2, 0.6, 1, 1]},
              "o": {"a": 0, "k": 100}
            }
          ]
        },
        {
          "ty": "gr",
          "it": [
            {
              "ty": "rc",
              "d": 1,
              "s": {"a": 0, "k": [8, 20]},
              "p": {"a": 0, "k": [0, 30]},
              "r": {"a": 0, "k": 4}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.2, 0.6, 1, 1]},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Pulse",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 15, "s": [100]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 45, "s": [0]},
            {"t": 90, "s": [0]}
          ]
        },
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [50]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 30, "s": [150]},
            {"t": 60, "s": [200]}
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "d": 1,
              "s": {"a": 0, "k": [80, 80]},
              "p": {"a": 0, "k": [0, 0]}
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.2, 0.6, 1, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 3}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    }
  ]
};

// Siri-like wave animation
const siriWaveAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 120,
  "w": 300,
  "h": 100,
  "nm": "SiriWave",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Wave1",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 80},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [150, 50, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "sh",
              "ks": {
                "a": 1,
                "k": [
                  {
                    "i": {"x": 0.833, "y": 0.833},
                    "o": {"x": 0.167, "y": 0.167},
                    "t": 0,
                    "s": [{"i": [[0,0],[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0],[0,0]], "v": [[-100,0],[-50,-20],[50,20],[100,0]], "c": false}]
                  },
                  {
                    "i": {"x": 0.833, "y": 0.833},
                    "o": {"x": 0.167, "y": 0.167},
                    "t": 30,
                    "s": [{"i": [[0,0],[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0],[0,0]], "v": [[-100,0],[-50,30],[50,-30],[100,0]], "c": false}]
                  },
                  {
                    "i": {"x": 0.833, "y": 0.833},
                    "o": {"x": 0.167, "y": 0.167},
                    "t": 60,
                    "s": [{"i": [[0,0],[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0],[0,0]], "v": [[-100,0],[-50,-20],[50,20],[100,0]], "c": false}]
                  },
                  {
                    "t": 120,
                    "s": [{"i": [[0,0],[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0],[0,0]], "v": [[-100,0],[-50,30],[50,-30],[100,0]], "c": false}]
                  }
                ]
              }
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.2, 0.6, 1, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 4},
              "lc": 2,
              "lj": 2
            }
          ]
        }
      ],
      "ip": 0,
      "op": 120,
      "st": 0,
      "bm": 0
    }
  ]
};

// CSS-based wave animation as fallback
const CSSWaveAnimation = ({ isListening, size }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center relative`}>
      {/* Central dot */}
      <div className="w-2 h-2 bg-primary-500 rounded-full absolute"></div>

      {/* Animated waves */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-primary-500 rounded-full"
          animate={{
            scale: [0, 2, 0],
            opacity: [1, 0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Siri-like circular animation
const SiriBarsAnimation = ({ isListening, size }) => {
  const barCount = size === 'xlarge' ? 20 : size === 'large' ? 15 : 10;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  const getBarDimensions = () => {
    if (size === 'xlarge') return { width: '3px', baseHeight: 6, maxHeight: 60 };
    if (size === 'large') return { width: '2px', baseHeight: 4, maxHeight: 40 };
    return { width: '2px', baseHeight: 3, maxHeight: 20 };
  };

  const { width, baseHeight, maxHeight } = getBarDimensions();

  const getBarPosition = (index) => {
    const angle = (index / barCount) * 2 * Math.PI;
    const radius = size === 'xlarge' ? 45 : size === 'large' ? 35 : 25;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angle };
  };

  const getHeightRange = (index) => {
    // Create wave-like pattern around the circle
    const waveOffset = (index / barCount) * 2 * Math.PI;
    const waveHeight = Math.sin(waveOffset) * 0.5 + 0.5; // 0 to 1
    const dynamicHeight = baseHeight + (maxHeight - baseHeight) * waveHeight;
    return [baseHeight, dynamicHeight, baseHeight];
  };

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {bars.map((i) => {
        const { x, y, angle } = getBarPosition(i);
        const heightRange = getHeightRange(i);

        return (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-t from-primary-600 to-primary-400 rounded-full"
            style={{
              width: width,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transformOrigin: 'center bottom',
              transform: `translate(-50%, -50%) rotate(${angle + Math.PI/2}rad)`,
              minHeight: `${heightRange[0]}px`
            }}
            animate={{
              height: heightRange.map(h => `${h}px`),
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1.5 + (Math.random() * 1),
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Central glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

const VoiceAnimation = ({ isListening, type = 'microphone', size = 'medium', useLottie = false }) => {
  const [animationData, setAnimationData] = useState(null);
  const [useFallback, setUseFallback] = useState(!useLottie);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  // Try to load external Lottie file if useLottie is true
  useEffect(() => {
    if (useLottie) {
      const loadLottieFile = async () => {
        try {
          // Try to load from public folder or assets
          const fileName = type === 'siri' ? 'siri-wave.json' : 'microphone-pulse.json';
          const response = await fetch(`/lottie/${fileName}`);
          if (response.ok) {
            const data = await response.json();
            setAnimationData(data);
            setUseFallback(false);
          } else {
            setUseFallback(true);
          }
        } catch (error) {
          console.log('Lottie file not found, using CSS animation fallback');
          setUseFallback(true);
        }
      };
      loadLottieFile();
    }
  }, [useLottie, type]);

  const renderAnimation = () => {
    if (useLottie && animationData && !useFallback) {
      return (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      );
    }

    // Use built-in Lottie data or CSS fallback
    if (type === 'siri') {
      return useFallback ?
        <SiriBarsAnimation isListening={isListening} size={size} /> :
        <Lottie
          animationData={siriWaveAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />;
    }

    return useFallback ?
      <CSSWaveAnimation isListening={isListening} size={size} /> :
      <Lottie
        animationData={microphoneAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />;
  };

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          className={`${sizeClasses[size]} flex items-center justify-center`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {renderAnimation()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceAnimation;
