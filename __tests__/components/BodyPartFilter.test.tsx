import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { BodyPartFilter } from '@/components/BodyPartFilter';

describe('BodyPartFilter', () => {
  it('should render all filter options', () => {
    render(<BodyPartFilter selected="all" onSelect={jest.fn()} />);
    
    const options = ['all', 'shoulder', 'neck', 'waist', 'legs', 'arms', 'back', 'full'];
    options.forEach((option) => {
      expect(screen.getByTestId(`body-part-filter-${option}`)).toBeDefined();
    });
  });

  it('should call onSelect when option is pressed', () => {
    const onSelect = jest.fn();
    render(<BodyPartFilter selected="all" onSelect={onSelect} />);
    
    fireEvent.press(screen.getByTestId('body-part-filter-shoulder'));
    
    expect(onSelect).toHaveBeenCalledWith('shoulder');
  });

  it('should call onSelect with "all" when all is pressed', () => {
    const onSelect = jest.fn();
    render(<BodyPartFilter selected="shoulder" onSelect={onSelect} />);
    
    fireEvent.press(screen.getByTestId('body-part-filter-all'));
    
    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('should indicate selected state', () => {
    render(<BodyPartFilter selected="shoulder" onSelect={jest.fn()} />);
    
    const selectedOption = screen.getByTestId('body-part-filter-shoulder');
    expect(selectedOption.props.accessibilityState).toEqual({ selected: true });
    
    const nonSelectedOption = screen.getByTestId('body-part-filter-neck');
    expect(nonSelectedOption.props.accessibilityState).toEqual({ selected: false });
  });

  it('should display correct labels', () => {
    render(<BodyPartFilter selected="all" onSelect={jest.fn()} />);
    
    expect(screen.getByText('全て')).toBeDefined();
    expect(screen.getByText('肩')).toBeDefined();
    expect(screen.getByText('首')).toBeDefined();
    expect(screen.getByText('腰')).toBeDefined();
    expect(screen.getByText('脚')).toBeDefined();
    expect(screen.getByText('腕')).toBeDefined();
    expect(screen.getByText('背中')).toBeDefined();
    expect(screen.getByText('全身')).toBeDefined();
  });

  it('should allow switching between filters', () => {
    const onSelect = jest.fn();
    render(<BodyPartFilter selected="all" onSelect={onSelect} />);
    
    fireEvent.press(screen.getByTestId('body-part-filter-neck'));
    expect(onSelect).toHaveBeenCalledWith('neck');
    
    fireEvent.press(screen.getByTestId('body-part-filter-waist'));
    expect(onSelect).toHaveBeenCalledWith('waist');
    
    fireEvent.press(screen.getByTestId('body-part-filter-legs'));
    expect(onSelect).toHaveBeenCalledWith('legs');
  });
});
