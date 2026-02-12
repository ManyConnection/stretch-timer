import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePreferences,
  loadPreferences,
  saveRoutines,
  loadRoutines,
  addRoutine,
  deleteRoutine,
  clearAllData,
} from '@/utils/storage';
import { UserPreferences, SavedRoutine } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preferences', () => {
    const testPreferences: UserPreferences = {
      useSpeech: true,
      useVibration: false,
      defaultDuration: 60,
      speechLanguage: 'ja',
    };

    describe('savePreferences', () => {
      it('should save preferences to AsyncStorage', async () => {
        await savePreferences(testPreferences);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@stretch_timer_preferences',
          JSON.stringify(testPreferences)
        );
      });

      it('should throw error when save fails', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        await expect(savePreferences(testPreferences)).rejects.toThrow(
          '設定の保存に失敗しました'
        );
      });
    });

    describe('loadPreferences', () => {
      it('should load preferences from AsyncStorage', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          JSON.stringify(testPreferences)
        );

        const result = await loadPreferences();

        expect(AsyncStorage.getItem).toHaveBeenCalledWith(
          '@stretch_timer_preferences'
        );
        expect(result).toEqual(testPreferences);
      });

      it('should return default preferences when no data exists', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

        const result = await loadPreferences();

        expect(result).toEqual({
          useSpeech: true,
          useVibration: true,
          defaultDuration: 45,
          speechLanguage: 'ja',
        });
      });

      it('should return default preferences when load fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        const result = await loadPreferences();

        expect(result).toEqual({
          useSpeech: true,
          useVibration: true,
          defaultDuration: 45,
          speechLanguage: 'ja',
        });
      });

      it('should merge partial preferences with defaults', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          JSON.stringify({ useSpeech: false })
        );

        const result = await loadPreferences();

        expect(result).toEqual({
          useSpeech: false,
          useVibration: true,
          defaultDuration: 45,
          speechLanguage: 'ja',
        });
      });
    });
  });

  describe('routines', () => {
    const testRoutine: SavedRoutine = {
      id: '1',
      name: 'Test Routine',
      items: [
        {
          stretch: {
            id: 'shoulder-roll',
            name: '肩回し',
            bodyPart: 'shoulder',
            defaultDuration: 30,
            description: 'Test',
            emoji: '🔄',
          },
          duration: 30,
        },
      ],
      createdAt: Date.now(),
    };

    describe('saveRoutines', () => {
      it('should save routines to AsyncStorage', async () => {
        const routines = [testRoutine];
        await saveRoutines(routines);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@stretch_timer_routines',
          JSON.stringify(routines)
        );
      });

      it('should throw error when save fails', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        await expect(saveRoutines([testRoutine])).rejects.toThrow(
          'ルーティンの保存に失敗しました'
        );
      });
    });

    describe('loadRoutines', () => {
      it('should load routines from AsyncStorage', async () => {
        const routines = [testRoutine];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          JSON.stringify(routines)
        );

        const result = await loadRoutines();

        expect(AsyncStorage.getItem).toHaveBeenCalledWith(
          '@stretch_timer_routines'
        );
        expect(result).toEqual(routines);
      });

      it('should return empty array when no data exists', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

        const result = await loadRoutines();

        expect(result).toEqual([]);
      });

      it('should return empty array when load fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        const result = await loadRoutines();

        expect(result).toEqual([]);
      });
    });

    describe('addRoutine', () => {
      it('should add routine to existing routines', async () => {
        const existingRoutines = [testRoutine];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          JSON.stringify(existingRoutines)
        );

        const newRoutine: SavedRoutine = {
          ...testRoutine,
          id: '2',
          name: 'New Routine',
        };

        await addRoutine(newRoutine);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@stretch_timer_routines',
          JSON.stringify([testRoutine, newRoutine])
        );
      });

      it('should throw error when add fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        await expect(addRoutine(testRoutine)).rejects.toThrow(
          'ルーティンの追加に失敗しました'
        );
      });
    });

    describe('deleteRoutine', () => {
      it('should delete routine by id', async () => {
        const routines = [
          testRoutine,
          { ...testRoutine, id: '2', name: 'Routine 2' },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          JSON.stringify(routines)
        );

        await deleteRoutine('1');

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@stretch_timer_routines',
          JSON.stringify([{ ...testRoutine, id: '2', name: 'Routine 2' }])
        );
      });

      it('should throw error when delete fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        await expect(deleteRoutine('1')).rejects.toThrow(
          'ルーティンの削除に失敗しました'
        );
      });
    });

    describe('clearAllData', () => {
      it('should clear all storage keys', async () => {
        await clearAllData();

        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
          '@stretch_timer_preferences',
          '@stretch_timer_routines',
        ]);
      });

      it('should throw error when clear fails', async () => {
        (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(
          new Error('Storage error')
        );

        await expect(clearAllData()).rejects.toThrow(
          'データのクリアに失敗しました'
        );
      });
    });
  });
});
