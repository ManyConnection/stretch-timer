import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SessionProgress } from '@/components/SessionProgress';

describe('SessionProgress', () => {
  it('should display current and total count', () => {
    render(<SessionProgress currentIndex={2} totalItems={5} />);
    
    expect(screen.getByTestId('session-progress-count')).toHaveTextContent('3 / 5');
  });

  it('should display first item correctly', () => {
    render(<SessionProgress currentIndex={0} totalItems={5} />);
    
    expect(screen.getByTestId('session-progress-count')).toHaveTextContent('1 / 5');
  });

  it('should display last item correctly', () => {
    render(<SessionProgress currentIndex={4} totalItems={5} />);
    
    expect(screen.getByTestId('session-progress-count')).toHaveTextContent('5 / 5');
  });

  it('should render correct number of dots', () => {
    render(<SessionProgress currentIndex={2} totalItems={5} />);
    
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`progress-dot-${i}`)).toBeDefined();
    }
  });

  it('should handle single item', () => {
    render(<SessionProgress currentIndex={0} totalItems={1} />);
    
    expect(screen.getByTestId('session-progress-count')).toHaveTextContent('1 / 1');
    expect(screen.getByTestId('progress-dot-0')).toBeDefined();
    expect(screen.queryByTestId('progress-dot-1')).toBeNull();
  });

  it('should render progress fill', () => {
    render(<SessionProgress currentIndex={2} totalItems={4} />);
    
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toBeDefined();
  });

  it('should handle zero items gracefully', () => {
    render(<SessionProgress currentIndex={0} totalItems={0} />);
    
    expect(screen.getByTestId('session-progress-count')).toHaveTextContent('1 / 0');
  });
});
