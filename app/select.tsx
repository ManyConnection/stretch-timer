import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  StretchCard,
  BodyPartFilter,
  DurationPicker,
} from '@/components';
import { StretchItem, BodyPart, StretchSessionItem, SavedRoutine } from '@/types';
import { PRESET_STRETCHES, getStretchesByBodyPart } from '@/utils/presets';
import { loadPreferences, addRoutine } from '@/utils/storage';

export default function SelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  
  const [bodyPartFilter, setBodyPartFilter] = useState<BodyPart | 'all'>(
    (params.filter as BodyPart) ?? 'all'
  );
  const [selectedStretches, setSelectedStretches] = useState<StretchSessionItem[]>([]);
  const [customDuration, setCustomDuration] = useState(45);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routineName, setRoutineName] = useState('');

  useEffect(() => {
    const loadDefaultDuration = async () => {
      try {
        const prefs = await loadPreferences();
        setCustomDuration(prefs.defaultDuration);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadDefaultDuration();
  }, []);

  const filteredStretches = useMemo(() => {
    if (bodyPartFilter === 'all') {
      return PRESET_STRETCHES;
    }
    return getStretchesByBodyPart(bodyPartFilter);
  }, [bodyPartFilter]);

  const isSelected = (stretch: StretchItem) => {
    return selectedStretches.some((s) => s.stretch.id === stretch.id);
  };

  const toggleStretch = (stretch: StretchItem) => {
    if (isSelected(stretch)) {
      setSelectedStretches((prev) =>
        prev.filter((s) => s.stretch.id !== stretch.id)
      );
    } else {
      setSelectedStretches((prev) => [
        ...prev,
        { stretch, duration: customDuration },
      ]);
    }
  };

  const updateDuration = (stretchId: string, duration: number) => {
    setSelectedStretches((prev) =>
      prev.map((s) =>
        s.stretch.id === stretchId ? { ...s, duration } : s
      )
    );
  };

  const selectAll = () => {
    const newItems: StretchSessionItem[] = filteredStretches.map((stretch) => ({
      stretch,
      duration: customDuration,
    }));
    setSelectedStretches(newItems);
  };

  const clearAll = () => {
    setSelectedStretches([]);
  };

  const startSession = () => {
    if (selectedStretches.length === 0) {
      Alert.alert('選択してください', '少なくとも1つのストレッチを選択してください');
      return;
    }

    // Pass selected items to session screen
    router.push({
      pathname: '/session',
      params: {
        items: JSON.stringify(selectedStretches),
      },
    });
  };

  const saveAsRoutine = async () => {
    if (selectedStretches.length === 0) {
      Alert.alert('選択してください', '少なくとも1つのストレッチを選択してください');
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('名前を入力', 'ルーティンの名前を入力してください');
      return;
    }

    try {
      const routine: SavedRoutine = {
        id: Date.now().toString(),
        name: routineName.trim(),
        items: selectedStretches,
        createdAt: Date.now(),
      };
      await addRoutine(routine);
      setShowSaveModal(false);
      setRoutineName('');
      Alert.alert('保存完了', 'ルーティンを保存しました');
    } catch (error) {
      Alert.alert('エラー', 'ルーティンの保存に失敗しました');
    }
  };

  const renderStretchItem = ({ item }: { item: StretchItem }) => {
    const selectedItem = selectedStretches.find((s) => s.stretch.id === item.id);
    
    return (
      <StretchCard
        stretch={item}
        duration={selectedItem?.duration}
        isSelected={isSelected(item)}
        onPress={() => toggleStretch(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <BodyPartFilter
          selected={bodyPartFilter}
          onSelect={setBodyPartFilter}
        />
        <DurationPicker
          value={customDuration}
          onChange={setCustomDuration}
        />
        <View style={styles.headerActions}>
          <Button
            title="全選択"
            onPress={selectAll}
            variant="outline"
            size="small"
            testID="select-all-button"
          />
          <Button
            title="クリア"
            onPress={clearAll}
            variant="outline"
            size="small"
            testID="clear-all-button"
          />
        </View>
      </View>

      <FlatList
        data={filteredStretches}
        renderItem={renderStretchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount} testID="selected-count">
          {selectedStretches.length}種目選択中
        </Text>
        <View style={styles.footerButtons}>
          <Button
            title="保存"
            onPress={saveAsRoutine}
            variant="outline"
            size="medium"
            disabled={selectedStretches.length === 0}
            testID="save-routine-button"
          />
          <Button
            title="開始"
            onPress={startSession}
            variant="primary"
            size="large"
            disabled={selectedStretches.length === 0}
            testID="start-session-button"
          />
        </View>
      </View>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ルーティン名</Text>
            <TextInput
              style={styles.input}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="例: 朝のストレッチ"
              testID="routine-name-input"
            />
            <View style={styles.modalButtons}>
              <Button
                title="キャンセル"
                onPress={() => {
                  setShowSaveModal(false);
                  setRoutineName('');
                }}
                variant="outline"
                size="medium"
                testID="cancel-save-button"
              />
              <Button
                title="保存"
                onPress={confirmSaveRoutine}
                variant="primary"
                size="medium"
                testID="confirm-save-button"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
});
