import { StretchItem, BodyPart } from '@/types';

export const PRESET_STRETCHES: StretchItem[] = [
  // 肩 (Shoulder)
  {
    id: 'shoulder-roll',
    name: '肩回し',
    bodyPart: 'shoulder',
    defaultDuration: 30,
    description: '両肩を大きく前後に回します',
    emoji: '🔄',
  },
  {
    id: 'shoulder-stretch',
    name: '肩のストレッチ',
    bodyPart: 'shoulder',
    defaultDuration: 45,
    description: '片腕を胸の前で引き寄せます',
    emoji: '💪',
  },
  // 首 (Neck)
  {
    id: 'neck-tilt',
    name: '首の傾け',
    bodyPart: 'neck',
    defaultDuration: 30,
    description: '首をゆっくり左右に傾けます',
    emoji: '🙆',
  },
  {
    id: 'neck-rotation',
    name: '首回し',
    bodyPart: 'neck',
    defaultDuration: 45,
    description: '首をゆっくり回転させます',
    emoji: '🔃',
  },
  // 腰 (Waist)
  {
    id: 'waist-twist',
    name: '腰ひねり',
    bodyPart: 'waist',
    defaultDuration: 60,
    description: '座ったまま上半身をひねります',
    emoji: '🌀',
  },
  {
    id: 'cat-cow',
    name: 'キャットカウ',
    bodyPart: 'waist',
    defaultDuration: 60,
    description: '四つん這いで背中を丸めたり反らしたり',
    emoji: '🐱',
  },
  // 脚 (Legs)
  {
    id: 'hamstring-stretch',
    name: '太もも裏ストレッチ',
    bodyPart: 'legs',
    defaultDuration: 45,
    description: '足を伸ばして前屈します',
    emoji: '🦵',
  },
  {
    id: 'quad-stretch',
    name: '太もも前ストレッチ',
    bodyPart: 'legs',
    defaultDuration: 45,
    description: '片足を後ろに曲げて引き上げます',
    emoji: '🏃',
  },
  {
    id: 'calf-stretch',
    name: 'ふくらはぎストレッチ',
    bodyPart: 'legs',
    defaultDuration: 30,
    description: '壁に手をついてふくらはぎを伸ばします',
    emoji: '🧘',
  },
  // 腕 (Arms)
  {
    id: 'wrist-stretch',
    name: '手首ストレッチ',
    bodyPart: 'arms',
    defaultDuration: 30,
    description: '手首を前後に曲げ伸ばします',
    emoji: '🤲',
  },
  {
    id: 'tricep-stretch',
    name: '上腕三頭筋ストレッチ',
    bodyPart: 'arms',
    defaultDuration: 30,
    description: '腕を頭の後ろで曲げます',
    emoji: '💪',
  },
  // 背中 (Back)
  {
    id: 'child-pose',
    name: 'チャイルドポーズ',
    bodyPart: 'back',
    defaultDuration: 60,
    description: '正座から前に伸びます',
    emoji: '🙇',
  },
  {
    id: 'cobra-stretch',
    name: 'コブラストレッチ',
    bodyPart: 'back',
    defaultDuration: 45,
    description: 'うつ伏せから上半身を起こします',
    emoji: '🐍',
  },
  // 全身 (Full body)
  {
    id: 'full-body-stretch',
    name: '全身伸び',
    bodyPart: 'full',
    defaultDuration: 30,
    description: '両手を上に伸ばして全身を伸ばします',
    emoji: '🙌',
  },
  {
    id: 'side-stretch',
    name: '体側ストレッチ',
    bodyPart: 'full',
    defaultDuration: 45,
    description: '両手を上げて左右に体を倒します',
    emoji: '🌊',
  },
];

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  shoulder: '肩',
  neck: '首',
  waist: '腰',
  legs: '脚',
  arms: '腕',
  back: '背中',
  full: '全身',
};

export const BODY_PART_EMOJIS: Record<BodyPart, string> = {
  shoulder: '💪',
  neck: '🦒',
  waist: '🌀',
  legs: '🦵',
  arms: '🤲',
  back: '🔙',
  full: '🧘',
};

export const getStretchesByBodyPart = (bodyPart: BodyPart): StretchItem[] => {
  return PRESET_STRETCHES.filter((s) => s.bodyPart === bodyPart);
};

export const getStretchById = (id: string): StretchItem | undefined => {
  return PRESET_STRETCHES.find((s) => s.id === id);
};

export const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180];

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}秒`;
  }
  if (secs === 0) {
    return `${mins}分`;
  }
  return `${mins}分${secs}秒`;
};
