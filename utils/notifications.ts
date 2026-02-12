import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export const speak = async (text: string, language: 'ja' | 'en' = 'ja'): Promise<void> => {
  try {
    await Speech.speak(text, {
      language: language === 'ja' ? 'ja-JP' : 'en-US',
      rate: 0.9,
      pitch: 1.0,
    });
  } catch (error) {
    console.error('Speech error:', error);
  }
};

export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Stop speech error:', error);
  }
};

export const vibrate = async (type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch (error) {
    console.error('Vibration error:', error);
  }
};

export const notifySuccess = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

export const notifyWarning = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

export const announceTime = async (
  seconds: number,
  useSpeech: boolean,
  useVibration: boolean,
  language: 'ja' | 'en' = 'ja'
): Promise<void> => {
  // Announce at specific intervals
  const shouldAnnounce = [60, 30, 10, 5, 4, 3, 2, 1].includes(seconds);
  
  if (!shouldAnnounce) return;

  if (useVibration) {
    if (seconds <= 3) {
      await vibrate('heavy');
    } else if (seconds <= 10) {
      await vibrate('medium');
    } else {
      await vibrate('light');
    }
  }

  if (useSpeech) {
    let message: string;
    if (language === 'ja') {
      if (seconds >= 60) {
        message = `残り${Math.floor(seconds / 60)}分`;
      } else {
        message = `残り${seconds}秒`;
      }
    } else {
      if (seconds >= 60) {
        message = `${Math.floor(seconds / 60)} minute${seconds >= 120 ? 's' : ''} left`;
      } else {
        message = `${seconds} second${seconds !== 1 ? 's' : ''} left`;
      }
    }
    await speak(message, language);
  }
};

export const announceStretchStart = async (
  stretchName: string,
  duration: number,
  useSpeech: boolean,
  useVibration: boolean,
  language: 'ja' | 'en' = 'ja'
): Promise<void> => {
  if (useVibration) {
    await notifySuccess();
  }

  if (useSpeech) {
    const durationText = language === 'ja'
      ? `${duration}秒`
      : `${duration} seconds`;
    const message = language === 'ja'
      ? `${stretchName}を${durationText}間行います`
      : `${stretchName} for ${durationText}`;
    await speak(message, language);
  }
};

export const announceComplete = async (
  useSpeech: boolean,
  useVibration: boolean,
  language: 'ja' | 'en' = 'ja'
): Promise<void> => {
  if (useVibration) {
    await notifySuccess();
  }

  if (useSpeech) {
    const message = language === 'ja' ? '完了です！' : 'Complete!';
    await speak(message, language);
  }
};

export const announceSessionComplete = async (
  useSpeech: boolean,
  useVibration: boolean,
  language: 'ja' | 'en' = 'ja'
): Promise<void> => {
  if (useVibration) {
    await notifySuccess();
    setTimeout(() => notifySuccess(), 300);
  }

  if (useSpeech) {
    const message = language === 'ja'
      ? 'ストレッチセッション完了です！お疲れ様でした！'
      : 'Stretch session complete! Great job!';
    await speak(message, language);
  }
};
