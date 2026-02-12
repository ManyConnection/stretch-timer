import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { loadRoutines, loadPreferences } from '@/utils/storage';
import { SavedRoutine, UserPreferences } from '@/types';
import { PRESET_STRETCHES } from '@/utils/presets';
import { 
  PRESET_ROUTINES, 
  getRoutineDuration, 
  formatRoutineDuration,
  PresetRoutine,
} from '@/utils/routinePresets';
import { calculateStats, HistoryStats } from '@/utils/history';

export default function HomeScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<SavedRoutine[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<HistoryStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [loadedRoutines, loadedPreferences, loadedStats] = await Promise.all([
            loadRoutines(),
            loadPreferences(),
            calculateStats(),
          ]);
          setRoutines(loadedRoutines);
          setPreferences(loadedPreferences);
          setStats(loadedStats);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
    }, [])
  );

  const startQuickSession = (bodyPart: string) => {
    router.push({
      pathname: '/select',
      params: { filter: bodyPart },
    });
  };

  const startRoutine = (routine: SavedRoutine) => {
    router.push({
      pathname: '/session',
      params: { routineId: routine.id },
    });
  };

  const startPresetRoutine = (preset: PresetRoutine) => {
    router.push({
      pathname: '/session',
      params: { presetId: preset.id },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🧘</Text>
          <Text style={styles.title}>ストレッチを始めよう</Text>
          <Text style={styles.subtitle}>
            {PRESET_STRETCHES.length}種類のストレッチを用意しています
          </Text>
        </View>

        {/* Streak Display */}
        {stats && stats.consecutiveDays > 0 && (
          <TouchableOpacity 
            style={styles.streakBanner}
            onPress={() => router.push('/history')}
            testID="streak-banner"
          >
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakCount}>{stats.consecutiveDays}日連続</Text>
              <Text style={styles.streakLabel}>継続中！</Text>
            </View>
            <Text style={styles.streakArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Today's Progress */}
        <TouchableOpacity 
          style={styles.statsCard}
          onPress={() => router.push('/history')}
          testID="stats-card"
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.sessionsThisWeek ?? 0}</Text>
            <Text style={styles.statLabel}>今週</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalSessions ?? 0}</Text>
            <Text style={styles.statLabel}>総セッション</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.longestStreak ?? 0}</Text>
            <Text style={styles.statLabel}>最長連続</Text>
          </View>
        </TouchableOpacity>

        {/* Preset Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>おすすめルーティン</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRoutinesScroll}
          >
            {PRESET_ROUTINES.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetCard}
                onPress={() => startPresetRoutine(preset)}
                testID={`preset-routine-${preset.id}`}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetDuration}>
                  {formatRoutineDuration(getRoutineDuration(preset))} · {preset.items.length}種目
                </Text>
                <Text style={styles.presetDescription} numberOfLines={2}>
                  {preset.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックスタート</Text>
          <View style={styles.quickButtons}>
            <Button
              title="🎯 自由選択"
              onPress={() => router.push('/select')}
              variant="primary"
              size="large"
              testID="quick-start-custom"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>部位別</Text>
          <View style={styles.bodyPartGrid}>
            {[
              { key: 'shoulder', emoji: '💪', label: '肩' },
              { key: 'neck', emoji: '🦒', label: '首' },
              { key: 'waist', emoji: '🌀', label: '腰' },
              { key: 'legs', emoji: '🦵', label: '脚' },
              { key: 'arms', emoji: '🤲', label: '腕' },
              { key: 'back', emoji: '🔙', label: '背中' },
            ].map((item) => (
              <Button
                key={item.key}
                title={`${item.emoji} ${item.label}`}
                onPress={() => startQuickSession(item.key)}
                variant="outline"
                size="medium"
                testID={`body-part-${item.key}`}
              />
            ))}
          </View>
        </View>

        {routines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>保存済みルーティン</Text>
            {routines.slice(0, 3).map((routine) => (
              <Button
                key={routine.id}
                title={`📋 ${routine.name} (${routine.items.length}種目)`}
                onPress={() => startRoutine(routine)}
                variant="secondary"
                size="medium"
                testID={`routine-${routine.id}`}
              />
            ))}
            {routines.length > 3 && (
              <Button
                title="すべて見る"
                onPress={() => router.push('/routines')}
                variant="outline"
                size="small"
                testID="view-all-routines"
              />
            )}
          </View>
        )}

        <View style={styles.bottomButtons}>
          <Button
            title="📊 履歴"
            onPress={() => router.push('/history')}
            variant="outline"
            size="medium"
            testID="history-button"
          />
          <Button
            title="⚙️ 設定"
            onPress={() => router.push('/settings')}
            variant="outline"
            size="medium"
            testID="settings-button"
          />
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
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFCCBC',
  },
  streakArrow: {
    fontSize: 20,
    color: '#FFF',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  presetRoutinesScroll: {
    paddingRight: 16,
    gap: 12,
  },
  presetCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  presetEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  presetDuration: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
  },
  presetDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  quickButtons: {
    gap: 12,
  },
  bodyPartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
