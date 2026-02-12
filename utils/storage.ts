import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, SavedRoutine } from '@/types';

const STORAGE_KEYS = {
  PREFERENCES: '@stretch_timer_preferences',
  ROUTINES: '@stretch_timer_routines',
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  useSpeech: true,
  useVibration: true,
  defaultDuration: 45,
  speechLanguage: 'ja',
};

export const savePreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
    throw new Error('設定の保存に失敗しました');
  }
};

export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (json) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(json) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const saveRoutines = async (routines: SavedRoutine[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (error) {
    console.error('Failed to save routines:', error);
    throw new Error('ルーティンの保存に失敗しました');
  }
};

export const loadRoutines = async (): Promise<SavedRoutine[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error('Failed to load routines:', error);
    return [];
  }
};

export const addRoutine = async (routine: SavedRoutine): Promise<void> => {
  try {
    const routines = await loadRoutines();
    routines.push(routine);
    await saveRoutines(routines);
  } catch (error) {
    console.error('Failed to add routine:', error);
    throw new Error('ルーティンの追加に失敗しました');
  }
};

export const deleteRoutine = async (routineId: string): Promise<void> => {
  try {
    const routines = await loadRoutines();
    const filtered = routines.filter((r) => r.id !== routineId);
    await saveRoutines(filtered);
  } catch (error) {
    console.error('Failed to delete routine:', error);
    throw new Error('ルーティンの削除に失敗しました');
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.PREFERENCES, STORAGE_KEYS.ROUTINES]);
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw new Error('データのクリアに失敗しました');
  }
};
