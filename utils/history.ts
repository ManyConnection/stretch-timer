import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@stretch_timer_history';

export interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  stretchCount: number;
  completedAt: string;
}

export interface HistoryStats {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  totalStretches: number;
  currentStreak: number;
  longestStreak: number;
}

export const loadHistory = async (): Promise<SessionRecord[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const saveHistory = async (history: SessionRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
    throw new Error('履歴の保存に失敗しました');
  }
};

export const addSessionRecord = async (record: SessionRecord): Promise<void> => {
  try {
    const history = await loadHistory();
    history.unshift(record);
    await saveHistory(history);
  } catch (error) {
    console.error('Failed to add session record:', error);
    throw new Error('セッション記録の追加に失敗しました');
  }
};

export const deleteSessionRecord = async (recordId: string): Promise<void> => {
  try {
    const history = await loadHistory();
    const filtered = history.filter((r) => r.id !== recordId);
    await saveHistory(filtered);
  } catch (error) {
    console.error('Failed to delete session record:', error);
    throw new Error('セッション記録の削除に失敗しました');
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
    throw new Error('履歴のクリアに失敗しました');
  }
};

export const calculateStats = (history: SessionRecord[]): HistoryStats => {
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalStretches: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const totalSessions = history.length;
  const totalDuration = history.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = Math.round(totalDuration / totalSessions);
  const totalStretches = history.reduce((sum, r) => sum + r.stretchCount, 0);

  // Calculate streaks
  const dates = [...new Set(history.map((r) => r.date))].sort().reverse();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const prevDate = i > 0 ? dates[i - 1] : today;
    const dayDiff = Math.floor(
      (new Date(prevDate).getTime() - new Date(date).getTime()) / 86400000
    );

    if (i === 0 && (date === today || date === yesterday)) {
      tempStreak = 1;
      currentStreak = 1;
    } else if (dayDiff === 1) {
      tempStreak++;
      if (i < dates.length && (dates[0] === today || dates[0] === yesterday)) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    totalSessions,
    totalDuration,
    averageDuration,
    totalStretches,
    currentStreak,
    longestStreak,
  };
};

export const formatDurationDisplay = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分`;
  }
  return `${secs}秒`;
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day} (${weekday})`;
};
