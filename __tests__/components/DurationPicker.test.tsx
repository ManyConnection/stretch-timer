import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DurationPicker } from '@/components/DurationPicker';

describe('DurationPicker', () => {
  const defaultOptions = [30, 45, 60, 90, 120, 180];

  it('should render all duration options', () => {
    render(<DurationPicker value={45} onChange={jest.fn()} />);
    
    defaultOptions.forEach((duration) => {
      expect(screen.getByTestId(`duration-option-${duration}`)).toBeDefined();
    });
  });

  it('should call onChange when option is pressed', () => {
    const onChange = jest.fn();
    render(<DurationPicker value={45} onChange={onChange} />);
    
    fireEvent.press(screen.getByTestId('duration-option-60'));
    
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('should highlight selected option', () => {
    render(<DurationPicker value={60} onChange={jest.fn()} />);
    
    const selectedOption = screen.getByTestId('duration-option-60');
    expect(selectedOption.props.accessibilityState).toEqual({ selected: true });
  });

  it('should not highlight non-selected options', () => {
    render(<DurationPicker value={60} onChange={jest.fn()} />);
    
    const nonSelectedOption = screen.getByTestId('duration-option-30');
    expect(nonSelectedOption.props.accessibilityState).toEqual({ selected: false });
  });

  it('should allow selecting different durations', () => {
    const onChange = jest.fn();
    render(<DurationPicker value={45} onChange={onChange} />);
    
    fireEvent.press(screen.getByTestId('duration-option-30'));
    expect(onChange).toHaveBeenCalledWith(30);
    
    fireEvent.press(screen.getByTestId('duration-option-180'));
    expect(onChange).toHaveBeenCalledWith(180);
  });

  it('should render custom options when provided', () => {
    const customOptions = [15, 30, 45];
    render(
      <DurationPicker
        value={30}
        onChange={jest.fn()}
        options={customOptions}
      />
    );
    
    expect(screen.getByTestId('duration-option-15')).toBeDefined();
    expect(screen.getByTestId('duration-option-30')).toBeDefined();
    expect(screen.getByTestId('duration-option-45')).toBeDefined();
    expect(screen.queryByTestId('duration-option-60')).toBeNull();
  });

  it('should format durations correctly', () => {
    render(<DurationPicker value={45} onChange={jest.fn()} />);
    
    expect(screen.getByText('30秒')).toBeDefined();
    expect(screen.getByText('1分')).toBeDefined();
    expect(screen.getByText('2分')).toBeDefined();
    expect(screen.getByText('3分')).toBeDefined();
  });
});
