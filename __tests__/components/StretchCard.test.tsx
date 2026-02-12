import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StretchCard } from '@/components/StretchCard';
import { StretchItem } from '@/types';

describe('StretchCard', () => {
  const mockStretch: StretchItem = {
    id: 'shoulder-roll',
    name: '肩回し',
    bodyPart: 'shoulder',
    defaultDuration: 30,
    description: '両肩を大きく前後に回します',
    emoji: '🔄',
  };

  it('should render stretch name', () => {
    render(<StretchCard stretch={mockStretch} />);
    
    expect(screen.getByText('肩回し')).toBeDefined();
  });

  it('should render emoji', () => {
    render(<StretchCard stretch={mockStretch} />);
    
    expect(screen.getByText('🔄')).toBeDefined();
  });

  it('should render body part label', () => {
    render(<StretchCard stretch={mockStretch} />);
    
    expect(screen.getByText('肩')).toBeDefined();
  });

  it('should render description', () => {
    render(<StretchCard stretch={mockStretch} />);
    
    expect(screen.getByText('両肩を大きく前後に回します')).toBeDefined();
  });

  it('should render default duration when no custom duration', () => {
    render(<StretchCard stretch={mockStretch} showDuration={true} />);
    
    expect(screen.getByText('30秒')).toBeDefined();
  });

  it('should render custom duration when provided', () => {
    render(<StretchCard stretch={mockStretch} duration={60} showDuration={true} />);
    
    expect(screen.getByText('1分')).toBeDefined();
  });

  it('should not render duration when showDuration is false', () => {
    render(<StretchCard stretch={mockStretch} showDuration={false} />);
    
    expect(screen.queryByText('30秒')).toBeNull();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<StretchCard stretch={mockStretch} onPress={onPress} />);
    
    fireEvent.press(screen.getByTestId('stretch-card-shoulder-roll'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should show checkmark when selected', () => {
    render(<StretchCard stretch={mockStretch} isSelected={true} />);
    
    expect(screen.getByText('✓')).toBeDefined();
  });

  it('should not show checkmark when not selected', () => {
    render(<StretchCard stretch={mockStretch} isSelected={false} />);
    
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('should have correct accessibility label', () => {
    render(<StretchCard stretch={mockStretch} />);
    
    const card = screen.getByTestId('stretch-card-shoulder-roll');
    expect(card.props.accessibilityLabel).toBe('肩回し, 肩');
  });
});
