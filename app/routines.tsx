import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { SavedRoutine } from '@/types';
import { loadRoutines, deleteRoutine } from '@/utils/storage';
import { formatDuration } from '@/utils/presets';

export default function RoutinesScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<SavedRoutine[]>([]);

  const load = useCallback(async () => {
    try {
      const loaded = await loadRoutines();
      setRoutines(loaded);
    } catch (error) {
      console.error('Failed to load routines:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = (routine: SavedRoutine) => {
    Alert.alert(
      '削除確認',
      `「${routine.name}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine(routine.id);
              load();
            } catch (error) {
              Alert.alert('エラー', 'ルーティンの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const startRoutine = (routine: SavedRoutine) => {
    router.push({
      pathname: '/session',
      params: { routineId: routine.id },
    });
  };

  const getTotalDuration = (routine: SavedRoutine): number => {
    return routine.items.reduce((sum, item) => sum + item.duration, 0);
  };

  const renderRoutineItem = ({ item }: { item: SavedRoutine }) => (
    <TouchableOpacity
      style={styles.routineCard}
      onPress={() => startRoutine(item)}
      onLongPress={() => handleDelete(item)}
      testID={`routine-item-${item.id}`}
      accessibilityHint="長押しで削除"
    >
      <View style={styles.routineHeader}>
        <Text style={styles.routineName}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`delete-routine-${item.id}`}
        >
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.routineInfo}>
        <Text style={styles.routineDetails}>
          {item.items.length}種目 • {formatDuration(getTotalDuration(item))}
        </Text>
        <Text style={styles.routineDate}>
          作成: {new Date(item.createdAt).toLocaleDateString('ja-JP')}
        </Text>
      </View>
      <View style={styles.routineStretches}>
        {item.items.slice(0, 3).map((sessionItem, index) => (
          <Text key={index} style={styles.stretchName}>
            {sessionItem.stretch.emoji} {sessionItem.stretch.name}
          </Text>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreText}>+{item.items.length - 3}種目</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (routines.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>ルーティンがありません</Text>
          <Text style={styles.emptyDescription}>
            メニュー選択画面でストレッチを選び、
            ルーティンとして保存できます
          </Text>
          <Button
            title="メニューを選ぶ"
            onPress={() => router.push('/select')}
            variant="primary"
            size="large"
            testID="go-to-select-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={routines}
        renderItem={renderRoutineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.footer}>
        <Button
          title="新しいルーティンを作成"
          onPress={() => router.push('/select')}
          variant="primary"
          size="large"
          testID="create-routine-button"
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
  listContent: {
    padding: 16,
  },
  routineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    fontSize: 18,
    padding: 4,
  },
  routineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routineDetails: {
    fontSize: 14,
    color: '#666',
  },
  routineDate: {
    fontSize: 12,
    color: '#999',
  },
  routineStretches: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  stretchName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
