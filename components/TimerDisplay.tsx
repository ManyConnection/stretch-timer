import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerDisplayProps {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  isRunning,
  isPaused,
}) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const getColor = () => {
    if (seconds <= 5) return '#F44336';
    if (seconds <= 10) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.timer,
          { color: getColor() },
          isPaused && styles.paused,
        ]}
        testID="timer-display"
      >
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </Text>
      {isPaused && (
        <Text style={styles.pausedLabel} testID="paused-label">
          一時停止中
        </Text>
      )}
      {isRunning && (
        <Text style={styles.runningLabel} testID="running-label">
          実行中
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timer: {
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  paused: {
    opacity: 0.6,
  },
  pausedLabel: {
    fontSize: 16,
    color: '#FF9800',
    marginTop: 8,
  },
  runningLabel: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
  },
});
