import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'ストレッチタイマー',
          }}
        />
        <Stack.Screen
          name="select"
          options={{
            title: 'メニュー選択',
          }}
        />
        <Stack.Screen
          name="session"
          options={{
            title: 'セッション',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: '設定',
          }}
        />
        <Stack.Screen
          name="routines"
          options={{
            title: 'ルーティン',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
