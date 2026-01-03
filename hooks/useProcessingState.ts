import { useState, useCallback } from 'react';

export interface ProcessingState {
  isProcessing: boolean;
  message: string;
  progress: number;
}

export function useProcessingState() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const startProcessing = useCallback((msg: string) => {
    setIsProcessing(true);
    setMessage(msg);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((msg: string, pct: number) => {
    setMessage(msg);
    setProgress(pct);
  }, []);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setMessage('');
    setProgress(0);
  }, []);

  return {
    isProcessing,
    message,
    progress,
    startProcessing,
    updateProgress,
    stopProcessing,
  };
}
