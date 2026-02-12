import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DURATION_OPTIONS, formatDuration } from '@/utils/presets';

interface DurationPickerProps {
  value: number;
  onChange: (duration: number) => void;
  options?: number[];
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  value,
  onChange,
  options = DURATION_OPTIONS,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>時間を選択</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.option,
              value === duration && styles.selectedOption,
            ]}
            onPress={() => onChange(duration)}
            testID={`duration-option-${duration}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === duration }}
          >
            <Text
              style={[
                styles.optionText,
                value === duration && styles.selectedOptionText,
              ]}
            >
              {formatDuration(duration)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
});
