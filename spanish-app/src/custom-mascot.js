import React, { useState, useEffect, useRef, useCallback } from 'react';

// CustomizableMascot Component: Highly customizable animal mascot system
// Supports multiple animal types with distinctive features
export default function CustomizableMascot({
  mascotName = "My Animal Friend",
  animalType = "bear", // bear, cat, dog, bird, pig, horse, giraffe
  
  // Colors
  bgColor = "bg-gray-200",
  bodyColor = "#D2691E", // Sandy brown for bear
  earColor = "#8B4513", // Darker brown for ears
  eyeColor = "white",
  pupilColor = "black",
  noseColor = "#000000", // Black nose
  accentColor = "#FF69B4", // For special features (bird beak, pig snout, etc.)
  
  // Size and positioning
  size = 160,
}) {
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [blinkProgress, setBlinkProgress] = useState(0);
  const blinkTimeoutRef = useRef(null);
  const blinkIntervalRef = useRef(null);

  const viewSize = size;
  const centerX = viewSize / 2;
  const centerY = viewSize / 2;
  const headRadius = viewSize * 0.4375; // 70/160 ratio

  // Animal-specific features configuration
  const animalFeatures = {
    bear: {
      ears: { type: 'round', size: 0.15, position: { x: 0.7, y: 0.3 } },
      nose: { type: 'oval', size: { w: 0.09, h: 0.06 } },
      eyeOffset: 0.1875, // 30/160
      mouthY: 0.7,
    },
    cat: {
      ears: { type: 'triangle', size: 0.15, position: { x: 0.65, y: 0.2 } },
      nose: { type: 'triangle', size: { w: 0.05, h: 0.04 } },
      eyeOffset: 0.1875,
      mouthY: 0.72,
      whiskers: true,
    },
    dog: {
      ears: { type: 'floppy', size: 0.18, position: { x: 0.6, y: 0.35 } },
      nose: { type: 'oval', size: { w: 0.08, h: 0.055 } },
      eyeOffset: 0.1875,
      mouthY: 0.7,
      tongue: true,
    },
    bird: {
      ears: { type: 'none' },
      nose: { type: 'beak', size: { w: 0.1, h: 0.08 } },
      eyeOffset: 0.2,
      // mouthY: 0.75,
      crest: true,
    },
    pig: {
      ears: { type: 'triangle', size: 0.12, position: { x: 0.68, y: 0.25 } },
      nose: { type: 'snout', size: { w: 0.12, h: 0.08 } },
      eyeOffset: 0.18,
      mouthY: 0.78,
    },
    horse: {
      ears: { type: 'pointed', size: 0.16, position: { x: 0.65, y: 0.2 } },
      nose: { type: 'large_oval', size: { w: 0.1, h: 0.07 } },
      eyeOffset: 0.19,
      mouthY: 0.72,
      mane: true,
    },
    giraffe: {
      ears: { type: 'round', size: 0.12, position: { x: 0.68, y: 0.28 } },
      nose: { type: 'oval', size: { w: 0.08, h: 0.05 } },
      eyeOffset: 0.2,
      mouthY: 0.7,
      horns: true,
    },
  };

  const features = animalFeatures[animalType] || animalFeatures.bear;

  // Calculate positions
  const leftEyeX = centerX - features.eyeOffset * viewSize;
  const rightEyeX = centerX + features.eyeOffset * viewSize;
  const eyeY = centerY - viewSize * 0.09375; // 15/160
  const noseY = centerY + viewSize * 0.09375; // 15/160
  const mouthY = centerY + viewSize * (features.mouthY - 0.5);

  // Define mouth paths
  const getMouthPaths = () => {
    const mouthWidth = viewSize * 0.125; // 20/160
    const closedPath = `M${centerX - mouthWidth/2} ${mouthY} Q${centerX} ${mouthY + 6} ${centerX + mouthWidth/2} ${mouthY}`;
    const openPath = `M${centerX - mouthWidth/2 - 2} ${mouthY + 3} Q${centerX} ${mouthY + 13} ${centerX + mouthWidth/2 + 2} ${mouthY + 3}`;
    return { closedPath, openPath };
  };

  const { closedPath, openPath } = getMouthPaths();

  const handleClickMascot = () => {
    setIsMouthOpen(!isMouthOpen);
  };

  // Blinking animation (same as before)
  const triggerBlink = useCallback(() => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
    }

    let progress = 0;
    const blinkDuration = 200;
    const frameTime = 16;
    const totalFrames = blinkDuration / frameTime;
    
    const animateBlink = () => {
      progress += 1 / totalFrames;
      
      if (progress <= 0.5) {
        setBlinkProgress(progress * 2);
      } else if (progress <= 1) {
        setBlinkProgress(2 - progress * 2);
      } else {
        setBlinkProgress(0);
        return;
      }
      
      blinkTimeoutRef.current = setTimeout(animateBlink, frameTime);
    };
    
    animateBlink();
  }, []);

  useEffect(() => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }

    const randomInterval = Math.random() * 4000 + 3000;
    blinkIntervalRef.current = setInterval(() => {
      triggerBlink();
    }, randomInterval);

    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [triggerBlink]);

  const eyelidHeight = blinkProgress * 24;

  // Render ears based on type
  const renderEars = () => {
    if (features.ears.type === 'none') return null;
    
    const earSize = features.ears.size * viewSize;
    const leftEarX = centerX - features.ears.position.x * 0.7*headRadius;
    const rightEarX = centerX + features.ears.position.x * 0.7*headRadius;
    const earY = centerY - features.ears.position.y * 3.5*headRadius;

    switch (features.ears.type) {
      case 'round':
        return (
          <>
            <circle cx={leftEarX} cy={earY} r={earSize} fill={earColor} />
            <circle cx={rightEarX} cy={earY} r={earSize} fill={earColor} />
          </>
        );
      
      case 'triangle':
        const triangleSize = earSize * 1.2;
        return (
          <>
            <polygon
              points={`${leftEarX - triangleSize/2},${earY + triangleSize/3} ${leftEarX},${earY - triangleSize} ${leftEarX + triangleSize/2},${earY + triangleSize/3}`}
              fill={earColor}
            />
            <polygon
              points={`${rightEarX - triangleSize/2},${earY + triangleSize/3} ${rightEarX},${earY - triangleSize} ${rightEarX + triangleSize/2},${earY + triangleSize/3}`}
              fill={earColor}
            />
          </>
        );
      
      case 'pointed':
        const pointedSize = earSize * 1.3;
        return (
          <>
            <polygon
              points={`${leftEarX - pointedSize/3},${earY + pointedSize/2} ${leftEarX},${earY - pointedSize} ${leftEarX + pointedSize/3},${earY + pointedSize/2}`}
              fill={earColor}
            />
            <polygon
              points={`${rightEarX - pointedSize/3},${earY + pointedSize/2} ${rightEarX},${earY - pointedSize} ${rightEarX + pointedSize/3},${earY + pointedSize/2}`}
              fill={earColor}
            />
          </>
        );
      
      case 'floppy':
        return (
          <>
            <ellipse cx={leftEarX} cy={earY + earSize/2} rx={earSize * 0.7} ry={earSize} fill={earColor} transform={`rotate(-30 ${leftEarX} ${earY + earSize/2})`} />
            <ellipse cx={rightEarX} cy={earY + earSize/2} rx={earSize * 0.7} ry={earSize} fill={earColor} transform={`rotate(30 ${rightEarX} ${earY + earSize/2})`} />
          </>
        );
      
      default:
        return null;
    }
  };

  // Render nose based on type
  const renderNose = () => {
    const noseW = features.nose.size.w * viewSize;
    const noseH = features.nose.size.h * viewSize;

    switch (features.nose.type) {
      case 'oval':
        return (
          <>
            <ellipse cx={centerX} cy={noseY} rx={noseW} ry={noseH} fill={noseColor} />
            <circle cx={centerX - noseW/3} cy={noseY} r={2} fill="black" />
            <circle cx={centerX + noseW/3} cy={noseY} r={2} fill="black" />
          </>
        );
      
      case 'triangle':
        return (
          <polygon
            points={`${centerX},${noseY - noseH} ${centerX - noseW},${noseY + noseH/2} ${centerX + noseW},${noseY + noseH/2}`}
            fill={noseColor}
          />
        );
      
      case 'beak':
        const beakRotationCenterX = centerX;
        const beakRotationCenterY = noseY;

        return (
          <polygon
            points={`${centerX - 1.5*noseW},${noseY} ${centerX + noseW},${noseY - noseH/1.5} ${centerX + noseW},${noseY + noseH/1.5}`}
            fill={accentColor}
            transform={`rotate(270 ${beakRotationCenterX} ${beakRotationCenterY})`}
          />
        );
      
      case 'snout':
        return (
          <>
            <ellipse cx={centerX} cy={noseY + noseH/2} rx={noseW} ry={noseH} fill={accentColor} />
            <circle cx={centerX - noseW/2} cy={noseY + noseH/4} r={2} fill="black" />
            <circle cx={centerX + noseW/2} cy={noseY + noseH/4} r={2} fill="black" />
          </>
        );
      
      case 'large_oval':
        return (
          <>
            <ellipse cx={centerX} cy={noseY} rx={noseW} ry={noseH} fill={noseColor} />
            <ellipse cx={centerX - noseW/3} cy={noseY - noseH/4} rx={3} ry={2} fill="black" />
            <ellipse cx={centerX + noseW/3} cy={noseY - noseH/4} rx={3} ry={2} fill="black" />
          </>
        );
      
      default:
        return null;
    }
  };

  // Render special features
  const renderSpecialFeatures = () => {
    const elements = [];

    // Whiskers for cats
    if (features.whiskers) {
      const whiskerY = noseY + 5;
      elements.push(
        <g key="whiskers">
          <line x1={centerX - 40} y1={whiskerY - 3} x2={centerX - 20} y2={whiskerY - 3} stroke="black" strokeWidth="1" />
          <line x1={centerX - 40} y1={whiskerY + 3} x2={centerX - 20} y2={whiskerY + 3} stroke="black" strokeWidth="1" />
          <line x1={centerX + 20} y1={whiskerY - 3} x2={centerX + 40} y2={whiskerY - 3} stroke="black" strokeWidth="1" />
          <line x1={centerX + 20} y1={whiskerY + 3} x2={centerX + 40} y2={whiskerY + 3} stroke="black" strokeWidth="1" />
        </g>
      );
    }

    // Tongue for dogs
    if (features.tongue && isMouthOpen) {
      elements.push(
        <ellipse
          key="tongue"
          cx={centerX}
          cy={mouthY + 8}
          rx={6}
          ry={10}
          fill="#FF69B4"
          className="transition-opacity duration-300"
        />
      );
    }

    // Crest for birds
    if (features.crest) {
      elements.push(
        <path
          key="crest"
          d={`M${centerX - 15} ${centerY - headRadius + 5} Q${centerX - 8} ${centerY - headRadius - 15} ${centerX} ${centerY - headRadius + 5} Q${centerX + 8} ${centerY - headRadius - 15} ${centerX + 15} ${centerY - headRadius + 5}`}
          fill={accentColor}
        />
      );
    }

    // Mane for horses
    if (features.mane) {
      elements.push(
        <path
          key="mane"
          d={`M${centerX - 20} ${centerY - headRadius + 10} Q${centerX - 30} ${centerY - headRadius - 10} ${centerX - 15} ${centerY - headRadius + 20} Q${centerX - 5} ${centerY - headRadius - 5} ${centerX} ${centerY - headRadius + 10} Q${centerX + 5} ${centerY - headRadius - 5} ${centerX + 15} ${centerY - headRadius + 20} Q${centerX + 30} ${centerY - headRadius - 10} ${centerX + 20} ${centerY - headRadius + 10}`}
          fill={earColor}
        />
      );
    }

    // Horns for giraffes
    if (features.horns) {
      elements.push(
        <g key="horns">
          <rect x={centerX - 25} y={centerY - headRadius - 5} width={3} height={15} fill={earColor} />
          <rect x={centerX + 22} y={centerY - headRadius - 5} width={3} height={15} fill={earColor} />
          <circle cx={centerX - 23.5} cy={centerY - headRadius - 5} r={3} fill={earColor} />
          <circle cx={centerX + 23.5} cy={centerY - headRadius - 5} r={3} fill={earColor} />
        </g>
      );
    }

    return elements;
  };

  return (
    <>
      <svg
        width={viewSize}
        height={viewSize}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClickMascot}
        style={{ cursor: 'pointer' }}
      >
        {/* Main Body / Head */}
        <circle cx={centerX} cy={centerY} r={headRadius} fill={bodyColor} />

        {/* Ears */}
        {renderEars()}

        {/* Eyes - Base white part */}
        <circle cx={leftEyeX} cy={eyeY} r={12} fill={eyeColor} />
        <circle cx={rightEyeX} cy={eyeY} r={12} fill={eyeColor} />
        
        {/* Pupils */}
        <circle cx={leftEyeX} cy={eyeY + 2} r={6} fill={pupilColor} />
        <circle cx={rightEyeX} cy={eyeY + 2} r={6} fill={pupilColor} />

        {/* Eyelids */}
        <rect
          x={leftEyeX - 12}
          y={eyeY - 12}
          width="24"
          height={eyelidHeight}
          fill={bodyColor}
          rx="12"
        />
        <rect
          x={rightEyeX - 12}
          y={eyeY - 12}
          width="24"
          height={eyelidHeight}
          fill={bodyColor}
          rx="12"
        />

        {/* Nose */}
        {renderNose()}

        {/* Mouth */}
        <path
          d={isMouthOpen ? openPath : closedPath}
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />

        {/* Special Features */}
        {renderSpecialFeatures()}
      </svg>
    </>
  );
}

