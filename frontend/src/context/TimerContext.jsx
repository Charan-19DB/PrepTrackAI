import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [mode, setMode] = useState(25); // 25, 50, or custom minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [subject, setSubject] = useState('DBMS and SQL');
  const [topic, setTopic] = useState('Normalization');
  const [sessionNote, setSessionNote] = useState('');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const timerRef = useRef(null);

  // Play subtle bell sound using Web Audio API (no external asset required)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio Context not allowed or supported', e);
    }
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    setIsPaused(false);
    playBeep();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 }
    });

    const duration = mode;
    try {
      await api.post('/study-sessions', {
        subject,
        topic,
        durationMinutes: duration,
        sessionType: 'Pomodoro',
        notes: sessionNote || `Focused study block for ${topic}`
      });
      setCompletedSessionsCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to log study session automatically', err);
    }

    setSecondsLeft(mode * 60);
  };

  const startTimer = (customDurationMinutes = null) => {
    const mins = customDurationMinutes || mode;
    setMode(mins);
    setSecondsLeft(mins * 60);
    setIsActive(true);
    setIsPaused(false);
    setIsMinimized(false);
  };

  const pauseTimer = () => setIsPaused(true);
  const resumeTimer = () => setIsPaused(false);

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSecondsLeft(mode * 60);
  };

  const manualComplete = async () => {
    const elapsedSeconds = (mode * 60) - secondsLeft;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    setIsActive(false);
    setIsPaused(false);
    playBeep();

    try {
      await api.post('/study-sessions', {
        subject,
        topic,
        durationMinutes: elapsedMinutes,
        sessionType: 'Pomodoro',
        notes: sessionNote || `Manual completion of ${topic} study block`
      });
      setCompletedSessionsCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to log study session', err);
    }

    setSecondsLeft(mode * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider value={{
      mode,
      setMode,
      secondsLeft,
      isActive,
      isPaused,
      isMinimized,
      setIsMinimized,
      subject,
      setSubject,
      topic,
      setTopic,
      sessionNote,
      setSessionNote,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      manualComplete,
      formatTime,
      completedSessionsCount
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
