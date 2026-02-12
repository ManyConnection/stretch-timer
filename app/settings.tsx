import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DurationPicker } from '@/components';
import { UserPreferences } from '@/types';
import { loadPreferences, savePreferences, clearAllData } from '@/utils/storage';
import { speak, vibrate } from '@/utils/notifications';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    useSpeech: true,
    useVibration: true,
    defaultDuration: 45,
    speechLanguage: 'ja',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const prefs = await loadPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    load();
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await savePreferences(preferences);
      setHasChanges(false);
      Alert.alert('保存完了', '設定を保存しました');
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました');
    }
  };

  const testSpeech = async () => {
    await speak('これはテストです', preferences.speechLanguage);
  };

  const testVibration = async () => {
    await vibrate('medium');
  };

  const handleClearData = () => {
    Alert.alert(
      'データのクリア',
      'すべての設定とルーティンを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              const defaultPrefs: UserPreferences = {
                useSpeech: true,
                useVibration: true,
                defaultDuration: 45,
                speechLanguage: 'ja',
              };
              setPreferences(defaultPrefs);
              setHasChanges(false);
              Alert.alert('完了', 'すべてのデータを削除しました');
            } catch (error) {
              Alert.alert('エラー', 'データの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>音声ガイド</Text>
              <Text style={styles.settingDescription}>
                残り時間を読み上げます
              </Text>
            </View>
            <Switch
              value={preferences.useSpeech}
              onValueChange={(value) => updatePreference('useSpeech', value)}
              trackColor={{ true: '#4CAF50' }}
              testID="speech-toggle"
            />
          </View>

          {preferences.useSpeech && (
            <View style={styles.testButton}>
              <Button
                title="🔊 テスト"
                onPress={testSpeech}
                variant="outline"
                size="small"
                testID="test-speech-button"
              />
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>振動</Text>
              <Text style={styles.settingDescription}>
                残り時間で振動通知します
              </Text>
            </View>
            <Switch
              value={preferences.useVibration}
              onValueChange={(value) => updatePreference('useVibration', value)}
              trackColor={{ true: '#4CAF50' }}
              testID="vibration-toggle"
            />
          </View>

          {preferences.useVibration && (
            <View style={styles.testButton}>
              <Button
                title="📳 テスト"
                onPress={testVibration}
                variant="outline"
                size="small"
                testID="test-vibration-button"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>言語</Text>
          <View style={styles.languageButtons}>
            <Button
              title="🇯🇵 日本語"
              onPress={() => updatePreference('speechLanguage', 'ja')}
              variant={preferences.speechLanguage === 'ja' ? 'primary' : 'outline'}
              size="medium"
              testID="language-ja-button"
            />
            <Button
              title="🇺🇸 English"
              onPress={() => updatePreference('speechLanguage', 'en')}
              variant={preferences.speechLanguage === 'en' ? 'primary' : 'outline'}
              size="medium"
              testID="language-en-button"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>デフォルト時間</Text>
          <DurationPicker
            value={preferences.defaultDuration}
            onChange={(value) => updatePreference('defaultDuration', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ</Text>
          <Button
            title="🗑️ すべてのデータを削除"
            onPress={handleClearData}
            variant="danger"
            size="medium"
            testID="clear-data-button"
          />
        </View>
      </ScrollView>

      {hasChanges && (
        <View style={styles.footer}>
          <Button
            title="保存"
            onPress={handleSave}
            variant="primary"
            size="large"
            testID="save-settings-button"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  testButton: {
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
