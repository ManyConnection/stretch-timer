import { useState, useCallback, useRef, useEffect } from 'react';
import { StretchSessionItem, UserPreferences } from '@/types';
import { useTimer } from './useTimer';
import {
  announceTime,
  announceStretchStart,
  announceComplete,
  announceSessionComplete,
  stopSpeaking,
} from '@/utils/notifications';

interface UseStretchSessionOptions {
  items: StretchSessionItem[];
  preferences: UserPreferences;
  onSessionComplete?: () => void;
}

interface UseStretchSessionReturn {
  currentIndex: number;
  currentItem: StretchSessionItem | null;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isSessionComplete: boolean;
  totalItems: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  restart: () => void;
  stop: () => void;
}

export const useStretchSession = ({
  items,
  preferences,
  onSessionComplete,
}: UseStretchSessionOptions): UseStretchSessionReturn => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const preferencesRef = useRef(preferences);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  const currentItem = items[currentIndex] ?? null;
  const initialDuration = currentItem?.duration ?? preferences.defaultDuration;

  const handleTick = useCallback(async (remaining: number) => {
    const { useSpeech, useVibration, speechLanguage } = preferencesRef.current;
    await announceTime(remaining, useSpeech, useVibration, speechLanguage);
  }, []);

  const handleComplete = useCallback(async () => {
    const { useSpeech, useVibration, speechLanguage } = preferencesRef.current;
    
    // Check if there are more items
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= items.length) {
      // Session complete
      setIsSessionComplete(true);
      await announceSessionComplete(useSpeech, useVibration, speechLanguage);
      if (onSessionCompleteRef.current) {
        onSessionCompleteRef.current();
      }
    } else {
      // Move to next item
      await announceComplete(useSpeech, useVibration, speechLanguage);
      
      // Small delay before starting next
      setTimeout(async () => {
        setCurrentIndex(nextIndex);
        const nextItem = items[nextIndex];
        
        if (nextItem) {
          await announceStretchStart(
            nextItem.stretch.name,
            nextItem.duration,
            useSpeech,
            useVibration,
            speechLanguage
          );
        }
      }, 1500);
    }
  }, [currentIndex, items]);

  const timer = useTimer({
    initialSeconds: initialDuration,
    onTick: handleTick,
    onComplete: handleComplete,
  });

  // Update timer when currentIndex changes
  useEffect(() => {
    if (hasStarted && currentItem && !isSessionComplete) {
      timer.reset(currentItem.duration);
      timer.start();
    }
  }, [currentIndex, hasStarted, isSessionComplete]);

  const start = useCallback(async () => {
    if (items.length === 0) return;

    setHasStarted(true);
    setCurrentIndex(0);
    setIsSessionComplete(false);

    const { useSpeech, useVibration, speechLanguage } = preferencesRef.current;
    const firstItem = items[0];

    if (firstItem) {
      await announceStretchStart(
        firstItem.stretch.name,
        firstItem.duration,
        useSpeech,
        useVibration,
        speechLanguage
      );
      timer.reset(firstItem.duration);
      timer.start();
    }
  }, [items, timer]);

  const pause = useCallback(() => {
    timer.pause();
    stopSpeaking();
  }, [timer]);

  const resume = useCallback(() => {
    timer.resume();
  }, [timer]);

  const skip = useCallback(async () => {
    stopSpeaking();
    
    const nextIndex = currentIndex + 1;
    if (nextIndex >= items.length) {
      const { useSpeech, useVibration, speechLanguage } = preferencesRef.current;
      setIsSessionComplete(true);
      timer.pause();
      await announceSessionComplete(useSpeech, useVibration, speechLanguage);
      if (onSessionCompleteRef.current) {
        onSessionCompleteRef.current();
      }
    } else {
      setCurrentIndex(nextIndex);
      const nextItem = items[nextIndex];
      if (nextItem) {
        const { useSpeech, useVibration, speechLanguage } = preferencesRef.current;
        await announceStretchStart(
          nextItem.stretch.name,
          nextItem.duration,
          useSpeech,
          useVibration,
          speechLanguage
        );
        timer.reset(nextItem.duration);
        timer.start();
      }
    }
  }, [currentIndex, items, timer]);

  const restart = useCallback(() => {
    stopSpeaking();
    setCurrentIndex(0);
    setIsSessionComplete(false);
    setHasStarted(false);
    timer.reset(items[0]?.duration ?? preferences.defaultDuration);
  }, [items, preferences.defaultDuration, timer]);

  const stop = useCallback(() => {
    stopSpeaking();
    timer.pause();
    setHasStarted(false);
    setCurrentIndex(0);
    setIsSessionComplete(false);
    timer.reset(items[0]?.duration ?? preferences.defaultDuration);
  }, [items, preferences.defaultDuration, timer]);

  return {
    currentIndex,
    currentItem,
    remainingSeconds: timer.remainingSeconds,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    isSessionComplete,
    totalItems: items.length,
    start,
    pause,
    resume,
    skip,
    restart,
    stop,
  };
};
