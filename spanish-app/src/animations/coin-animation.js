import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedScoreIncrease({ oldAmount, additionalPoints }) {
  // All hooks declared unconditionally at the top
  const [currentAmount, setCurrentAmount] = useState(oldAmount);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameId = useRef(null);
  const startTimeRef = useRef(null);

  const duration = 1500; // ms

  useEffect(() => {
    let isCancelled = false;

    // Reset for new animation
    setCurrentAmount(oldAmount);
    setIsVisible(true);
    startTimeRef.current = null;

    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const progress = Math.min((currentTime - startTimeRef.current) / duration, 1);
      const interpolatedValue = oldAmount + additionalPoints * progress;

      if (!isCancelled) {
        setCurrentAmount(Math.floor(interpolatedValue));
      }

      if (progress < 1 && !isCancelled) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else if (!isCancelled) {
        setCurrentAmount(oldAmount + additionalPoints);
        setTimeout(() => setIsVisible(false), 500);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      setIsVisible(false);
    };
  }, [oldAmount, additionalPoints]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        bg-gradient-to-br from-blue-600 to-purple-700
        text-white font-extrabold text-3xl md:text-5xl
        px-6 py-3 rounded-full shadow-lg
        transition-opacity duration-500 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ minWidth: '150px', textAlign: 'center' }}
    >
      +{additionalPoints} ({currentAmount})
    </div>
  );
}
