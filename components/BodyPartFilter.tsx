import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BodyPart } from '@/types';
import { BODY_PART_LABELS, BODY_PART_EMOJIS } from '@/utils/presets';

interface BodyPartFilterProps {
  selected: BodyPart | 'all';
  onSelect: (bodyPart: BodyPart | 'all') => void;
}

const FILTER_OPTIONS: Array<BodyPart | 'all'> = [
  'all',
  'shoulder',
  'neck',
  'waist',
  'legs',
  'arms',
  'back',
  'full',
];

export const BodyPartFilter: React.FC<BodyPartFilterProps> = ({
  selected,
  onSelect,
}) => {
  const getLabel = (option: BodyPart | 'all') => {
    if (option === 'all') return '全て';
    return BODY_PART_LABELS[option];
  };

  const getEmoji = (option: BodyPart | 'all') => {
    if (option === 'all') return '🎯';
    return BODY_PART_EMOJIS[option];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              selected === option && styles.selectedChip,
            ]}
            onPress={() => onSelect(option)}
            testID={`body-part-filter-${option}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === option }}
          >
            <Text style={styles.emoji}>{getEmoji(option)}</Text>
            <Text
              style={[
                styles.label,
                selected === option && styles.selectedLabel,
              ]}
            >
              {getLabel(option)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
