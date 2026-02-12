import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StretchItem } from '@/types';
import { formatDuration, BODY_PART_LABELS } from '@/utils/presets';

interface StretchCardProps {
  stretch: StretchItem;
  duration?: number;
  isSelected?: boolean;
  onPress?: () => void;
  showDuration?: boolean;
}

export const StretchCard: React.FC<StretchCardProps> = ({
  stretch,
  duration,
  isSelected = false,
  onPress,
  showDuration = true,
}) => {
  const displayDuration = duration ?? stretch.defaultDuration;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`stretch-card-${stretch.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${stretch.name}, ${BODY_PART_LABELS[stretch.bodyPart]}`}
    >
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{stretch.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{stretch.name}</Text>
        <Text style={styles.bodyPart}>{BODY_PART_LABELS[stretch.bodyPart]}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {stretch.description}
        </Text>
      </View>
      {showDuration && (
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{formatDuration(displayDuration)}</Text>
        </View>
      )}
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bodyPart: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#888',
  },
  durationContainer: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  duration: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
