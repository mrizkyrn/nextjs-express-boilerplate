import { useEffect, useState } from 'react';

interface UseCooldownOptions {
  key: string;
  duration: number; // in milliseconds
}

interface UseCooldownReturn {
  timeLeft: number;
  isActive: boolean;
  start: () => void;
  reset: () => void;
  formatTime: (ms: number) => string;
}

/**
 * Custom hook for managing cooldown timers with localStorage persistence
 * @param key - Unique key for localStorage
 * @param duration - Cooldown duration in milliseconds
 * @returns Object with cooldown state and helper functions
 */
export function useCooldown({ key, duration }: UseCooldownOptions): UseCooldownReturn {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkCooldown = () => {
      const lastTimestamp = localStorage.getItem(key);
      if (lastTimestamp) {
        const timeSince = Date.now() - parseInt(lastTimestamp, 10);
        const remaining = Math.max(0, duration - timeSince);
        setTimeLeft(remaining);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [key, duration]);

  const start = () => {
    localStorage.setItem(key, Date.now().toString());
    setTimeLeft(duration);
  };

  const reset = () => {
    localStorage.removeItem(key);
    setTimeLeft(0);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive: timeLeft > 0,
    start,
    reset,
    formatTime,
  };
}
