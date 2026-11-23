import { useEffect, useRef } from 'react';

export function useSwipeAndKeyboard({ onSwipe, onCastNinjutsu }) {
  const touchStartRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const minDistance = 35; // minimum swipe distance in px
      const maxTime = 600; // max duration for a swipe in ms

      if (deltaTime <= maxTime && (Math.abs(deltaX) > minDistance || Math.abs(deltaY) > minDistance)) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            onSwipe('RIGHT');
          } else {
            onSwipe('LEFT');
          }
        } else {
          if (deltaY > 0) {
            onSwipe('DOWN');
          } else {
            onSwipe('UP');
          }
        }
      }
      touchStartRef.current = null;
    };

    // Keyboard support for desktop / dev testing
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onSwipe('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onSwipe('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onSwipe('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onSwipe('RIGHT');
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          onCastNinjutsu?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSwipe, onCastNinjutsu]);
}
