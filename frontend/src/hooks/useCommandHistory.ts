import { useState } from 'react';

export const useCommandHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (command: string) => {
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
  };

  const navigateHistory = (direction: 'up' | 'down'): string | null => {
    if (history.length === 0) return null;

    if (direction === 'up') {
      // Navigate backwards through history
      const newIndex = historyIndex === -1 
        ? history.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      return history[newIndex];
    } else {
      // Navigate forwards through history
      if (historyIndex === -1) return '';
      
      const newIndex = historyIndex === history.length - 1 
        ? -1 
        : historyIndex + 1;
      
      setHistoryIndex(newIndex);
      return newIndex === -1 ? '' : history[newIndex];
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setHistoryIndex(-1);
  };

  return {
    history,
    addToHistory,
    navigateHistory,
    clearHistory
  };
};