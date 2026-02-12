import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState } from '@/types';

interface UseTimerOptions {
  initialSeconds: number;
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

interface UseTimerReturn extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newDuration?: number) => void;
  setDuration: (seconds: number) => void;
}

export const useTimer = ({
  initialSeconds,
  onTick,
  onComplete,
}: UseTimerOptions): UseTimerReturn => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  // Update refs when callbacks change
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        
        if (next <= 0) {
          clearTimer();
          setIsRunning(false);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }

        if (onTickRef.current) {
          onTickRef.current(next);
        }

        return next;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    
    setIsPaused(false);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        
        if (next <= 0) {
          clearTimer();
          setIsRunning(false);
          setIsPaused(false);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }

        if (onTickRef.current) {
          onTickRef.current(next);
        }

        return next;
      });
    }, 1000);
  }, [isPaused, clearTimer]);

  const reset = useCallback((newDuration?: number) => {
    clearTimer();
    setRemainingSeconds(newDuration ?? initialSeconds);
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer, initialSeconds]);

  const setDuration = useCallback((seconds: number) => {
    setRemainingSeconds(seconds);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    remainingSeconds,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    setDuration,
  };
};
