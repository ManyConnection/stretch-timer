import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render with title', () => {
    render(<Button title="テスト" onPress={jest.fn()} testID="test-button" />);
    
    expect(screen.getByTestId('test-button')).toBeDefined();
    expect(screen.getByText('テスト')).toBeDefined();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="テスト" onPress={onPress} testID="test-button" />);
    
    fireEvent.press(screen.getByTestId('test-button'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <Button
        title="テスト"
        onPress={onPress}
        disabled={true}
        testID="test-button"
      />
    );
    
    fireEvent.press(screen.getByTestId('test-button'));
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with icon', () => {
    render(
      <Button
        title="テスト"
        onPress={jest.fn()}
        icon="🎯"
        testID="test-button"
      />
    );
    
    expect(screen.getByText('🎯')).toBeDefined();
  });

  it('should handle multiple rapid presses', () => {
    const onPress = jest.fn();
    render(<Button title="テスト" onPress={onPress} testID="test-button" />);
    
    const button = screen.getByTestId('test-button');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('should have correct accessibility role', () => {
    render(<Button title="テスト" onPress={jest.fn()} testID="test-button" />);
    
    const button = screen.getByTestId('test-button');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('should indicate disabled state for accessibility', () => {
    render(
      <Button
        title="テスト"
        onPress={jest.fn()}
        disabled={true}
        testID="test-button"
      />
    );
    
    const button = screen.getByTestId('test-button');
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });
});
