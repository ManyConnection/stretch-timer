import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { loadRoutines, loadPreferences } from '@/utils/storage';
import { SavedRoutine, UserPreferences } from '@/types';
import { PRESET_STRETCHES } from '@/utils/presets';

export default function HomeScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<SavedRoutine[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [loadedRoutines, loadedPreferences] = await Promise.all([
            loadRoutines(),
            loadPreferences(),
          ]);
          setRoutines(loadedRoutines);
          setPreferences(loadedPreferences);
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

        <View style={styles.section}>
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
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickButtons: {
    gap: 12,
  },
  bodyPartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
