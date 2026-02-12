import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  TimerDisplay,
  SessionProgress,
  StretchCard,
} from '@/components';
import { StretchSessionItem, UserPreferences } from '@/types';
import { useStretchSession } from '@/hooks/useStretchSession';
import { loadPreferences, loadRoutines } from '@/utils/storage';

export default function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ items?: string; routineId?: string }>();
  
  const [sessionItems, setSessionItems] = useState<StretchSessionItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    useSpeech: true,
    useVibration: true,
    defaultDuration: 45,
    speechLanguage: 'ja',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prefs = await loadPreferences();
        setPreferences(prefs);

        if (params.items) {
          const items = JSON.parse(params.items) as StretchSessionItem[];
          setSessionItems(items);
        } else if (params.routineId) {
          const routines = await loadRoutines();
          const routine = routines.find((r) => r.id === params.routineId);
          if (routine) {
            setSessionItems(routine.items);
          }
        }
      } catch (error) {
        console.error('Failed to load session data:', error);
        Alert.alert('エラー', 'セッションの読み込みに失敗しました');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params.items, params.routineId]);

  const handleSessionComplete = useCallback(() => {
    // Session completed
  }, []);

  const session = useStretchSession({
    items: sessionItems,
    preferences,
    onSessionComplete: handleSessionComplete,
  });

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (session.isRunning || session.isPaused) {
          Alert.alert(
            'セッション中',
            '実行中のセッションを終了しますか？',
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: '終了',
                style: 'destructive',
                onPress: () => {
                  session.stop();
                  router.back();
                },
              },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }, [session.isRunning, session.isPaused])
  );

  const handleExit = () => {
    if (session.isRunning || session.isPaused) {
      Alert.alert(
        'セッション中',
        '実行中のセッションを終了しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '終了',
            style: 'destructive',
            onPress: () => {
              session.stop();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ストレッチが選択されていません</Text>
          <Button
            title="戻る"
            onPress={() => router.back()}
            variant="primary"
            size="large"
            testID="go-back-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (session.isSessionComplete) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>お疲れ様でした！</Text>
          <Text style={styles.completeSubtitle}>
            {sessionItems.length}種目のストレッチを完了しました
          </Text>
          <View style={styles.completeButtons}>
            <Button
              title="もう一度"
              onPress={session.restart}
              variant="outline"
              size="large"
              testID="restart-session-button"
            />
            <Button
              title="ホームへ"
              onPress={() => router.replace('/')}
              variant="primary"
              size="large"
              testID="go-home-button"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <SessionProgress
          currentIndex={session.currentIndex}
          totalItems={session.totalItems}
        />

        {session.currentItem && (
          <View style={styles.currentStretch}>
            <StretchCard
              stretch={session.currentItem.stretch}
              duration={session.currentItem.duration}
              showDuration={false}
            />
          </View>
        )}

        <TimerDisplay
          seconds={session.remainingSeconds}
          isRunning={session.isRunning}
          isPaused={session.isPaused}
        />

        <View style={styles.controls}>
          {!session.isRunning && !session.isPaused && (
            <Button
              title="▶️ スタート"
              onPress={session.start}
              variant="primary"
              size="large"
              testID="start-button"
            />
          )}

          {session.isRunning && (
            <Button
              title="⏸️ 一時停止"
              onPress={session.pause}
              variant="secondary"
              size="large"
              testID="pause-button"
            />
          )}

          {session.isPaused && (
            <View style={styles.pausedControls}>
              <Button
                title="▶️ 再開"
                onPress={session.resume}
                variant="primary"
                size="large"
                testID="resume-button"
              />
              <Button
                title="⏹️ 停止"
                onPress={session.stop}
                variant="danger"
                size="medium"
                testID="stop-button"
              />
            </View>
          )}

          {(session.isRunning || session.isPaused) && (
            <View style={styles.skipButton}>
              <Button
                title="⏭️ スキップ"
                onPress={session.skip}
                variant="outline"
                size="medium"
                testID="skip-button"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="終了"
          onPress={handleExit}
          variant="outline"
          size="medium"
          testID="exit-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  currentStretch: {
    paddingTop: 8,
  },
  controls: {
    alignItems: 'center',
    padding: 24,
  },
  pausedControls: {
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  completeButtons: {
    flexDirection: 'row',
    gap: 16,
  },
});
