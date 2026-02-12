import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionRecord {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  routineName: string;
  routineId?: string;
  totalPoses: number;
  completedPoses: number;
  totalDuration: number; // seconds
  actualDuration: number; // seconds
}

export interface HistoryStats {
  totalSessions: number;
  totalDuration: number; // seconds
  consecutiveDays: number;
  longestStreak: number;
  lastSessionDate: string | null;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

const STORAGE_KEYS = {
  HISTORY: '@stretch_timer_history',
  STATS: '@stretch_timer_stats',
} as const;

// Get current date in YYYY-MM-DD format
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Get date from N days ago
export const getDateNDaysAgo = (n: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return getDateString(date);
};

// Parse date string to Date object (in local timezone)
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Calculate consecutive days from history records
export const calculateConsecutiveDays = (records: SessionRecord[]): number => {
  if (records.length === 0) return 0;

  // Get unique dates sorted descending
  const uniqueDates = [...new Set(records.map((r) => r.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (uniqueDates.length === 0) return 0;

  const today = getDateString();
  const yesterday = getDateNDaysAgo(1);

  // Check if the most recent session is today or yesterday
  const mostRecentDate = uniqueDates[0];
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = parseDate(mostRecentDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = parseDate(uniqueDates[i]);
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

// Calculate longest streak from history records
export const calculateLongestStreak = (records: SessionRecord[]): number => {
  if (records.length === 0) return 0;

  const uniqueDates = [...new Set(records.map((r) => r.date))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (uniqueDates.length === 0) return 0;
  if (uniqueDates.length === 1) return 1;

  let maxStreak = 1;
  let currentStreak = 1;
  let prevDate = parseDate(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = parseDate(uniqueDates[i]);
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
    prevDate = currentDate;
  }

  return maxStreak;
};

// Count sessions in date range
export const countSessionsInRange = (
  records: SessionRecord[],
  startDate: string,
  endDate: string
): number => {
  return records.filter((r) => r.date >= startDate && r.date <= endDate).length;
};

// Get start of current week (Monday)
export const getWeekStartDate = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday is start of week
  date.setDate(date.getDate() - diff);
  return getDateString(date);
};

// Get start of current month
export const getMonthStartDate = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
};

// Save a session record
export const saveSessionRecord = async (
  record: Omit<SessionRecord, 'id' | 'date' | 'timestamp'>
): Promise<SessionRecord> => {
  try {
    const history = await loadHistory();
    const newRecord: SessionRecord = {
      ...record,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: getDateString(),
      timestamp: Date.now(),
    };

    history.push(newRecord);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    return newRecord;
  } catch (error) {
    console.error('Failed to save session record:', error);
    throw new Error('セッションの保存に失敗しました');
  }
};

// Load all history records
export const loadHistory = async (): Promise<SessionRecord[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

// Get history records for a specific date range
export const getHistoryInRange = async (
  startDate: string,
  endDate: string
): Promise<SessionRecord[]> => {
  const history = await loadHistory();
  return history.filter((r) => r.date >= startDate && r.date <= endDate);
};

// Get sessions for today
export const getTodaySessions = async (): Promise<SessionRecord[]> => {
  const today = getDateString();
  return getHistoryInRange(today, today);
};

// Get sessions for this week
export const getThisWeekSessions = async (): Promise<SessionRecord[]> => {
  const start = getWeekStartDate();
  const end = getDateString();
  return getHistoryInRange(start, end);
};

// Calculate stats from history
export const calculateStats = async (): Promise<HistoryStats> => {
  const history = await loadHistory();
  const today = getDateString();
  const weekStart = getWeekStartDate();
  const monthStart = getMonthStartDate();

  const totalDuration = history.reduce((sum, r) => sum + r.actualDuration, 0);
  const lastSession = history.length > 0 
    ? history.sort((a, b) => b.timestamp - a.timestamp)[0]
    : null;

  return {
    totalSessions: history.length,
    totalDuration,
    consecutiveDays: calculateConsecutiveDays(history),
    longestStreak: calculateLongestStreak(history),
    lastSessionDate: lastSession?.date ?? null,
    sessionsThisWeek: countSessionsInRange(history, weekStart, today),
    sessionsThisMonth: countSessionsInRange(history, monthStart, today),
  };
};

// Delete a specific session record
export const deleteSessionRecord = async (recordId: string): Promise<void> => {
  try {
    const history = await loadHistory();
    const filtered = history.filter((r) => r.id !== recordId);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete session record:', error);
    throw new Error('セッションの削除に失敗しました');
  }
};

// Clear all history
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Failed to clear history:', error);
    throw new Error('履歴のクリアに失敗しました');
  }
};

// Format duration for display
export const formatDurationDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
};

// Get history grouped by date
export const getHistoryGroupedByDate = async (): Promise<
  Map<string, SessionRecord[]>
> => {
  const history = await loadHistory();
  const grouped = new Map<string, SessionRecord[]>();

  // Sort by timestamp descending
  const sorted = history.sort((a, b) => b.timestamp - a.timestamp);

  for (const record of sorted) {
    const existing = grouped.get(record.date) ?? [];
    existing.push(record);
    grouped.set(record.date, existing);
  }

  return grouped;
};

// Format date for display
export const formatDateDisplay = (dateString: string): string => {
  const date = parseDate(dateString);
  const today = getDateString();
  const yesterday = getDateNDaysAgo(1);

  if (dateString === today) return '今日';
  if (dateString === yesterday) return '昨日';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];

  return `${month}月${day}日 (${weekday})`;
};
