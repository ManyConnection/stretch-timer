import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '@/hooks/useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct values', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    expect(result.current.remainingSeconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('should start timer', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('should decrement timer every second', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(59);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.remainingSeconds).toBe(57);
  });

  it('should pause timer', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.start();
      jest.advanceTimersByTime(3000);
    });

    const remainingBeforePause = result.current.remainingSeconds;

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(remainingBeforePause);
  });

  it('should resume timer after pause', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.start();
      jest.advanceTimersByTime(3000);
    });

    act(() => {
      result.current.pause();
    });

    const remainingAfterPause = result.current.remainingSeconds;

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.remainingSeconds).toBe(remainingAfterPause - 2);
  });

  it('should reset timer', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.start();
      jest.advanceTimersByTime(10000);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.remainingSeconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('should reset timer with new duration', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.reset(30);
    });

    expect(result.current.remainingSeconds).toBe(30);
  });

  it('should call onTick callback', () => {
    const onTick = jest.fn();
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60, onTick })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onTick).toHaveBeenCalledWith(59);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onTick).toHaveBeenCalledWith(58);
  });

  it('should call onComplete when timer reaches zero', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 3, onComplete })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('should set duration directly', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.setDuration(45);
    });

    expect(result.current.remainingSeconds).toBe(45);
  });

  it('should not resume if not paused', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(false);
  });
});
