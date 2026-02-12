import { renderHook, act } from '@testing-library/react-native';
import { useStretchSession } from '@/hooks/useStretchSession';
import { StretchSessionItem, UserPreferences, StretchItem } from '@/types';
import * as notifications from '@/utils/notifications';

// Mock notifications
jest.mock('@/utils/notifications', () => ({
  announceTime: jest.fn(),
  announceStretchStart: jest.fn(),
  announceComplete: jest.fn(),
  announceSessionComplete: jest.fn(),
  stopSpeaking: jest.fn(),
}));

describe('useStretchSession', () => {
  const mockStretch1: StretchItem = {
    id: 'stretch-1',
    name: 'テストストレッチ1',
    bodyPart: 'shoulder',
    defaultDuration: 30,
    description: 'テスト説明1',
    emoji: '🏋️',
  };

  const mockStretch2: StretchItem = {
    id: 'stretch-2',
    name: 'テストストレッチ2',
    bodyPart: 'neck',
    defaultDuration: 45,
    description: 'テスト説明2',
    emoji: '🧘',
  };

  const mockStretch3: StretchItem = {
    id: 'stretch-3',
    name: 'テストストレッチ3',
    bodyPart: 'waist',
    defaultDuration: 60,
    description: 'テスト説明3',
    emoji: '🌀',
  };

  const mockItems: StretchSessionItem[] = [
    { stretch: mockStretch1, duration: 30 },
    { stretch: mockStretch2, duration: 45 },
    { stretch: mockStretch3, duration: 60 },
  ];

  const mockPreferences: UserPreferences = {
    useSpeech: true,
    useVibration: true,
    defaultDuration: 45,
    speechLanguage: 'ja',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentItem).toEqual(mockItems[0]);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isSessionComplete).toBe(false);
      expect(result.current.totalItems).toBe(3);
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: [],
          preferences: mockPreferences,
        })
      );

      expect(result.current.currentItem).toBeNull();
      expect(result.current.totalItems).toBe(0);
    });

    it('should use first item duration for remaining seconds', () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      expect(result.current.remainingSeconds).toBe(30);
    });

    it('should use default duration from preferences when no items', () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: [],
          preferences: { ...mockPreferences, defaultDuration: 60 },
        })
      );

      expect(result.current.remainingSeconds).toBe(60);
    });
  });

  describe('start', () => {
    it('should start the session', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.currentIndex).toBe(0);
    });

    it('should call announceStretchStart on start', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(notifications.announceStretchStart).toHaveBeenCalledWith(
        mockStretch1.name,
        30,
        true,
        true,
        'ja'
      );
    });

    it('should not start if items array is empty', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: [],
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('pause and resume', () => {
    it('should pause the session', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);
    });

    it('should call stopSpeaking on pause', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.pause();
      });

      expect(notifications.stopSpeaking).toHaveBeenCalled();
    });

    it('should resume the session', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.pause();
      });

      await act(async () => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('skip', () => {
    it('should skip to next item', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentItem).toEqual(mockItems[1]);
    });

    it('should call stopSpeaking on skip', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      expect(notifications.stopSpeaking).toHaveBeenCalled();
    });

    it('should complete session when skipping last item', async () => {
      const singleItem: StretchSessionItem[] = [
        { stretch: mockStretch1, duration: 30 },
      ];

      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useStretchSession({
          items: singleItem,
          preferences: mockPreferences,
          onSessionComplete: onComplete,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      expect(result.current.isSessionComplete).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    it('should restart the session', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      await act(async () => {
        result.current.restart();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isSessionComplete).toBe(false);
      expect(result.current.isRunning).toBe(false);
    });

    it('should call stopSpeaking on restart', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.restart();
      });

      expect(notifications.stopSpeaking).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the session', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentIndex).toBe(0);
    });

    it('should reset to initial state on stop', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      await act(async () => {
        result.current.stop();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.remainingSeconds).toBe(30);
    });
  });

  describe('session completion', () => {
    it('should have correct totalItems', () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      expect(result.current.totalItems).toBe(3);
    });

    it('should track currentItem correctly', async () => {
      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: mockPreferences,
        })
      );

      expect(result.current.currentItem).toEqual(mockItems[0]);

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      expect(result.current.currentItem).toEqual(mockItems[1]);
    });
  });

  describe('callback handling', () => {
    it('should call onSessionComplete callback', async () => {
      const onComplete = jest.fn();
      const singleItem: StretchSessionItem[] = [
        { stretch: mockStretch1, duration: 30 },
      ];

      const { result } = renderHook(() =>
        useStretchSession({
          items: singleItem,
          preferences: mockPreferences,
          onSessionComplete: onComplete,
        })
      );

      await act(async () => {
        result.current.start();
      });

      await act(async () => {
        result.current.skip();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('preference handling', () => {
    it('should use speech preference', async () => {
      const noSpeechPrefs: UserPreferences = {
        ...mockPreferences,
        useSpeech: false,
      };

      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: noSpeechPrefs,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(notifications.announceStretchStart).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        false, // useSpeech
        expect.anything(),
        expect.anything()
      );
    });

    it('should use vibration preference', async () => {
      const noVibrationPrefs: UserPreferences = {
        ...mockPreferences,
        useVibration: false,
      };

      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: noVibrationPrefs,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(notifications.announceStretchStart).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        false, // useVibration
        expect.anything()
      );
    });

    it('should use English speech language', async () => {
      const englishPrefs: UserPreferences = {
        ...mockPreferences,
        speechLanguage: 'en',
      };

      const { result } = renderHook(() =>
        useStretchSession({
          items: mockItems,
          preferences: englishPrefs,
        })
      );

      await act(async () => {
        result.current.start();
      });

      expect(notifications.announceStretchStart).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'en' // speechLanguage
      );
    });
  });
});
