import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  loadHistory,
  calculateStats,
  deleteSessionRecord,
  clearHistory,
  formatDurationDisplay,
  formatDateDisplay,
  SessionRecord,
  HistoryStats,
} from '@/utils/history';
import { Button } from '@/components';

export default function HistoryScreen() {
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [groupedHistory, setGroupedHistory] = useState<Map<string, SessionRecord[]>>(
    new Map()
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [loadedHistory, loadedStats] = await Promise.all([
        loadHistory(),
        calculateStats(),
      ]);
      setHistory(loadedHistory);
      setStats(loadedStats);

      // Group by date
      const grouped = new Map<string, SessionRecord[]>();
      const sorted = [...loadedHistory].sort((a, b) => b.timestamp - a.timestamp);
      for (const record of sorted) {
        const existing = grouped.get(record.date) ?? [];
        existing.push(record);
        grouped.set(record.date, existing);
      }
      setGroupedHistory(grouped);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleDeleteRecord = (record: SessionRecord) => {
    Alert.alert(
      '記録を削除',
      `「${record.routineName}」の記録を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteSessionRecord(record.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '履歴をクリア',
      'すべての履歴を削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            loadData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Overview */}
        <View style={styles.statsCard} testID="stats-overview">
          <Text style={styles.statsTitle}>実績</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue} testID="consecutive-days">
                {stats?.consecutiveDays ?? 0}
              </Text>
              <Text style={styles.statLabel}>連続日数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue} testID="longest-streak">
                {stats?.longestStreak ?? 0}
              </Text>
              <Text style={styles.statLabel}>最長連続</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue} testID="total-sessions">
                {stats?.totalSessions ?? 0}
              </Text>
              <Text style={styles.statLabel}>総セッション</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItemWide}>
              <Text style={styles.statValueSmall}>
                {stats?.sessionsThisWeek ?? 0}回
              </Text>
              <Text style={styles.statLabel}>今週</Text>
            </View>
            <View style={styles.statItemWide}>
              <Text style={styles.statValueSmall}>
                {stats?.sessionsThisMonth ?? 0}回
              </Text>
              <Text style={styles.statLabel}>今月</Text>
            </View>
            <View style={styles.statItemWide}>
              <Text style={styles.statValueSmall}>
                {formatDurationDisplay(stats?.totalDuration ?? 0)}
              </Text>
              <Text style={styles.statLabel}>累計時間</Text>
            </View>
          </View>
        </View>

        {/* Streak Banner */}
        {stats && stats.consecutiveDays > 0 && (
          <View style={styles.streakBanner} testID="streak-display">
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {stats.consecutiveDays}日連続達成中！
            </Text>
            {stats.consecutiveDays >= 7 && (
              <Text style={styles.streakBadge}>🏆</Text>
            )}
          </View>
        )}

        {/* History List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>履歴</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} testID="clear-history">
                <Text style={styles.clearButton}>すべてクリア</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyState} testID="empty-state">
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>まだ履歴がありません</Text>
              <Text style={styles.emptySubtext}>
                ストレッチを完了すると履歴が記録されます
              </Text>
            </View>
          ) : (
            Array.from(groupedHistory.entries()).map(([date, records]) => (
              <View key={date} style={styles.dateGroup} testID={`date-group-${date}`}>
                <Text style={styles.dateHeader}>{formatDateDisplay(date)}</Text>
                {records.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordCard}
                    onLongPress={() => handleDeleteRecord(record)}
                    testID={`record-${record.id}`}
                  >
                    <View style={styles.recordMain}>
                      <Text style={styles.recordName}>{record.routineName}</Text>
                      <Text style={styles.recordDetails}>
                        {record.completedPoses}/{record.totalPoses}種目 ·{' '}
                        {formatDurationDisplay(record.actualDuration)}
                      </Text>
                    </View>
                    <Text style={styles.recordTime}>
                      {new Date(record.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 ヒント</Text>
          <Text style={styles.tipsText}>
            • 毎日ストレッチすると連続日数がカウントされます{'\n'}
            • 長押しで個別の記録を削除できます{'\n'}
            • 7日連続達成でトロフィーがもらえます！
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemWide: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statValueSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  streakBadge: {
    fontSize: 24,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#F44336',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  recordMain: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 13,
    color: '#666',
  },
  recordTime: {
    fontSize: 13,
    color: '#999',
  },
  tipsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
});
