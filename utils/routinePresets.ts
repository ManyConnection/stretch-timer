import { StretchSessionItem } from '@/types';
import { getStretchById } from './presets';

export interface PresetRoutine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  items: StretchSessionItem[];
}

// Helper to create session items from stretch IDs
const createSessionItems = (
  stretchIds: { id: string; duration?: number }[]
): StretchSessionItem[] => {
  return stretchIds
    .map(({ id, duration }) => {
      const stretch = getStretchById(id);
      if (!stretch) return null;
      return {
        stretch,
        duration: duration ?? stretch.defaultDuration,
      };
    })
    .filter((item): item is StretchSessionItem => item !== null);
};

export const PRESET_ROUTINES: PresetRoutine[] = [
  {
    id: 'morning',
    name: '朝ストレッチ',
    emoji: '🌅',
    description: '目覚めをスッキリさせる全身ストレッチ',
    items: createSessionItems([
      { id: 'full-body-stretch', duration: 30 },
      { id: 'neck-tilt', duration: 30 },
      { id: 'shoulder-roll', duration: 30 },
      { id: 'side-stretch', duration: 45 },
      { id: 'cat-cow', duration: 60 },
      { id: 'hamstring-stretch', duration: 45 },
    ]),
  },
  {
    id: 'bedtime',
    name: '就寝前ストレッチ',
    emoji: '🌙',
    description: 'リラックスして質の良い睡眠へ',
    items: createSessionItems([
      { id: 'neck-rotation', duration: 45 },
      { id: 'shoulder-stretch', duration: 45 },
      { id: 'child-pose', duration: 60 },
      { id: 'cat-cow', duration: 60 },
      { id: 'hamstring-stretch', duration: 60 },
      { id: 'full-body-stretch', duration: 30 },
    ]),
  },
  {
    id: 'deskwork',
    name: 'デスクワーク休憩',
    emoji: '💻',
    description: '座りっぱなしの疲れを解消',
    items: createSessionItems([
      { id: 'neck-tilt', duration: 30 },
      { id: 'neck-rotation', duration: 30 },
      { id: 'shoulder-roll', duration: 30 },
      { id: 'shoulder-stretch', duration: 30 },
      { id: 'wrist-stretch', duration: 30 },
      { id: 'waist-twist', duration: 45 },
      { id: 'side-stretch', duration: 30 },
    ]),
  },
  {
    id: 'quick-refresh',
    name: 'クイックリフレッシュ',
    emoji: '⚡',
    description: '3分で気分転換',
    items: createSessionItems([
      { id: 'full-body-stretch', duration: 20 },
      { id: 'neck-tilt', duration: 20 },
      { id: 'shoulder-roll', duration: 20 },
      { id: 'waist-twist', duration: 30 },
      { id: 'side-stretch', duration: 30 },
    ]),
  },
  {
    id: 'lower-body',
    name: '下半身ストレッチ',
    emoji: '🦵',
    description: '脚の疲れをほぐす',
    items: createSessionItems([
      { id: 'hamstring-stretch', duration: 60 },
      { id: 'quad-stretch', duration: 60 },
      { id: 'calf-stretch', duration: 45 },
      { id: 'waist-twist', duration: 45 },
    ]),
  },
  {
    id: 'upper-body',
    name: '上半身ストレッチ',
    emoji: '💪',
    description: '肩こり・首こり解消',
    items: createSessionItems([
      { id: 'neck-tilt', duration: 30 },
      { id: 'neck-rotation', duration: 45 },
      { id: 'shoulder-roll', duration: 30 },
      { id: 'shoulder-stretch', duration: 45 },
      { id: 'tricep-stretch', duration: 30 },
      { id: 'wrist-stretch', duration: 30 },
      { id: 'cobra-stretch', duration: 45 },
    ]),
  },
];

export const getPresetRoutineById = (id: string): PresetRoutine | undefined => {
  return PRESET_ROUTINES.find((r) => r.id === id);
};

export const getRoutineDuration = (routine: PresetRoutine): number => {
  return routine.items.reduce((total, item) => total + item.duration, 0);
};

export const formatRoutineDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return `${seconds}秒`;
  return `約${mins}分`;
};
