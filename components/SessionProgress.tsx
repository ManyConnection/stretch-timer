import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SessionProgressProps {
  currentIndex: number;
  totalItems: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  currentIndex,
  totalItems,
}) => {
  const progress = totalItems > 0 ? (currentIndex / totalItems) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>進捗</Text>
        <Text style={styles.count} testID="session-progress-count">
          {currentIndex + 1} / {totalItems}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${progress}%` }]}
          testID="progress-fill"
        />
      </View>
      <View style={styles.dots}>
        {Array.from({ length: totalItems }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentIndex && styles.completedDot,
              index === currentIndex && styles.currentDot,
            ]}
            testID={`progress-dot-${index}`}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  currentDot: {
    backgroundColor: '#FF9800',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
