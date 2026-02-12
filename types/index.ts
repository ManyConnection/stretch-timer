export interface StretchItem {
  id: string;
  name: string;
  bodyPart: BodyPart;
  defaultDuration: number; // seconds
  description: string;
  emoji: string;
}

export type BodyPart = 'shoulder' | 'neck' | 'waist' | 'legs' | 'arms' | 'back' | 'full';

export interface StretchSession {
  items: StretchSessionItem[];
  currentIndex: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface StretchSessionItem {
  stretch: StretchItem;
  duration: number; // customized duration in seconds
}

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface UserPreferences {
  useSpeech: boolean;
  useVibration: boolean;
  defaultDuration: number;
  speechLanguage: 'ja' | 'en';
}

export interface SavedRoutine {
  id: string;
  name: string;
  items: StretchSessionItem[];
  createdAt: number;
}
