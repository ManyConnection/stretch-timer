import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import {
  speak,
  stopSpeaking,
  vibrate,
  announceTime,
  announceStretchStart,
  announceComplete,
  announceSessionComplete,
} from '@/utils/notifications';

// Mock expo modules
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('speak', () => {
    it('should call Speech.speak with Japanese settings', async () => {
      await speak('テスト', 'ja');

      expect(Speech.speak).toHaveBeenCalledWith('テスト', {
        language: 'ja-JP',
        rate: 0.9,
        pitch: 1.0,
      });
    });

    it('should call Speech.speak with English settings', async () => {
      await speak('Test', 'en');

      expect(Speech.speak).toHaveBeenCalledWith('Test', {
        language: 'en-US',
        rate: 0.9,
        pitch: 1.0,
      });
    });

    it('should default to Japanese', async () => {
      await speak('テスト');

      expect(Speech.speak).toHaveBeenCalledWith('テスト', {
        language: 'ja-JP',
        rate: 0.9,
        pitch: 1.0,
      });
    });

    it('should handle speech errors gracefully', async () => {
      (Speech.speak as jest.Mock).mockRejectedValueOnce(new Error('Speech error'));

      // Should not throw
      await expect(speak('テスト')).resolves.not.toThrow();
    });
  });

  describe('stopSpeaking', () => {
    it('should call Speech.stop', async () => {
      await stopSpeaking();

      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Speech.stop as jest.Mock).mockRejectedValueOnce(new Error('Stop error'));

      await expect(stopSpeaking()).resolves.not.toThrow();
    });
  });

  describe('vibrate', () => {
    it('should call impactAsync with light feedback', async () => {
      await vibrate('light');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should call impactAsync with medium feedback', async () => {
      await vibrate('medium');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should call impactAsync with heavy feedback', async () => {
      await vibrate('heavy');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });

    it('should default to medium', async () => {
      await vibrate();

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should handle errors gracefully', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Haptics error')
      );

      await expect(vibrate()).resolves.not.toThrow();
    });
  });

  describe('announceTime', () => {
    it('should announce at 60 seconds in Japanese', async () => {
      await announceTime(60, true, false, 'ja');

      expect(Speech.speak).toHaveBeenCalledWith(
        '残り1分',
        expect.any(Object)
      );
    });

    it('should announce at 30 seconds in Japanese', async () => {
      await announceTime(30, true, false, 'ja');

      expect(Speech.speak).toHaveBeenCalledWith(
        '残り30秒',
        expect.any(Object)
      );
    });

    it('should announce at 10 seconds in English', async () => {
      await announceTime(10, true, false, 'en');

      expect(Speech.speak).toHaveBeenCalledWith(
        '10 seconds left',
        expect.any(Object)
      );
    });

    it('should not announce at non-interval times', async () => {
      await announceTime(45, true, false);

      expect(Speech.speak).not.toHaveBeenCalled();
    });

    it('should vibrate heavy at 3 seconds or less', async () => {
      await announceTime(3, false, true);

      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });

    it('should vibrate medium at 10 seconds', async () => {
      await announceTime(10, false, true);

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should vibrate light at 60 seconds', async () => {
      await announceTime(60, false, true);

      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should not vibrate if useVibration is false', async () => {
      await announceTime(60, false, false);

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should not speak if useSpeech is false', async () => {
      await announceTime(60, false, true);

      expect(Speech.speak).not.toHaveBeenCalled();
    });
  });

  describe('announceStretchStart', () => {
    it('should announce stretch start in Japanese', async () => {
      await announceStretchStart('肩回し', 30, true, false, 'ja');

      expect(Speech.speak).toHaveBeenCalledWith(
        '肩回しを30秒間行います',
        expect.any(Object)
      );
    });

    it('should announce stretch start in English', async () => {
      await announceStretchStart('Shoulder Roll', 30, true, false, 'en');

      expect(Speech.speak).toHaveBeenCalledWith(
        'Shoulder Roll for 30 seconds',
        expect.any(Object)
      );
    });

    it('should vibrate success on start', async () => {
      await announceStretchStart('肩回し', 30, false, true);

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });
  });

  describe('announceComplete', () => {
    it('should announce completion in Japanese', async () => {
      await announceComplete(true, false, 'ja');

      expect(Speech.speak).toHaveBeenCalledWith(
        '完了です！',
        expect.any(Object)
      );
    });

    it('should announce completion in English', async () => {
      await announceComplete(true, false, 'en');

      expect(Speech.speak).toHaveBeenCalledWith(
        'Complete!',
        expect.any(Object)
      );
    });
  });

  describe('announceSessionComplete', () => {
    it('should announce session completion in Japanese', async () => {
      await announceSessionComplete(true, false, 'ja');

      expect(Speech.speak).toHaveBeenCalledWith(
        'ストレッチセッション完了です！お疲れ様でした！',
        expect.any(Object)
      );
    });

    it('should announce session completion in English', async () => {
      await announceSessionComplete(true, false, 'en');

      expect(Speech.speak).toHaveBeenCalledWith(
        'Stretch session complete! Great job!',
        expect.any(Object)
      );
    });
  });
});
