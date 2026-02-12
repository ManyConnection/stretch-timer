import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TimerDisplay } from '@/components/TimerDisplay';

describe('TimerDisplay', () => {
  it('should display time in MM:SS format', () => {
    render(<TimerDisplay seconds={90} isRunning={false} isPaused={false} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('01:30');
  });

  it('should display zero seconds correctly', () => {
    render(<TimerDisplay seconds={0} isRunning={false} isPaused={false} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00');
  });

  it('should display single digit seconds with padding', () => {
    render(<TimerDisplay seconds={65} isRunning={false} isPaused={false} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('01:05');
  });

  it('should display 3 minutes correctly', () => {
    render(<TimerDisplay seconds={180} isRunning={false} isPaused={false} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:00');
  });

  it('should show paused label when paused', () => {
    render(<TimerDisplay seconds={60} isRunning={false} isPaused={true} />);
    
    expect(screen.getByTestId('paused-label')).toBeDefined();
    expect(screen.getByTestId('paused-label')).toHaveTextContent('一時停止中');
  });

  it('should show running label when running', () => {
    render(<TimerDisplay seconds={60} isRunning={true} isPaused={false} />);
    
    expect(screen.getByTestId('running-label')).toBeDefined();
    expect(screen.getByTestId('running-label')).toHaveTextContent('実行中');
  });

  it('should not show labels when idle', () => {
    render(<TimerDisplay seconds={60} isRunning={false} isPaused={false} />);
    
    expect(screen.queryByTestId('paused-label')).toBeNull();
    expect(screen.queryByTestId('running-label')).toBeNull();
  });

  it('should handle large values', () => {
    render(<TimerDisplay seconds={599} isRunning={false} isPaused={false} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('09:59');
  });
});
